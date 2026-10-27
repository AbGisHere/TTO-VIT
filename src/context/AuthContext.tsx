import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { AppUser, UserRole } from '../types/technologyBrief';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isTbAdmin: boolean;
  isMasterAdmin: boolean;
  canUploadBrief: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Built-in initial master admins
const INITIAL_SUPER_ADMINS = [
  'abg.592006@gmail.com',
  'tto@vit.ac.in',
  'manish.k@vit.ac.in'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const determineRoleFromEmail = (email: string): { role: UserRole; domain: 'vitstudent' | 'vit' | 'outside' } => {
    const lowerEmail = email.toLowerCase().trim();

    if (INITIAL_SUPER_ADMINS.includes(lowerEmail)) {
      return { role: 'master_admin', domain: lowerEmail.endsWith('@vit.ac.in') ? 'vit' : 'outside' };
    }

    if (lowerEmail.endsWith('@vitstudent.ac.in')) {
      return { role: 'vit_student', domain: 'vitstudent' };
    }

    if (lowerEmail.endsWith('@vit.ac.in')) {
      return { role: 'faculty', domain: 'vit' };
    }

    return { role: 'outside_user', domain: 'outside' };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        try {
          const { role: defaultRole, domain } = determineRoleFromEmail(fbUser.email);
          let assignedRole: UserRole = defaultRole;

          // Check if custom role is stored in Firestore
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data.role) {
                assignedRole = data.role as UserRole;
              }
            } else {
              // Create user profile doc
              await setDoc(userDocRef, {
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName || '',
                photoURL: fbUser.photoURL || '',
                role: defaultRole,
                domain,
                createdAt: new Date().toISOString()
              }, { merge: true });
            }
          } catch (dbErr) {
            console.warn("Firestore user sync error (using default role):", dbErr);
          }

          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            photoURL: fbUser.photoURL || undefined,
            role: assignedRole,
            domain
          });
        } catch (e) {
          console.error("Auth state processing error:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isMasterAdmin = user?.role === 'master_admin';
  const isTbAdmin = user?.role === 'tb_admin' || isMasterAdmin;
  const canUploadBrief = isTbAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        isTbAdmin,
        isMasterAdmin,
        canUploadBrief
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
