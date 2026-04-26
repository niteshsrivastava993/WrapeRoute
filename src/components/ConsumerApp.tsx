import React, { useState, useRef, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, MapPin, Wallet, History, Trash2, CheckCircle2, 
  Loader2, Sparkles, Scan, ArrowUpRight, 
  Map as MapIcon, Database, User as UserIcon,
  Menu, X, LayoutDashboard, Settings, XCircle
} from 'lucide-react';
import { analyzeWrapper, WrapperAnalysis } from '../services/gemini';

export function ConsumerApp({ user, profile }: { user: any, profile: any }) {
  const [activeTab, setActiveTab] = useState<'scan' | 'map' | 'history'>('scan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [analysis, setAnalysis] = useState<WrapperAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const scansQuery = query(collection(db, 'scans'), where('userId', '==', user.uid));
    const unsubscribeScans = onSnapshot(scansQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setScans(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'scans'));

    return () => {
      unsubscribeScans();
    };
  }, [user.uid]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    
    const result = await analyzeWrapper(imageData);
    setAnalysis(result);
    setScanning(false);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const submitScan = async () => {
    if (!analysis) return;
    
    try {
      await addDoc(collection(db, 'scans'), {
        userId: user.uid,
        brand: analysis.brand,
        plasticType: analysis.plasticType,
        status: 'verified',
        imageHash: btoa(Math.random().toString()).substring(0, 16),
        createdAt: serverTimestamp(),
        location: { lat: 26.8467, lng: 80.9462 },
        bin: "Bin #02 - Campus Cafeteria"
      });

      await updateDoc(doc(db, 'users', user.uid), {
        ecoCoins: increment(15)
      });

      setCapturedImage(null);
      setAnalysis(null);
      stopCamera();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'scans');
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Sidebar Modal */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[210] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-azure rounded-xl flex items-center justify-center text-white">
                    <Database size={20} />
                  </div>
                  <h2 className="font-display text-2xl uppercase tracking-tighter">WRAPROUTE</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="space-y-2 flex-1">
                {[
                  { icon: LayoutDashboard, label: 'Overview' },
                  { icon: Scan, label: 'Scanner' },
                  { icon: Sparkles, label: 'Rewards Marketplace' },
                  { icon: Settings, label: 'Settings' }
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium group text-left">
                    <item.icon className="w-5 h-5 group-hover:text-azure" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <button 
                onClick={() => auth.signOut()}
                className="mt-auto flex items-center gap-4 p-4 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 max-w-lg mx-auto w-full pb-32 pt-4">
        {/* Header Card */}
        <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">Hello, {profile?.name?.split(' ')[0] || 'Nitesh'}!</h2>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-azure" />
                <span className="text-[10px] font-bold uppercase tracking-widest">SRMCEM Campus, Lucknow</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-colors"
                id="sidebar-trigger"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-1 ring-slate-100">
                {user.photoURL ? <img src={user.photoURL} alt="User" /> : <div className="text-azure"><UserIcon /></div>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-10">
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-1.5">Eco-Coins Balance</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon rounded-full flex items-center justify-center shadow-lg shadow-neon/20">
                  <Wallet className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                    {profile?.ecoCoins || 0} <span className="text-[10px] font-bold text-slate-300 uppercase">Coins</span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="w-px h-14 bg-slate-100" />
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-1.5">Indian Currency</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-azure rounded-full flex items-center justify-center shadow-lg shadow-azure/20">
                  <span className="font-bold text-white text-lg">₹</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 leading-none">
                    {((profile?.ecoCoins || 0) * 0.2).toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button Section */}
        <section className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            {/* Pulsing Visuals */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-12 bg-neon rounded-full blur-3xl"
            />
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (capturedImage) return;
                setActiveTab('scan');
                startCamera();
              }}
              className={`w-52 h-52 rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500
                ${capturedImage ? 'bg-slate-50 border-4 border-slate-100' : 'bg-white border-[10px] border-neon/10 ring-8 ring-neon animate-breathe shadow-2xl'}
              `}
              id="scan-button"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-neon/5 to-transparent pointer-events-none" />
              {capturedImage ? (
                <img src={capturedImage} className="w-full h-full object-cover rounded-full" />
              ) : (
                <>
                  <Scan className="w-14 h-14 text-neon mb-2 drop-shadow-sm" />
                  <span className="font-display text-2xl uppercase tracking-widest text-slate-900 leading-none">Scan</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-[0.2em]">Wrapper</span>
                </>
              )}
            </motion.button>
          </div>

          <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
            Agentic AI Vision Enabled
          </p>

          {/* Scanner UI Overlay */}
          <AnimatePresence>
            {activeTab === 'scan' && !capturedImage && videoRef.current && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[300] bg-white flex flex-col"
              >
                <div className="p-8 flex justify-between items-center bg-white shrink-0">
                  <button onClick={() => { stopCamera(); setActiveTab('scan'); }} className="p-2 -ml-2 text-slate-400">
                    <XCircle className="w-8 h-8" />
                  </button>
                  <div className="flex flex-col items-center">
                    <h3 className="font-display text-2xl uppercase tracking-[0.2em] leading-none">Vision</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Autonomous Analyzer</span>
                  </div>
                  <div className="w-8" />
                </div>
                
                <div className="flex-1 relative bg-black mx-6 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  
                  {/* Targeting Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-neon/40 rounded-[2rem] relative">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-neon/30 scan-line" />
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-neon rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-neon rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-neon rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-neon rounded-br-xl" />
                    </div>
                  </div>
                </div>
                
                <div className="p-10 flex justify-center bg-white shrink-0">
                  <button 
                    onClick={captureAndAnalyze}
                    className="w-24 h-24 rounded-full border-4 border-slate-100 bg-white shadow-2xl flex items-center justify-center p-1 relative group"
                  >
                    <div className="w-full h-full rounded-full bg-azure shadow-lg shadow-azure/30 group-active:scale-90 transition-transform flex items-center justify-center text-white">
                      <Camera className="w-10 h-10" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Results Analysis */}
        <AnimatePresence>
          {capturedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-x-0 bottom-0 z-[310] bg-white rounded-t-[3.5rem] p-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-100"
            >
              {scanning ? (
                <div className="flex flex-col items-center justify-center py-12 gap-5">
                  <div className="relative">
                    <Loader2 className="w-14 h-14 text-azure animate-spin" />
                    <Sparkles className="w-6 h-6 text-neon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="font-bold text-[11px] uppercase tracking-[0.3em] text-slate-400">Classifying Polymer Signature...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 overflow-hidden shrink-0 shadow-inner">
                      <img src={capturedImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                        <span className="text-[10px] font-bold text-neon uppercase tracking-widest">Asset Authenticated</span>
                      </div>
                      <h4 className="text-2xl font-bold text-slate-900 leading-none">{analysis?.brand}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1">{analysis?.plasticType} Material Detected</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Impact Credit</span>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-neon" />
                        <span className="text-lg font-bold text-slate-900">+15 Coins</span>
                      </div>
                    </div>
                    <div className="p-5 bg-azure/5 rounded-3xl border border-azure/10">
                      <span className="text-[10px] font-bold text-azure/60 uppercase block mb-1">Eco-Factor</span>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-azure" />
                        <span className="text-lg font-bold text-azure">High Recyclability</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setCapturedImage(null); setAnalysis(null); stopCamera(); }}
                      className="flex-1 py-5 font-bold text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                    >
                      Retry
                    </button>
                    <button 
                      onClick={submitScan}
                      className="flex-[2] py-5 bg-neon text-black font-bold uppercase rounded-2xl shadow-xl shadow-neon/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm Drop
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Feed */}
        <section className="space-y-5 pt-4 pb-12">
          <div className="flex justify-between items-baseline">
            <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
            <button className="text-xs font-bold text-azure uppercase tracking-wider hover:underline">Full History</button>
          </div>
          
          <div className="space-y-4">
            {scans.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                <History className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-medium text-slate-400">Validated scans will appear here.</p>
              </div>
            ) : scans.slice(0, 5).map((scan, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={scan.id} 
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center group-hover:bg-neon/10 transition-colors shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-neon" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold py-0.5 px-2 bg-emerald-100 text-emerald-700 rounded-lg uppercase tracking-wide">Validated</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(scan.createdAt?.seconds * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h5 className="font-bold text-slate-800 text-base truncate">
                    {scan.brand} - +15 Coins
                  </h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate mt-0.5">
                    <MapPin className="w-3 h-3 inline mr-1 text-azure" />
                    {scan.bin || "SRMCEM Campus Cafeteria"}
                  </p>
                </div>
                <button className="p-3 text-slate-200 group-hover:text-azure transition-colors">
                  <ArrowUpRight className="w-6 h-6" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] shadow-2xl flex items-center justify-around px-10 z-50">
        {[
          { id: 'map', icon: MapIcon, label: 'Grid' },
          { id: 'scan', icon: Scan, label: 'Action' },
          { id: 'history', icon: History, label: 'Flux' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all
              ${activeTab === tab.id ? 'text-azure scale-110' : 'text-slate-300 hover:text-slate-400'}
            `}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
