import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFirestore, doc, onSnapshot, collection, query, where, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// The global Firebase variables are provided by the canvas environment.
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

// Define the Household and Member types for better type safety
interface Member {
  userId: string;
  name: string;
  role: 'owner' | 'member';
}

interface Household {
  id: string;
  name: string;
  members: Member[];
}

// Define the shape of the context value
interface HouseholdContextType {
  household: Household | null;
  loading: boolean;
  createHousehold: (name: string) => Promise<void>;
  addMember: (email: string) => Promise<void>;
}

// Create the context with a default value of `null`
const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

// Define the props for the provider
interface HouseholdProviderProps {
  children: ReactNode;
}

export const HouseholdProvider = ({ children }: HouseholdProviderProps) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    // Firebase initialization
    try {
      const firebaseConfig = JSON.parse(__firebase_config);
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const auth = getAuth(app);
      setDb(firestore);

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          // Attempt to sign in with the custom token if available
          if (typeof __initial_auth_token !== 'undefined') {
            try {
              await signInWithCustomToken(auth, __initial_auth_token);
            } catch (error) {
              console.error("Error signing in with custom token:", error);
            }
          }
        } else {
          // Sign in anonymously if no user is found and no custom token is available
          await signInAnonymously(auth);
        }
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  useEffect(() => {
    if (!db || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const householdRef = doc(collection(db, `/artifacts/${appId}/users/${userId}/households`), 'my-household');

    // Listen for real-time updates to the household document
    const unsubscribe = onSnapshot(householdRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHousehold({ id: docSnap.id, ...data } as Household);
      } else {
        setHousehold(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching household data:", error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [db, userId]);

  const createHousehold = async (name: string) => {
    if (!db || !userId) return;
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const householdRef = doc(collection(db, `/artifacts/${appId}/users/${userId}/households`), 'my-household');
      const newHousehold = {
        name,
        members: [{ userId, role: 'owner', name: 'You' }],
      };
      await setDoc(householdRef, newHousehold);
      console.log("Household created successfully.");
    } catch (error) {
      console.error("Error creating household:", error);
    }
  };

  const addMember = async (email: string) => {
    if (!db || !household || !userId) {
      console.error("Database or household data not available.");
      return;
    }
    try {
      // Logic to find the user by email and add them as a member would go here
      // For this example, we'll assume we can directly add them.
      const newMember: Member = { userId: `user_${Math.random().toString(36).substring(7)}`, name: email, role: 'member' };
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const householdRef = doc(db, `/artifacts/${appId}/users/${userId}/households`, 'my-household');
      await updateDoc(householdRef, {
        members: arrayUnion(newMember)
      });
      console.log("Member added successfully.");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const value = {
    household,
    loading,
    createHousehold,
    addMember,
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};

// Custom hook to use the context
export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};
