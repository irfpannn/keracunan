import { useEffect, useState } from 'react';
import { auth } from './config';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, signOut };
};
