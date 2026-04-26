import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { ConsumerApp } from './components/ConsumerApp';
import { BrandDashboard } from './components/BrandDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<any>({
    id: 'mock-user-123',
    name: 'Admin Nitesh',
    email: 'niteshsrivastav1808@gmail.com',
    eco_coins: 1450,
    role: 'brand_manager',
    created_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);

  // Mock user for Supabase logic compatibility
  const mockUser = {
    id: 'mock-user-123',
    email: 'niteshsrivastav1808@gmail.com',
    user_metadata: {
      full_name: 'Admin Nitesh',
      avatar_url: null
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="w-8 h-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  return (
    <Layout user={mockUser} profile={userProfile}>
      {userProfile?.role === 'brand_manager' || userProfile?.role === 'admin' ? (
        <BrandDashboard user={mockUser} profile={userProfile} />
      ) : (
        <ConsumerApp user={mockUser} profile={userProfile} />
      )}
    </Layout>
  );
}
