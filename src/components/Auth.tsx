import React from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Zap, Globe } from 'lucide-react';

export function Auth() {
  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg overflow-hidden relative selection:bg-emerald/30">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm premium-card p-12 relative z-10 text-center bg-surface/50 backdrop-blur-2xl"
      >
        <div className="w-16 h-16 bg-emerald mx-auto rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald/20 rotate-3">
          <Zap className="w-8 h-8 text-bg" />
        </div>
        
        <h1 className="text-3xl font-semibold tracking-tight mb-2">WrapRoute AI</h1>
        <p className="text-xs text-muted font-medium mb-12">Plastic waste recovery & EPR compliance platform.</p>

        <button 
          onClick={login}
          className="w-full py-4 bg-white text-bg font-bold text-sm rounded-xl shadow-xl hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-3 mb-8"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        <div className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center gap-2 justify-center text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Secured</span>
          </div>
          <p className="text-[10px] font-medium text-muted leading-relaxed max-w-[240px] mx-auto opacity-60">
            Automating FMCG waste accountability through vision-linked logistics and regional auditing.
          </p>
        </div>
      </motion.div>

      <footer className="absolute bottom-10 w-full flex justify-between px-10 pointer-events-none opacity-40 font-mono text-[9px] uppercase tracking-widest text-muted">
        <span>WrapRoute Operations v2.4</span>
        <span>Node: ASIA-SOUTH-1</span>
      </footer>
    </div>
  );
}
