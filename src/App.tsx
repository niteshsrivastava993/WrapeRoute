import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { ConsumerApp } from './components/ConsumerApp';
import { BrandDashboard } from './components/BrandDashboard';
import { Auth } from './components/Auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          const isBrandManager = firebaseUser.email === 'niteshsrivastav1808@gmail.com';
          const newProfile = {
            name: firebaseUser.displayName || 'Eco Warrior',
            email: firebaseUser.email,
            ecoCoins: 0,
            role: isBrandManager ? 'brand_manager' : 'consumer',
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(userRef, newProfile);
            // Since serverTimestamp() won't be in the local object immediately for the state
            // we manually set a placeholder for the local state or wait for snapshot if we used one
            setUserProfile({ ...newProfile, createdAt: new Date() });
          } catch (e) {
            console.error("Error creating profile:", e);
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout user={user} profile={userProfile}>
      {userProfile?.role === 'brand_manager' || userProfile?.role === 'admin' ? (
        <BrandDashboard />
      ) : (
        <ConsumerApp user={user} profile={userProfile} />
      )}
    </Layout>
  );
}
