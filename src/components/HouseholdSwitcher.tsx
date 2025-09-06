import React, { useState, useEffect, useContext, createContext } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Plus,
  Users,
  Crown,
  Mail,
  Check,
  X,
  Pencil,
  Loader2,
} from "lucide-react";

// Firebase and Authentication Setup
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Context for Authentication
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const signIn = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth error:", error);
      }
    };
    signIn();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context for Household Data
const HouseholdContext = createContext(null);
const useHouseholdContext = () => useContext(HouseholdContext);

const useSubscription = () => {
  const { user, loading } = useAuth();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!user || loading) return;
    const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/subscriptions`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubscribed(!snapshot.empty);
    });
    return () => unsubscribe();
  }, [user, loading]);

  return { subscribed };
};

const useHouseholdInvites = (userId) => {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, `artifacts/${appId}/public/data/invites`),
      where("invitee_id", "==", userId)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const invitesData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const invite = docSnap.data();
        const householdDocs = await getDocs(query(collection(db, `artifacts/${appId}/public/data/households`), where("__name__", "==", invite.household_id)));
        const householdData = householdDocs.docs[0]?.data() || null;
        return { id: docSnap.id, ...invite, households: householdData };
      }));
      setPendingInvites(invitesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const sendInvite = async (email, householdId) => {
    try {
      const usersQuery = await getDocs(query(collection(db, `artifacts/${appId}/users`), where("email", "==", email)));
      if (usersQuery.empty) {
        console.error("User with this email not found.");
        return false;
      }
      const inviteeId = usersQuery.docs[0].id;
      const docRef = doc(collection(db, `artifacts/${appId}/public/data/invites`));
      await setDoc(docRef, {
        household_id: householdId,
        invitee_id: inviteeId,
        status: "pending",
        timestamp: serverTimestamp(),
      });
      return true;
    } catch (e) {
      console.error("Error sending invite: ", e);
      return false;
    }
  };

  const acceptInvite = async (inviteId) => {
    try {
      const inviteSnap = await getDocs(query(collection(db, `artifacts/${appId}/public/data/invites`), where("__name__", "==", inviteId)));
      const inviteData = inviteSnap.docs[0]?.data();
      if (inviteData && inviteData.household_id && inviteData.invitee_id) {
        const memberRef = doc(collection(db, `artifacts/${appId}/public/data/household_members`));
        await setDoc(memberRef, {
          household_id: inviteData.household_id,
          user_id: inviteData.invitee_id,
          role: "member",
          can_edit: true,
          can_view: true,
        });
        const inviteRef = doc(db, `artifacts/${appId}/public/data/invites`, inviteId);
        await updateDoc(inviteRef, { status: "accepted" });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error accepting invite: ", e);
      return false;
    }
  };

  const declineInvite = async (inviteId) => {
    try {
      const inviteRef = doc(db, `artifacts/${appId}/public/data/invites`, inviteId);
      await updateDoc(inviteRef, { status: "declined" });
      return true;
    } catch (e) {
      console.error("Error declining invite: ", e);
      return false;
    }
  };

  return { pendingInvites, sendInvite, acceptInvite, declineInvite, loading };
};

const useHouseholdMembers = (householdId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, `artifacts/${appId}/public/data/household_members`),
      where("household_id", "==", householdId)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const membersData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const member = docSnap.data();
        const profileDocs = await getDocs(query(collection(db, `artifacts/${appId}/users`), where("__name__", "==", member.user_id)));
        const profileData = profileDocs.docs[0]?.data() || {};
        return { id: docSnap.id, ...member, profiles: profileData };
      }));
      setMembers(membersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [householdId]);

  return { members, loading };
};

const HouseholdProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [userHouseholds, setUserHouseholds] = useState([]);
  const [currentHousehold, setCurrentHousehold] = useState(null);
  const [isOriginator, setIsOriginator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, `artifacts/${appId}/public/data/household_members`),
      where("user_id", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const memberDocs = snapshot.docs.map(d => d.data());
      const householdPromises = memberDocs.map(async (member) => {
        const householdDocs = await getDocs(query(collection(db, `artifacts/${appId}/public/data/households`), where("__name__", "==", member.household_id)));
        const householdData = householdDocs.docs[0]?.data();
        if (householdData) {
          return { id: householdDocs.docs[0]?.id, ...householdData, member_role: member.role };
        }
        return null;
      });
      const households = (await Promise.all(householdPromises)).filter(Boolean);
      setUserHouseholds(households);
      
      const storedHouseholdId = localStorage.getItem('currentHouseholdId');
      const selectedHousehold = households.find(h => h.id === storedHouseholdId) || households[0];
      setCurrentHousehold(selectedHousehold);
      setIsOriginator(selectedHousehold?.originator_id === user.uid);
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, authLoading]);

  const switchHousehold = (householdId) => {
    const newHousehold = userHouseholds.find(h => h.id === householdId);
    if (newHousehold) {
      setCurrentHousehold(newHousehold);
      setIsOriginator(newHousehold.originator_id === user.uid);
      localStorage.setItem('currentHouseholdId', newHousehold.id);
    }
  };

  const createHousehold = async (name) => {
    if (!user) return false;
    try {
      const householdRef = doc(collection(db, `artifacts/${appId}/public/data/households`));
      await setDoc(householdRef, {
        name,
        originator_id: user.uid,
        created_at: serverTimestamp(),
      });
      const memberRef = doc(collection(db, `artifacts/${appId}/public/data/household_members`));
      await setDoc(memberRef, {
        household_id: householdRef.id,
        user_id: user.uid,
        role: "originator",
        can_edit: true,
        can_view: true,
      });
      return true;
    } catch (e) {
      console.error("Error creating household: ", e);
      return false;
    }
  };

  const renameHousehold = async (newName) => {
    if (!currentHousehold || !isOriginator) return false;
    try {
      const householdRef = doc(db, `artifacts/${appId}/public/data/households`, currentHousehold.id);
      await updateDoc(householdRef, { name: newName });
      return true;
    } catch (e) {
      console.error("Error renaming household: ", e);
      return false;
    }
  };

  return (
    <HouseholdContext.Provider
      value={{
        currentHousehold,
        userHouseholds,
        isOriginator,
        loading,
        switchHousehold,
        createHousehold,
        renameHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

// Main Component
interface HouseholdSwitcherProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HouseholdSwitcher({ className, open, onOpenChange }: HouseholdSwitcherProps) {
  const { user } = useAuth();
  
  // Household switching, listing, creating, renaming
  const {
    currentHousehold,
    userHouseholds,
    isOriginator,
    loading: householdLoading,
    switchHousehold,
    createHousehold,
    renameHousehold,
  } = useHouseholdContext();

  // Invites
  const {
    pendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading: invitesLoading,
  } = useHouseholdInvites(user?.uid);

  // Members
  const {
    members: householdMembers,
    loading: membersLoading,
  } = useHouseholdMembers(currentHousehold?.id);

  // Subscription
  const { subscribed } = useSubscription();

  // UI State
  const [isOpen, setIsOpen] = useState(open || false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Handle household creation
  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    setIsCreating(true);
    try {
      const success = await createHousehold(newHouseholdName.trim());
      if (success) {
        setNewHouseholdName("");
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create household:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle member invite
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentHousehold?.id) return;
    setIsInviting(true);
    const ok = await sendInvite(inviteEmail.trim(), currentHousehold.id);
    if (ok) setInviteEmail("");
    setIsInviting(false);
  };

  // Handle start renaming
  const startRenaming = () => {
    setEditableName(currentHousehold?.name || "");
    setRenaming(true);
  };

  // Handle save rename
  const handleRename = async () => {
    if (
      !editableName.trim() ||
      editableName.trim() === currentHousehold?.name
    ) {
      setRenaming(false);
      return;
    }
    setIsRenaming(true);
    const ok = await renameHousehold(editableName.trim());
    setIsRenaming(false);
    if (ok) {
      setRenaming(false);
    }
  };

  // Loading handling
  const anyLoading =
    householdLoading || invitesLoading || membersLoading || isCreating || isInviting || isRenaming;

  // The main component's render logic
  return (
    <AuthProvider>
      <HouseholdProvider>
        <Dialog open={open !== undefined ? open : isOpen} onOpenChange={onOpenChange || setIsOpen}>
          {!open && (
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className={className}>
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  <span>
                    {householdLoading
                      ? "Loading..."
                      : currentHousehold?.name || "No Household"}
                  </span>
                  {isOriginator && <Crown className="h-3 w-3 ml-1" />}
                </div>
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Household Management</DialogTitle>
            </DialogHeader>

            {/* Loading spinner */}
            {anyLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin mr-2" /> Loading...
              </div>
            )}

            {!anyLoading && (
              <div className="space-y-6">
                {/* Current Household & Rename - FORCED TO SHOW FOR TESTING */}
                <div>
                  <h3 className="font-medium mb-2">Current Household</h3>
                  <Card className="border-primary/20">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        {!renaming ? (
                          <div className="flex items-center">
                            <span className="font-medium">{currentHousehold?.name || "---"}</span>
                            {isOriginator && (
                              <Crown className="h-4 w-4 text-amber-500 ml-2" />
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editableName}
                              onChange={e => setEditableName(e.target.value)}
                              className="w-auto"
                              disabled={isRenaming}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleRename}
                              disabled={isRenaming}
                            >
                              {isRenaming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRenaming(false)}
                              disabled={isRenaming}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {householdMembers.length} member
                          {householdMembers.length !== 1 ? "s" : ""}
                          {isOriginator && " • You are the owner"}
                        </p>
                      </div>
                      {isOriginator && !renaming && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-2"
                          onClick={startRenaming}
                          aria-label="Rename household"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Switch Household - FORCED TO SHOW FOR TESTING */}
                <div>
                  <h3 className="font-medium mb-2">Switch Household</h3>
                  <Select
                    value={currentHousehold?.id || ""}
                    onValueChange={(id) => {
                      switchHousehold(id);
                      if (onOpenChange) onOpenChange(false);
                      else setIsOpen(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select household" />
                    </SelectTrigger>
                    <SelectContent>
                      {userHouseholds.map(h => (
                        <SelectItem key={h.id} value={h.id}>
                          <span>{h.name}</span>
                          {h.originator_id === user?.uid && (
                            <Crown className="h-3 w-3 text-amber-500 ml-1" />
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create New Household */}
                <div>
                  <h3 className="font-medium mb-2">Create New Household</h3>
                  {!subscribed && userHouseholds.length >= 1 ? (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-3">
                        <p className="text-sm text-amber-800">
                          Premium subscription required to create additional households.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Household name"
                        value={newHouseholdName}
                        onChange={e => setNewHouseholdName(e.target.value)}
                        disabled={isCreating}
                      />
                      <Button
                        onClick={handleCreateHousehold}
                        disabled={!newHouseholdName.trim() || isCreating}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {isCreating ? "Creating..." : "Create Household"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Invite Members - FORCED TO SHOW FOR TESTING */}
                <div>
                  <h3 className="font-medium mb-2">Invite Members</h3>
                  {!subscribed ? (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-3">
                        <p className="text-sm text-amber-800">
                          Premium subscription required to invite members.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        disabled={isInviting}
                      />
                      <Button
                        onClick={handleInvite}
                        disabled={!inviteEmail.trim() || isInviting}
                        className="w-full"
                        size="sm"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {isInviting ? "Sending..." : "Send Invite"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pending Invites - FORCED TO SHOW FOR TESTING */}
                <div>
                  <h3 className="font-medium mb-2">Pending Invitations</h3>
                  <div className="space-y-2">
                    {pendingInvites.length > 0 ? (
                      pendingInvites.map(invite => (
                        <Card key={invite.id} className="border-blue-200 bg-blue-50">
                          <CardContent className="p-3">
                            <p className="text-sm mb-2">
                              Invited to household <span className="font-semibold">{(invite as any).households?.name || 'Unknown Household'}</span>
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => acceptInvite(invite.id)}
                                className="flex-1"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => declineInvite(invite.id)}
                                className="flex-1"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No pending invites.</p>
                    )}
                  </div>
                </div>

                {/* Household Members - FORCED TO SHOW FOR TESTING */}
                <div>
                  <h3 className="font-medium mb-2">Members</h3>
                  <div className="space-y-2">
                    {householdMembers.length > 0 ? (
                      householdMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {member.profiles?.first_name && member.profiles?.last_name
                                ? `${member.profiles.first_name} ${member.profiles.last_name}`
                                : member.profiles?.email || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.role === "originator" ? "Owner" : "Member"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {member.role === "originator" && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                            {member.can_edit && (
                              <Badge variant="secondary" className="text-xs">
                                Edit
                              </Badge>
                            )}
                            {member.can_view && (
                              <Badge variant="outline" className="text-xs">
                                View
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No members in this household.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>
      </HouseholdProvider>
    </AuthProvider>
  );
}
