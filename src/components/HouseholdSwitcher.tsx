import React, { useState, createContext, useContext } from 'react';
import {
  Home,
  Plus,
  Crown,
  Mail,
  Check,
  X,
  Pencil,
  Loader2,
} from 'lucide-react';

// --- Shadcn UI Mock Components ---
// These are simplified, functional versions of the shadcn/ui components
// to make the app runnable in a single file.

const Button = ({ children, onClick, className = '', variant = 'default', size = 'default', disabled = false, 'aria-label': ariaLabel }) => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  const sizeClasses = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  };
  const variantClasses = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Dialog = ({ children, open, onOpenChange }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? '' : 'hidden'}`}>
    <div
      className="fixed inset-0 bg-black/80"
      onClick={() => onOpenChange(false)}
    />
    <div className="relative z-50 rounded-lg bg-background p-6 shadow-lg sm:max-w-lg w-full">
      {children}
    </div>
  </div>
);

const DialogTrigger = ({ asChild, children, onClick }) => {
  const [child, ...rest] = React.Children.toArray(children);
  return React.cloneElement(child, { onClick });
};

const DialogContent = ({ children, className = '', onOpenAutoFocus }) => {
  const handleAutoFocus = (e) => {
    if (onOpenAutoFocus) {
      onOpenAutoFocus(e);
    } else {
      e.preventDefault();
    }
  };
  return (
    <div className={className} onFocus={handleAutoFocus}>
      {children}
    </div>
  );
};

const DialogHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>
    {children}
  </div>
);

const DialogTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h2>
);

const Input = ({ type = 'text', placeholder, value, onChange, className = '', disabled = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

// Corrected Select components
const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const trigger = React.Children.toArray(children).find(c => c.type === SelectTrigger);
  const content = React.Children.toArray(children).find(c => c.type === SelectContent);

  const handleItemClick = (newValue) => {
    onValueChange(newValue);
    setIsOpen(false);
  };

  const contentWithProps = content ? React.cloneElement(content, { onSelect: handleItemClick }) : null;

  return (
    <div className="relative">
      {trigger && React.cloneElement(trigger, { onClick: () => setIsOpen(!isOpen) })}
      {isOpen && (
        <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 w-full">
          {contentWithProps}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
  >
    {children}
  </button>
);

const SelectValue = ({ placeholder }) => (
  <span className="pointer-events-none">{placeholder}</span>
);

const SelectContent = ({ children, onSelect }) => (
  <div className="w-full">
    {React.Children.map(children, child => React.cloneElement(child, { onSelect }))}
  </div>
);

const SelectItem = ({ children, value, onSelect, className = '' }) => (
  <button
    onClick={() => onSelect(value)}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children, className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-primary hover:bg-primary/80 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    outline: 'text-foreground',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Separator = ({ className = '' }) => (
  <div className={`shrink-0 bg-border h-[1px] w-full ${className}`} />
);

// --- Mock Context and Hooks ---
const HouseholdContext = createContext(null);
const useHouseholdContext = () => useContext(HouseholdContext);

const useAuth = () => ({ user: { id: 'user123', email: 'owner@example.com' } });
const useSubscription = () => ({ subscribed: true });

const useHouseholdInvites = (userId) => {
  const [pendingInvites, setPendingInvites] = useState([
    { id: 'invite1', household_id: 'household2', households: { name: 'The Smith Family' } },
  ]);
  const [loading, setLoading] = useState(false);

  const sendInvite = async (email, householdId) => {
    console.log(`Sending invite to ${email} for household ${householdId}`);
    return true;
  };

  const acceptInvite = async (inviteId) => {
    console.log(`Accepting invite ${inviteId}`);
    setPendingInvites(pendingInvites.filter(i => i.id !== inviteId));
    window.location.reload();
  };

  const declineInvite = async (inviteId) => {
    console.log(`Declining invite ${inviteId}`);
    setPendingInvites(pendingInvites.filter(i => i.id !== inviteId));
  };

  return { pendingInvites, sendInvite, acceptInvite, declineInvite, loading };
};

const useHouseholdMembers = (householdId) => {
  const [members, setMembers] = useState([
    { id: 'member1', profiles: { first_name: 'John', last_name: 'Doe' }, role: 'originator' },
    { id: 'member2', profiles: { first_name: 'Jane', last_name: 'Doe' }, role: 'member', can_edit: true },
    { id: 'member3', profiles: { email: 'guest@example.com' }, role: 'member', can_view: true },
  ]);
  const [loading, setLoading] = useState(false);
  return { members, loading };
};

// --- The HouseholdSwitcher Component (from your code) ---

function HouseholdSwitcher({ className, open, onOpenChange }) {
  const { user } = useAuth();
  
  const {
    currentHousehold,
    userHouseholds,
    isOriginator,
    loading: householdLoading,
    switchHousehold,
    createHousehold,
    renameHousehold,
  } = useHouseholdContext();

  const {
    pendingInvites,
    sendInvite,
    acceptInvite,
    declineInvite,
    loading: invitesLoading,
  } = useHouseholdInvites(user?.id);

  const {
    members: householdMembers,
    loading: membersLoading,
  } = useHouseholdMembers(currentHousehold?.id);

  const { subscribed } = useSubscription();

  const [isOpen, setIsOpen] = useState(open || false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

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

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentHousehold?.id) return;
    setIsInviting(true);
    const ok = await sendInvite(inviteEmail.trim(), currentHousehold.id);
    if (ok) setInviteEmail("");
    setIsInviting(false);
  };

  const startRenaming = () => {
    setEditableName(currentHousehold?.name || "");
    setRenaming(true);
  };

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

  const anyLoading =
    householdLoading || invitesLoading || membersLoading || isCreating || isInviting || isRenaming;

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={onOpenChange || setIsOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              <span>{currentHousehold?.name || "No Household"}</span>
              {isOriginator && <Crown className="h-3 w-3 ml-1" />}
            </div>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Household Management</DialogTitle>
        </DialogHeader>

        {anyLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        )}

        {!anyLoading && (
          <div className="space-y-6">
            {currentHousehold && (
              <div>
                <h3 className="font-medium mb-2">Current Household</h3>
                <Card className="border-primary/20">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      {!renaming ? (
                        <div className="flex items-center">
                          <span className="font-medium">{currentHousehold.name}</span>
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
            )}

            {/* Always show the dropdown for consistency */}
            <div>
              <h3 className="font-medium mb-2">Switch Household</h3>
              <Select
                value={currentHousehold?.id || ""}
                onValueChange={switchHousehold}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select household" />
                </SelectTrigger>
                <SelectContent>
                  {userHouseholds.map(h => (
                    <SelectItem key={h.id} value={h.id}>
                     <span>{h.name}</span>
                      {h.originator_id === user?.id && (
                        <Crown className="h-3 w-3 text-amber-500 ml-1" />
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {isOriginator && currentHousehold && (
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
            )}

            {pendingInvites.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Pending Invitations</h3>
                <div className="space-y-2">
                  {pendingInvites.map(invite => (
                    <Card key={invite.id} className="border-blue-200 bg-blue-50">
                      <CardContent className="p-3">
                        <p className="text-sm mb-2">
                          Invited to household <span className="font-semibold">{(invite).households?.name || 'Unknown Household'}</span>
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
                  ))}
                </div>
              </div>
            )}

            {householdMembers.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Members</h3>
                <div className="space-y-2">
                  {householdMembers.map(member => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Main App Component to display the UI ---
export default function App() {
  const [currentHousehold, setCurrentHousehold] = useState({
    id: 'household1',
    name: 'My Awesome Household',
    originator_id: 'user123'
  });

  const [userHouseholds, setUserHouseholds] = useState([
    currentHousehold,
    { id: 'household2', name: 'The Smith Family', originator_id: 'user456' }
  ]);

  const switchHousehold = (id) => {
    setCurrentHousehold(userHouseholds.find(h => h.id === id));
    console.log(`Switched to household ID: ${id}`);
  };

  const createHousehold = async (name) => {
    const newHousehold = { id: `household${userHouseholds.length + 1}`, name, originator_id: 'user123' };
    setUserHouseholds(prev => [...prev, newHousehold]);
    setCurrentHousehold(newHousehold);
    console.log(`Creating new household: ${name}`);
    return true;
  };
  
  const renameHousehold = async (name) => {
    console.log(`Renaming household to: ${name}`);
    setCurrentHousehold(prev => ({...prev, name}));
    return true;
  };
  
  const isOriginator = currentHousehold.originator_id === 'user123';
  const householdLoading = false;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4">
      <style>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #f3f4f6;
          color: #1f2937;
        }
        .dark body {
          background-color: #111827;
          color: #e5e7eb;
        }
        .bg-background { background-color: #f8fafc; }
        .text-card-foreground { color: #1e293b; }
        .border-input { border-color: #e2e8f0; }
        .focus-visible\:ring-1:focus-visible { box-shadow: 0 0 0 1px #93c5fd; }
        .rounded-md { border-radius: 0.375rem; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .bg-primary { background-color: #3b82f6; }
        .text-primary-foreground { color: #f8fafc; }
        .hover\:bg-primary\/90:hover { background-color: #2563eb; }
        .bg-secondary { background-color: #f1f5f9; }
        .text-secondary-foreground { color: #1e293b; }
        .hover\:bg-secondary\/80:hover { background-color: #e2e8f0; }
        .bg-accent { background-color: #eef2ff; }
        .text-accent-foreground { color: #1e293b; }
        .border-primary\/20 { border-color: rgba(59, 130, 246, 0.2); }
        .text-amber-500 { color: #f59e0b; }
        .text-muted-foreground { color: #64748b; }
        .bg-amber-50 { background-color: #fffbeb; }
        .border-amber-200 { border-color: #fde68a; }
        .text-amber-800 { color: #92400e; }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-blue-200 { border-color: #bfdbfe; }
      `}</style>
      <HouseholdContext.Provider value={{
        currentHousehold,
        userHouseholds,
        isOriginator,
        loading: householdLoading,
        switchHousehold,
        createHousehold,
        renameHousehold,
      }}>
        <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg flex flex-col items-center space-y-4 dark:bg-gray-800 dark:shadow-xl transition-all duration-300">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Household App</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Click the button below to manage your households.
          </p>
          <HouseholdSwitcher />
        </div>
      </HouseholdContext.Provider>
    </div>
  );
}
