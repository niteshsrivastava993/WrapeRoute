import React, { useState, useEffect } from 'react';
import { 
  Zap, Recycle, Truck, Database, ShieldCheck, 
  Map as MapIcon, ChevronRight, Activity, Beaker,
  CheckCircle2, Navigation, CreditCard, Wallet, 
  Plus, X, RefreshCcw, Camera, Loader2, Bell,
  IndianRupee, LayoutDashboard, Settings as SettingsIcon, Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Gemini AI Initialization ---
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// --- Supabase Table Names ---
const TABLES = {
  BINS: 'bins',
  TRANSACTIONS: 'transactions',
  DISPATCHES: 'dispatches',
  STATS: 'stats'
};

// --- Mock Data Constants ---

const CHART_DATA = [
  { day: 'Mon', tonnage: 4.2 },
  { day: 'Tue', tonnage: 5.1 },
  { day: 'Wed', tonnage: 4.8 },
  { day: 'Thu', tonnage: 6.2 },
  { day: 'Fri', tonnage: 5.5 },
  { day: 'Sat', tonnage: 7.1 },
  { day: 'Sun', tonnage: 6.8 },
];

const INITIAL_BINS = [
  { id: 'BIN-ALPHA-01', location: 'Cyber City, Gurgaon', capacity: 82, status: 'Active' },
  { id: 'BIN-BETA-02', location: 'Electronic City, BLR', capacity: 45, status: 'Active' },
  { id: 'BIN-GAMMA-03', location: 'Bandra West, MUM', capacity: 74, status: 'Active' },
  { id: 'BIN-DELTA-04', location: 'Salt Lake, KOL', capacity: 12, status: 'Active' },
];

const INITIAL_FLEET = [
  { id: 'AUT-TRUCK-88', driver: 'AI CORE-01', destination: 'Recycle Hub A', status: 'En Route', eta: '8m' },
];

// --- Components ---

const MetricCard = ({ title, value, unit, icon: Icon, trend, color = "emerald" }: any) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    className="premium-card p-6 bg-surface/40 backdrop-blur-xl border-white/5 relative overflow-hidden group"
  >
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-2 bg-${color}/10 rounded-xl text-${color}`}>
        <Icon size={20} />
      </div>
      {trend && <span className="text-[10px] font-black text-emerald bg-emerald/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black tracking-tight">{value}</h3>
        <span className="text-xs text-muted font-bold">{unit}</span>
      </div>
    </div>
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-${color}`}>
      <Icon size={80} />
    </div>
  </motion.div>
);

const ViewScanner = ({ onScanComplete, isOpen, onClose }: any) => {
  const [phase, setPhase] = useState('idle'); // idle -> scanning -> results

  useEffect(() => {
    if (isOpen) {
      setPhase('scanning');
      const timer = setTimeout(() => setPhase('results'), 2500);
      return () => clearTimeout(timer);
    } else {
      setPhase('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
      <div className="w-full max-w-lg relative">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="premium-card bg-[#0E1012] aspect-square flex flex-col items-center justify-center relative overflow-hidden border-white/10 rounded-[40px]">
          {phase === 'scanning' ? (
            <div className="space-y-6 text-center">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-2 border-emerald/30 rounded-3xl animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald shadow-[0_0_20px_#10B981] animate-scan" />
                <Camera className="w-full h-full p-12 text-emerald/20" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-emerald" />
                  Gemini 1.5 Vision Analysis
                </h4>
                <p className="text-xs text-muted font-mono tracking-widest uppercase animate-pulse">Running Neural Brand Matching...</p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald/10">
                <CheckCircle2 className="w-12 h-12 text-emerald" />
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-2">Lays MLP Detected!</h4>
                <p className="text-sm text-emerald font-bold tracking-widest uppercase">Verification Status: AUTHENTICATED</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-[10px] text-muted uppercase font-black mb-1">Rewards Distribution</p>
                <p className="text-2xl font-black text-emerald">+15 Eco-Coins</p>
              </div>
              <button 
                onClick={onScanComplete}
                className="w-full max-w-[200px] py-4 bg-emerald text-bg font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald/20 hover:scale-105 transition-all"
              >
                Claim & Update
              </button>
            </motion.div>
          )}

          {/* Tech Overlays */}
          <div className="absolute top-6 left-6 text-[8px] font-mono text-emerald/40 space-y-1">
            <p>LAT: 28.4595° N</p>
            <p>LON: 77.0266° E</p>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-20">
            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-white" />
            </div>
            <p className="text-[8px] font-mono">ENCRYPTED_STREAM_V4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ onReset, settings, setSettings }: any) => {
  return (
    <div className="space-y-12">
      <div className="premium-card p-10 bg-surface/30 border-white/5 max-w-2xl">
        <h3 className="text-2xl font-black mb-8 tracking-tight">System Preferences</h3>
        
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Agentic Dispatch Threshold</label>
              <span className="text-xl font-black text-emerald">{settings.threshold}%</span>
            </div>
            <input 
              type="range" 
              min="50" max="100" 
              value={settings.threshold} 
              onChange={(e) => setSettings({ ...settings, threshold: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald"
            />
            <p className="text-[10px] text-muted font-medium">Automatic fleet deployment when bin capacity exceeds this value.</p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Gemini Vision Strictness</label>
            <select 
              value={settings.strictness}
              onChange={(e) => setSettings({ ...settings, strictness: e.target.value })}
              className="w-full bg-[#090A0B] border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald transition-colors outline-none"
            >
              <option>Low (Demo Mode)</option>
              <option>Medium (Balanced)</option>
              <option>High (Strict MLP Verification)</option>
            </select>
            <p className="text-[10px] text-muted font-medium">Adjust artificial intelligence precision for material detection.</p>
          </div>
        </div>
      </div>

      <div className="premium-card p-10 bg-red-500/5 border-red-500/20 max-w-2xl shadow-2xl shadow-red-500/5">
        <h3 className="text-2xl font-black text-red-500 mb-4 tracking-tight">Danger Zone</h3>
        <p className="text-sm text-muted font-medium mb-8">Resetting will clear all accumulated Eco-Coins, bin capacities, and fleet history. This action cannot be undone.</p>
        <button 
          onClick={onReset}
          className="px-8 py-4 bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20"
        >
          Reset Prototype Data
        </button>
      </div>
    </div>
  );
};

const MobileNavNode = ({ activeTab, setActiveTab, isOpen, onClose, coins }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-80 bg-[#090A0B] border-r border-white/10 z-[70] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald rounded-xl flex items-center justify-center shadow-2xl shadow-emerald/20">
                  <Zap className="w-6 h-6 text-bg fill-bg" />
                </div>
                <h1 className="text-xl font-black tracking-tight">WrapRoute</h1>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            <nav className="space-y-2 flex-1">
              {[
                { id: 'Overview', icon: LayoutDashboard },
                { id: 'Smart Bins', icon: MapIcon },
                { id: 'Fleet Routing', icon: Truck },
                { id: 'EPR Ledger', icon: Database },
                { id: 'Settings', icon: SettingsIcon },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-bold transition-all relative ${
                    activeTab === item.id ? 'text-white' : 'text-muted'
                  }`}
                >
                  {activeTab === item.id && (
                    <motion.div layoutId="mobile-nav-pill" className="absolute inset-0 bg-emerald/10 border border-emerald/20 rounded-3xl" />
                  )}
                  <item.icon size={20} className={activeTab === item.id ? 'text-emerald' : 'text-muted'} />
                  <span className="relative z-10">{item.id}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto">
               <div className="p-8 bg-emerald/5 border border-emerald/10 rounded-[32px] text-center shadow-inner">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] mb-2">Eco-Wallet</p>
                  <p className="text-4xl font-black text-emerald tracking-tighter">{coins}</p>
                  <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-black text-emerald/60 uppercase">
                    <IndianRupee size={10} />
                    <span>Coins Ready</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export function BrandDashboard({ user, profile }: any) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [settings, setSettings] = useState({
    threshold: 90,
    strictness: 'Low (Demo Mode)'
  });
  
  const [loading, setLoading] = useState(true);
  const [usingFailsafe, setUsingFailsafe] = useState(false);

  // Robust State linked to Supabase
  const [stats, setStats] = useState({
    coins: 142,
    totalDiverted: 1402.0,
    recovery: 64.2,
    penaltyAvoided: 8.52
  });

  const [bins, setBins] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Stats
      const { data: statsData, error: statsError } = await supabase.from(TABLES.STATS).select('*').single();
      if (statsError) throw statsError;

      if (statsData) {
        setStats({
          coins: statsData.total_coins || 0,
          totalDiverted: statsData.total_diverted || 0,
          recovery: statsData.epr_progress || 0,
          penaltyAvoided: statsData.penalty_avoided || 0
        });
      }

      // 2. Fetch Bins
      const { data: binsData, error: binsError } = await supabase.from(TABLES.BINS).select('*').order('id');
      if (binsError) throw binsError;
      if (binsData) setBins(binsData);

      // 3. Fetch Fleet
      const { data: fleetData, error: fleetError } = await supabase.from(TABLES.DISPATCHES).select('*').order('id');
      if (fleetError) throw fleetError;
      if (fleetData) setFleet(fleetData);

      // 4. Fetch Ledger (Transactions)
      const { data: txnData, error: txnError } = await supabase.from(TABLES.TRANSACTIONS).select('*').order('created_at', { ascending: false });
      if (txnError) throw txnError;
      if (txnData) setLedger(txnData);

      setUsingFailsafe(false);
    } catch (error) {
      console.warn('Supabase fetch failed, enabling failsafe mock data:', error);
      setUsingFailsafe(true);
      // Populate with mocks
      setBins(INITIAL_BINS);
      setFleet(INITIAL_FLEET);
      setLedger([
        { id: 'TXN-O92', entity: 'Nestle India', type: 'Credit Purchase', value: '₹12.4L', status: 'Verified' },
        { id: 'TXN-O88', entity: 'Citizen #882', type: 'Eco-Reward', value: '15 Coins', status: 'Verified' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // --- REAL-TIME SUBSCRIPTIONS ---
    const binsChannel = supabase
      .channel('bins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.BINS }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBins(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setBins(prev => prev.map(b => b.id === payload.new.id ? payload.new : b));
        } else if (payload.eventType === 'DELETE') {
          setBins(prev => prev.filter(b => b.id !== payload.old.id));
        }
      })
      .subscribe();

    const statsChannel = supabase
      .channel('stats-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLES.STATS }, (payload) => {
        setStats({
          coins: payload.new.total_coins,
          totalDiverted: payload.new.total_diverted,
          recovery: payload.new.epr_progress,
          penaltyAvoided: payload.new.penalty_avoided
        });
      })
      .subscribe();

    const txnChannel = supabase
      .channel('txn-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLES.TRANSACTIONS }, (payload) => {
        setLedger(prev => [payload.new, ...prev]);
      })
      .subscribe();

    const dispatchChannel = supabase
      .channel('dispatch-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DISPATCHES }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setFleet(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setFleet([]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(binsChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(txnChannel);
      supabase.removeChannel(dispatchChannel);
    };
  }, []);

  const resetAllData = async () => {
    try {
      if (!usingFailsafe) {
        // Clear Supabase Tables
        await supabase.from(TABLES.TRANSACTIONS).delete().neq('id', 'placeholder');
        await supabase.from(TABLES.DISPATCHES).delete().neq('id', 'placeholder');
        await supabase.from(TABLES.BINS).update({ capacity: 0 }).neq('id', 'placeholder');
        await supabase.from(TABLES.STATS).update({ 
          total_coins: 0, 
          total_diverted: 0, 
          epr_progress: 0, 
          penalty_avoided: 0 
        }).eq('id', 1);
      }

      // Local Reset for safety
      setStats({
        coins: 0,
        totalDiverted: 0,
        recovery: 0,
        penaltyAvoided: 0
      });
      setBins(bins.map(b => ({ ...b, capacity: 0 })));
      setFleet([]);
      setLedger([]);
      setNotifications([]);
      setActiveTab('Overview');
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const deployNewBin = async () => {
    const newId = `BIN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newBin = {
      id: newId,
      location: 'New Site (Auto-Deployed)',
      capacity: 0,
      status: 'Active'
    };

    if (usingFailsafe) {
      setBins(prev => [...prev, newBin]);
    } else {
      await supabase.from(TABLES.BINS).insert(newBin);
    }
  };

  const buyEprCredits = async () => {
    const txn = {
      id: `TXN-${Math.floor(Math.random() * 900) + 100}`,
      entity: 'Nestle India (Self)',
      type: 'Credit Purchase',
      value: '₹5.0L',
      status: 'Verified',
      created_at: new Date().toISOString()
    };

    if (usingFailsafe) {
      setLedger(prev => [txn, ...prev]);
    } else {
      await supabase.from(TABLES.TRANSACTIONS).insert(txn);
    }
  };

  const handleScanAction = async () => {
    setScannerOpen(false);
    
    // Simulations of AI Processing State
    const toastId = `SCAN-${Date.now()}`;
    const processingMsg = "GEMINI_VISION: Analyzing material composition...";
    setNotifications(prev => [processingMsg, ...prev]);

    if (usingFailsafe) {
       // Local Mock Update
       setStats(prev => ({
         ...prev,
         coins: prev.coins + 15,
         totalDiverted: prev.totalDiverted + 0.5,
         recovery: Math.min(100, prev.recovery + 0.1)
       }));
       const randIdx = Math.floor(Math.random() * bins.length);
       if (bins[randIdx]) {
         const updatedBins = [...bins];
         updatedBins[randIdx].capacity = Math.min(100, updatedBins[randIdx].capacity + 15);
         setBins(updatedBins);
       }
       return;
    }

    try {
      // --- Real-time AI Validation Simulation ---
      // In a production app, we would send the image buffer to Gemini here.
      // const result = await model.generateContent(['Detect if this is plastic waste...', imagePart]);
      // const text = result.response.text();
      
      // Simulating a short delay for the "Agentic AI" feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNotifications(prev => ["AI_VERIFIED: MLP (Multi-Layer Plastic) detected. Verification complete.", ...prev]);

      // 1. Update Supabase Stats
      const newCoins = stats.coins + 15;
      const newDiverted = stats.totalDiverted + 0.5;
      const newRecovery = Math.min(100, stats.recovery + 0.1);

      await supabase.from(TABLES.STATS).update({
        total_coins: newCoins,
        total_diverted: newDiverted,
        epr_progress: newRecovery
      }).eq('id', 1);

      // 2. Update a random bin in Supabase
      if (bins.length > 0) {
        const randIdx = Math.floor(Math.random() * bins.length);
        const targetBin = bins[randIdx];
        const newCap = Math.min(100, targetBin.capacity + 15);
        
        await supabase.from(TABLES.BINS).update({ capacity: newCap }).eq('id', targetBin.id);

        // 3. Agentic Trigger Simulation
        if (newCap >= settings.threshold) {
          const msg = `AGENTIC_AI: Dispatching automated retrieval to ${targetBin.id}`;
          setNotifications(prev => [msg, ...prev]);
          
          await supabase.from(TABLES.DISPATCHES).insert({
            id: `AUT-TRUCK-${Math.floor(Math.random() * 90) + 10}`,
            driver: 'AI CORE-02',
            destination: targetBin.id,
            status: 'Dispatched',
            eta: '12m'
          });
        }
      }

      // 4. Log Transaction in Supabase
      await supabase.from(TABLES.TRANSACTIONS).insert({
        id: `TXN-${Math.floor(Math.random() * 900) + 100}`,
        entity: 'Citizen #Scanning',
        type: 'Eco-Reward',
        value: '15 Coins',
        status: 'Verified',
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Scan sync error:', error);
    }
  };

  return (
    <div className="h-full flex bg-[#090A0B] text-white font-sans overflow-hidden select-none selection:bg-emerald/30 relative">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col bg-[#090A0B] shrink-0 p-8">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-12 h-12 bg-emerald rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald/20 rotate-3">
            <Zap className="w-7 h-7 text-bg fill-bg" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">WrapRoute</h1>
            <p className="text-[10px] font-black text-emerald uppercase tracking-[0.4em] mt-1.5 opacity-60">AI Operations</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'Overview', icon: LayoutDashboard },
            { id: 'Smart Bins', icon: MapIcon },
            { id: 'Fleet Routing', icon: Truck },
            { id: 'EPR Ledger', icon: Database },
            { id: 'Settings', icon: SettingsIcon },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-sm font-bold transition-all group relative overflow-hidden ${
                activeTab === item.id ? 'text-white' : 'text-muted hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald/5 border border-emerald/10" />
              )}
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald' : 'text-muted group-hover:text-white'} />
              <span className="relative z-10">{item.id}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-line" className="absolute left-0 w-1 h-6 bg-emerald rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
           <div className="p-6 bg-emerald/5 border border-emerald/10 rounded-[32px] relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                 <Wallet className="text-emerald" size={18} />
                 <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Eco-Wallet</span>
              </div>
              <p className="text-3xl font-black tracking-tighter text-white">{stats.coins}</p>
              <p className="text-[10px] font-bold text-emerald mt-1">AVAILABLE ECO-COINS</p>
              <div className="absolute -right-4 -bottom-4 text-emerald/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <IndianRupee size={60} />
              </div>
           </div>
           
           <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-[24px]">
             <div className="w-11 h-11 rounded-2xl bg-surface border border-white/10 flex items-center justify-center font-black text-emerald uppercase">NS</div>
             <div className="min-w-0">
               <p className="text-sm font-black truncate">{profile?.name || "Nitesh Srivastava"}</p>
               <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-0.5">{profile?.role === 'brand_manager' ? 'Admin Level 4' : 'Consumer'}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main View */}
      <main className="flex-1 flex flex-col h-full bg-[#090A0B] relative overflow-hidden">
        
        {/* Nav Header */}
        <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-bg/50 backdrop-blur-3xl z-40">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setMobileNavOpen(true)}
               className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10"
             >
               <Menu size={20} />
             </button>
             <div className="hidden sm:flex items-center gap-4">
               <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">HACKATHON_DEMO_INSTANCE_ACTIVE</span>
             </div>
             <div className="sm:hidden flex items-center gap-2">
                <Zap className="text-emerald w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">WrapRoute</span>
             </div>
           </div>

           <div className="flex items-center gap-4 lg:gap-8">
              <button 
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-3 px-4 sm:px-8 py-2.5 sm:py-3 bg-emerald text-bg font-black uppercase text-[10px] tracking-widest rounded-full shadow-2xl shadow-emerald/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Camera size={14} className="hidden xs:block" />
                <span className="xs:inline">Scan</span>
              </button>
              
              <div className="relative group">
                <Bell size={20} className="text-muted cursor-pointer hover:text-white transition-colors" />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            <motion.header 
              key={activeTab} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="mb-10 lg:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">{activeTab}</h2>
                <p className="text-sm sm:text-lg text-muted font-medium max-w-2xl opacity-70">
                  {activeTab === 'Overview' && 'Autonomous circular economy analytics. Powering plastic neutrality through agentic retrieval networks.'}
                  {activeTab === 'Smart Bins' && 'Real-time edge IoT telemetrics. Monitoring fill levels and triggering autonomous fleet dispatches.'}
                  {activeTab === 'Fleet Routing' && 'Dynamic agentic route optimization for autonomous retrieval vehicles across the regional grid.'}
                  {activeTab === 'EPR Ledger' && 'Transparent on-chain records of MLP recovery, brand offsets, and user reward distribution.'}
                </p>
              </div>

              {activeTab === 'Smart Bins' && (
                <button 
                  onClick={deployNewBin}
                  className="px-8 py-4 bg-emerald text-bg font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-fit"
                >
                  <Plus size={18} />
                  Deploy New Bin
                </button>
              )}

              {activeTab === 'EPR Ledger' && (
                <button 
                  onClick={buyEprCredits}
                  className="px-8 py-4 bg-emerald text-bg font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-fit"
                >
                  <CreditCard size={18} />
                  Buy EPR Credits
                </button>
              )}
            </motion.header>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === 'Overview' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <MetricCard title="Total MLP Diverted" value={stats.totalDiverted.toFixed(1)} unit="Metric Tons" icon={Recycle} trend="+12.4%" />
                       <MetricCard title="Recovery Compliance" value={stats.recovery.toFixed(1)} unit="%" icon={Activity} />
                       <MetricCard title="Penalty Avoidance" value={stats.penaltyAvoided.toFixed(2)} unit="₹ Cr" icon={IndianRupee} color="blue-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      <div className="lg:col-span-2 premium-card p-10 bg-surface/30">
                        <div className="flex justify-between items-end mb-10">
                          <div>
                            <h3 className="text-2xl font-black tracking-tight">Recovery Flux</h3>
                            <p className="text-xs text-muted font-bold tracking-widest uppercase mt-1">Real-time volumetrics [MT]</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-emerald" />
                               <span className="text-[10px] font-black text-muted uppercase">Actual Recovery</span>
                             </div>
                             <div className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-[10px] font-black">LIVE STREAMING</div>
                          </div>
                        </div>
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA}>
                              <defs>
                                <linearGradient id="fluxGrid" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                              <XAxis dataKey="day" stroke="#ffffff15" fontSize={11} axisLine={false} tickLine={false} tick={{ fontWeight: 800 }} dy={15} />
                              <YAxis stroke="#ffffff15" fontSize={11} axisLine={false} tickLine={false} tick={{ fontWeight: 800 }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#090A0B', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 700 }}
                                cursor={{ stroke: '#10B981', strokeWidth: 1 }}
                              />
                              <Area type="monotone" dataKey="tonnage" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#fluxGrid)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="premium-card p-8 bg-emerald/10 border-emerald/20 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group py-12">
                          <div className="w-20 h-20 bg-emerald rounded-full flex items-center justify-center shadow-2xl shadow-emerald/40 relative z-10 group-hover:scale-110 transition-transform duration-500">
                            <Camera className="w-10 h-10 text-bg" />
                          </div>
                          <div className="relative z-10">
                            <h4 className="text-xl font-black mb-2">Simulate AI Scan</h4>
                            <p className="text-sm text-muted font-medium mb-6">Demonstrate the real-time MLP verification flow.</p>
                            <button 
                              onClick={() => setScannerOpen(true)}
                              className="px-8 py-4 bg-emerald text-bg font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald/20 hover:scale-105 active:scale-95 transition-all w-full"
                            >
                              Scan Wrapper
                            </button>
                          </div>
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} className="text-emerald" />
                          </div>
                        </div>

                        <div className="premium-card p-8 bg-surface/30 border-white/5 space-y-6">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
                                 <RefreshCcw size={20} />
                              </div>
                              <h4 className="text-sm font-bold uppercase tracking-widest">Automation Logs</h4>
                           </div>
                           <div className="space-y-4">
                              {notifications.length === 0 ? (
                                <p className="text-xs text-muted font-mono italic">Waiting for agentic triggers...</p>
                              ) : (
                                notifications.slice(0, 3).map((note, i) => (
                                  <div key={i} className="flex gap-3 items-start border-l-2 border-emerald pl-4">
                                     <div className="mt-1">
                                       <div className="w-1.5 h-1.5 bg-emerald rounded-full" />
                                     </div>
                                     <p className="text-[10px] font-mono text-muted leading-tight uppercase">{note}</p>
                                  </div>
                                ))
                              )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Smart Bins' && (
                  <>
                    {bins.length === 0 ? (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 premium-card border-dashed border-white/10 bg-white/[0.01]">
                         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-muted">
                            <MapIcon size={32} />
                         </div>
                         <div className="space-y-2">
                            <h4 className="text-2xl font-black tracking-tight">No Active Bins Detected</h4>
                            <p className="text-sm text-muted font-medium">Provision a new IoT node to begin regional monitoring.</p>
                         </div>
                         <button 
                           onClick={deployNewBin}
                           className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                         >
                           + Deploy First Node
                         </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {bins.map(bin => (
                          <motion.div 
                            key={bin.id} 
                            layout 
                            className={`premium-card p-8 border-white/5 relative overflow-hidden transition-all duration-500 ${bin.capacity >= 90 ? 'ring-2 ring-red-500/50 scale-105' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-8">
                              <div className={`p-3 rounded-2xl ${bin.capacity >= 90 ? 'bg-red-500/10 text-red-500' : 'bg-emerald/10 text-emerald'}`}>
                                <MapIcon size={24} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded bg-white/5 ${bin.capacity >= 90 ? 'text-red-500' : 'text-muted'}`}>NODE::ACTIVE</span>
                            </div>
                            <h4 className="text-xl font-black mb-1">{bin.id}</h4>
                            <p className="text-xs text-muted font-bold truncate mb-8">{bin.location}</p>

                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest">TELEMETRY_CAPACITY</span>
                                <span className={`text-lg font-black ${bin.capacity >= 90 ? 'text-red-500' : 'text-emerald'}`}>{bin.capacity}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${bin.capacity}%` }}
                                   className={`h-full ${bin.capacity >= 90 ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-emerald shadow-[0_0_15px_#10B981]'}`}
                                 />
                              </div>
                            </div>

                            {bin.capacity >= 90 && (
                              <div className="absolute top-2 right-[-15px] bg-red-500 text-[8px] font-black text-white px-6 py-0.5 rotate-45 uppercase tracking-tighter shadow-xl">Critical</div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'Fleet Routing' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-6">
                      <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-4">Active Deployments</h3>
                      <div className="space-y-4">
                        {fleet.length === 0 ? (
                           <div className="p-12 border border-dashed border-white/10 rounded-[32px] text-center space-y-4 bg-white/[0.01]">
                              <Truck size={32} className="mx-auto text-muted opacity-20" />
                              <p className="text-xs font-bold text-muted uppercase tracking-widest">No active dispatches</p>
                           </div>
                        ) : (
                          fleet.map(truck => (
                            <div key={truck.id} className="premium-card p-6 border-l-4 border-l-emerald shadow-2xl">
                               <div className="flex justify-between items-center mb-6">
                                 <div className="flex items-center gap-3">
                                   <Truck size={20} className="text-emerald" />
                                   <h5 className="font-black tracking-tight">{truck.id}</h5>
                                 </div>
                                 <span className="text-[10px] font-black text-emerald bg-emerald/10 px-3 py-1 rounded-full uppercase tracking-widest">ACTIVE</span>
                               </div>
                               <div className="grid grid-cols-2 gap-6">
                                 <div>
                                   <p className="text-[9px] text-muted font-black uppercase mb-1">Assigned AI</p>
                                   <p className="text-sm font-bold">{truck.driver}</p>
                                 </div>
                                 <div>
                                   <p className="text-[9px] text-muted font-black uppercase mb-1">Target Bin</p>
                                   <p className="text-sm font-bold text-emerald">{truck.destination}</p>
                                 </div>
                               </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="lg:col-span-2 premium-card bg-[#0E1012] h-[600px] flex items-center justify-center relative overflow-hidden border-white/5">
                        <div className="absolute inset-0 opacity-[0.03] space-y-px" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                        <div className="text-center space-y-8 relative z-10">
                           <div className="w-32 h-32 bg-emerald/10 rounded-full flex items-center justify-center mx-auto border border-emerald/20 relative shadow-inner">
                              <div className="absolute inset-0 rounded-full animate-ping bg-emerald/5" />
                              <Navigation className="w-12 h-12 text-emerald" />
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-4xl font-black tracking-tight">Agentic Routing Engine</h4>
                             <p className="text-sm text-muted font-bold tracking-widest uppercase">Autonomous Fleet Synchronization: ONLINE</p>
                           </div>
                           <div className="flex justify-center gap-8">
                             {[
                               { label: 'CO2 Saved', val: '124.5 kg', color: 'emerald' },
                               { label: 'Efficiency', val: '+28.4%', color: 'blue-400' }
                             ].map((chip, idx) => (
                               <div key={idx} className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-3xl min-w-[180px]">
                                 <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1">{chip.label}</p>
                                 <p className={`text-2xl font-black text-${chip.color}`}>{chip.val}</p>
                               </div>
                             ))}
                           </div>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === 'EPR Ledger' && (
                  <div className="space-y-8">
                    <div className="premium-card p-6 lg:p-10 bg-emerald/5 border-emerald/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
                       <div className="flex items-center gap-6">
                         <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald/10 rounded-2xl lg:rounded-3xl flex items-center justify-center text-emerald">
                            <ShieldCheck size={28} />
                         </div>
                         <div>
                            <h3 className="text-xl lg:text-2xl font-black text-white leading-tight">Immutable Compliance Registry</h3>
                            <p className="text-[10px] lg:text-sm text-muted font-bold tracking-widest uppercase mt-1">Verified via Agentic Authentication v3.2</p>
                         </div>
                       </div>
                       <button 
                         onClick={buyEprCredits}
                         className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                       >
                          <Database size={16} /> Audit Full Block
                       </button>
                    </div>

                    <div className="premium-card overflow-hidden bg-surface/30 backdrop-blur-3xl">
                      {ledger.length === 0 ? (
                        <div className="py-24 text-center space-y-4">
                           <Database size={32} className="mx-auto text-muted opacity-20" />
                           <p className="text-xs font-bold text-muted uppercase tracking-[0.3em]">No transactions recorded yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left min-w-[800px]">
                            <thead>
                              <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">TXN_ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">Origin Entity</th>
                                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">Type</th>
                                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">Payload Value</th>
                                <th className="px-10 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em] text-right">Auth</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {ledger.map(txn => (
                                <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                                   <td className="px-10 py-6 text-xs font-mono text-muted group-hover:text-emerald transition-colors">{txn.id}</td>
                                   <td className="px-10 py-6 text-sm font-black">{txn.entity}</td>
                                   <td className="px-10 py-6">
                                     <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1 rounded-md uppercase">{txn.type}</span>
                                   </td>
                                   <td className="px-10 py-6 text-sm font-black text-emerald">{txn.value}</td>
                                   <td className="px-10 py-6 text-right">
                                      <div className="flex justify-end">
                                         <div className="p-2 bg-emerald/10 rounded-full">
                                            <CheckCircle2 size={16} className="text-emerald" />
                                         </div>
                                      </div>
                                   </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Settings' && (
                  <SettingsView 
                    settings={settings} 
                    setSettings={setSettings} 
                    onReset={resetAllData} 
                  />
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* Global Toasts */}
        <div className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-[100] space-y-4 pointer-events-none max-w-[calc(100vw-3rem)]">
          <AnimatePresence>
            {notifications.slice(0, 3).map((note, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="p-4 sm:p-6 bg-[#0E1012] border-l-4 border-red-500 border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-4 sm:gap-5 w-full xs:w-[400px] pointer-events-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                   <Bell size={20} className="animate-bounce" />
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Autonomous Dispatch Alert</p>
                   <p className="text-xs sm:text-sm font-black leading-tight truncate xs:whitespace-normal">{note}</p>
                </div>
                <button onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))} className="ml-auto p-2 text-muted hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Nav Drawer */}
        <MobileNavNode 
          isOpen={isMobileNavOpen} 
          onClose={() => setMobileNavOpen(false)} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          coins={stats.coins}
        />

        {/* Scanner Modal Modal */}
        <ViewScanner 
          isOpen={isScannerOpen} 
          onClose={() => setScannerOpen(false)} 
          onScanComplete={handleScanAction} 
        />

      </main>

      {/* Styles for animation */}
      <style>{`
        @keyframes scan {
          from { top: 0; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite alternate;
          position: absolute;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffffff10;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10B981;
        }
      `}</style>
    </div>
  );
}
