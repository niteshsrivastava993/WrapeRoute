import React from 'react';
import { LogOut, User as UserIcon, Menu, Globe, Shield } from 'lucide-react';
import { auth } from '../lib/firebase';

export function Layout({ children, user, profile }: { children: React.ReactNode, user: any, profile: any }) {
  return (
    <div className="min-h-screen bg-bg text-white flex flex-col font-sans transition-colors duration-500">
      <main className="flex-1 relative overflow-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
