import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, googleProvider, db, functions } from '../firebase/config';
import { AppUser, UserRole } from '../types/technologyBrief';
import { isMasterAdminEmail, TB_ADMINS_COLLECTION } from '../utils/admins';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const domainFromEmail = (email: string): AppUser['domain'] => {
    if (email.endsWith('@vitstudent.ac.in')) return 'vitstudent';
    if (email.endsWith('@vit.ac.in')) return 'vit';
    return 'outside';
  };

  const defaultRoleFor = (domain: AppUser['domain']): UserRole =>
    domain === 'vitstudent' ? 'vit_student' : domain === 'vit' ? 'faculty' : 'outside_user';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        const email = fbUser.email.toLowerCase().trim();
        const domain = domainFromEmail(email);
        let role: UserRole = defaultRoleFor(domain);

        // Roles are never written by the client; rules enforce the same checks server-side.
        if (isMasterAdminEmail(email)) {
          role = 'master_admin';
        } else {
          try {
            const adminSnap = await getDoc(doc(db, TB_ADMINS_COLLECTION, email));
            if (adminSnap.exists()) role = 'tb_admin';
          } catch (err) {
            console.warn('TB admin lookup failed (using default role):', err);
          }

          // Storage rules check the ttoAdmin token claim; make sure it matches the list.
          // Runs in the background so sign-in isn't held up by the function call.
          const token = await fbUser.getIdTokenResult();
          if (!!token.claims.ttoAdmin !== (role === 'tb_admin')) {
            httpsCallable(functions, 'syncTtoAdminClaim')()
              .then(() => fbUser.getIdToken(true))
              .catch(err => console.warn('TB admin claim sync failed:', err));
          }
        }

        // Profile record for the admin page; carries no role.
        setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          email,
          displayName: fbUser.displayName || '',
          photoURL: fbUser.photoURL || '',
          lastSignInAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.warn('User profile sync failed:', err));

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
          photoURL: fbUser.photoURL || undefined,
          role,
          domain
        });
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
