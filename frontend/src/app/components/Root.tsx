import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Users, ClipboardCheck, ShieldCheck, Rocket,
  ArrowRight, Zap, Globe,
  Lock, Trophy,
  Calendar, MapPin, X, Loader2, ChevronRight, Tag, Vote
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "../utils/api";

// ------------------------------------------------------------------
// Event Selection Modal
// ------------------------------------------------------------------
function EventSelectModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/auth/public-events")
      .then((data) => {
        setEvents(data);
        // If there's exactly one event, skip the modal and go straight in
        if (data.length === 1) {
          localStorage.setItem("selectedEventId", data[0].eventId);
          navigate(`/register?eventId=${data[0].eventId}`);
        }
      })
      .catch(() => setError("Could not load events. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (eventId: string) => {
    localStorage.setItem("selectedEventId", eventId);
    navigate(`/register?eventId=${eventId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/5">
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Select Event</span>
              <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight leading-none">
                Choose Your Event
              </h2>
              <p className="text-slate-400 text-xs font-bold mt-1">Pick the event you want to register for</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Loading Events…</p>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-12">
                <p className="text-red-400 font-bold text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && events.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No open events at this time</p>
                <p className="text-slate-600 text-xs mt-2">Check back later or contact the organizers.</p>
              </div>
            )}

            {!loading && events.map((event, idx) => (
              <motion.button
                key={event.eventId}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                onClick={() => handleSelect(event.eventId)}
                className="w-full text-left p-5 bg-slate-900/60 border border-white/5 rounded-2xl group hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-5"
              >
                {/* Icon / Logo */}
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:border-primary/30 transition-colors">
                  {event.clubLogo ? (
                    <img src={event.clubLogo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base uppercase tracking-tight leading-tight truncate">
                    {event.name}
                  </p>
                  {event.description && (
                    <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-3 mt-3">
                    {event.venue && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" /> {event.venue}
                      </span>
                    )}
                    {event.settings?.registrationType && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Tag className="w-3 h-3" /> {event.settings.registrationType === "Single" ? "Solo" : "Team"}
                      </span>
                    )}
                    {event.settings?.isPaidEvent && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[9px] font-black text-yellow-400 uppercase tracking-widest">
                        ₹{event.settings.registrationFee} Entry
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      Open
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------
// Check Status Modal
// ------------------------------------------------------------------
function CheckStatusModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await fetchApi("/auth/check-status", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Registration not found or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="w-full max-w-md bg-slate-950 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/5">
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Registration</span>
              <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight leading-none">
                Check Status
              </h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-8">
            {!result ? (
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="Enter participation email"
                  />
                </div>
                {error && <p className="text-xs font-bold text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Status"}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-emerald-500 font-black text-sm uppercase tracking-widest">Registration Confirmed</h3>
                    <p className="text-emerald-400/80 text-xs font-bold mt-0.5">Your team is registered successfully.</p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-900/50 p-5 border border-white/5 rounded-2xl">
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Name</p>
                     <p className="text-white font-bold text-lg">{result.teamName}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team ID</p>
                       <p className="text-slate-300 font-mono text-sm">{result.teamId}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event</p>
                       <p className="text-slate-300 font-bold text-sm">{result.eventName}</p>
                     </div>
                   </div>
                   
                   <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Team Members ({result.members?.length || 0})</p>
                     <div className="space-y-2">
                       {result.members?.map((m: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center text-xs">
                           <span className="text-slate-300 font-bold">{m.name} {idx === 0 && <span className="text-primary">(Leader)</span>}</span>
                           <span className="text-slate-500 font-mono">{m.regNo}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  Verify Another
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------
// Root / Landing Page
// ------------------------------------------------------------------
export function Root() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 } as any
    }
  };

  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      
      // Auto-redirect to their respective dashboard if they land here while logged in
      if (u.role === 'admin' || u.role === 'coordinator') navigate("/admin/dashboard");
      else if (u.role === 'reviewer') navigate("/reviewer/dashboard");
      else if (u.role === 'teamleader') navigate("/teamleader/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center selection:bg-primary selection:text-white">

      {/* Event Selection Modal */}
      {showModal && <EventSelectModal onClose={() => setShowModal(false)} />}

      {/* Check Status Modal */}
      {showStatusModal && <CheckStatusModal onClose={() => setShowStatusModal(false)} />}

      {/* Full Logo Lightbox Modal */}
      <AnimatePresence>
        {selectedLogo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setSelectedLogo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLogo(null)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={selectedLogo} 
                alt="Full Resolution Logo" 
                className="w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] rounded-2xl" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="w-full max-w-7xl px-10 py-8 flex justify-between items-center relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="flex items-center">
            <span 
              className="text-[2.2rem] font-black tracking-[0.15em] leading-none uppercase bg-clip-text text-transparent bg-gradient-to-br from-white to-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] ml-2"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              NEXOSS
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-10"
        >
          <Link to="/login/admin" className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all hover:translate-y-[-1px]">Admin Access</Link>
          <button
            onClick={() => setShowModal(true)}
            className="formal-btn bg-primary text-white text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 flex items-center gap-2"
          >
            Register Team <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </nav>

      {/* Hero */}
      <main className="flex-1 w-full max-w-7xl px-10 flex flex-col items-center justify-center text-center relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10 max-w-5xl"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center gap-6">
              {/* Main Logo - Perfect Circle */}
              <div 
                onClick={() => setSelectedLogo("/logo.png")}
                className="w-24 h-24 bg-[#B51E23]/10 backdrop-blur-md border-[3px] border-[#B51E23]/40 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(181,30,35,0.4)] p-0.5 transform transition-transform duration-500 hover:scale-110 group cursor-pointer"
              >
                <img src="/logo.png" alt="Main Logo" className="w-full h-full object-cover rounded-full bg-white/5 group-hover:scale-105 transition-transform" />
              </div>
              
              {/* Stylish Cross */}
              <div className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-red-400 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] select-none">
                X
              </div>
              
              {/* OSS Logo - Perfect Circle */}
              <div 
                onClick={() => setSelectedLogo("/Kare oss logo.jpeg")}
                className="w-24 h-24 bg-[#B51E23]/10 backdrop-blur-md border-[3px] border-[#B51E23]/40 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(181,30,35,0.4)] p-0.5 transform transition-transform duration-500 hover:scale-110 group cursor-pointer"
              >
                <img src="/Kare oss logo.jpeg" alt="OSS Logo" className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-[5rem] font-black text-white tracking-tighter leading-[0.9] uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Future of Event <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Powered by NEXOSS. The premier infrastructure for seamless symposium registrations, high-stakes technical evaluations, and entirely dynamic live voting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-primary text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 group hover:bg-primary/90"
            >
              REGISTER NOW <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/voting" className="px-8 py-4 bg-blue-500 border border-blue-500/20 text-white rounded-xl font-black text-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <Vote className="w-5 h-5 text-white" /> VOTE NOW
            </Link>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-8 py-4 bg-slate-900 border border-emerald-500/20 text-emerald-500 rounded-xl font-black text-lg hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> CHECK STATUS
            </button>
            <Link to="/login/teamleader" className="px-8 py-4 bg-slate-900 border border-white/10 text-white rounded-xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" /> PARTICIPANT LOGIN
            </Link>
          </div>
        </motion.div>

        {/* Portal Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-32"
        >
          <motion.div variants={item}>
            <Link to="/voting" className="glass-card p-6 rounded-[2rem] block text-left group hover:border-blue-500/40 transition-all hover:bg-blue-500/5">
              <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                <Vote className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">Public Voting</h3>
              <p className="text-slate-400 font-bold text-xs leading-relaxed">Students & Faculty (KLU) can evaluate projects and submit their votes.</p>
              <div className="mt-6 flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                Enter Voting <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link to="/login/teamleader" className="glass-card p-6 rounded-[2rem] block text-left group hover:border-primary/40 transition-all hover:bg-primary/5">
              <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                <Users className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">Participant Portal</h3>
              <p className="text-slate-400 font-bold text-xs leading-relaxed">Secure access for participants and leaders to view event and team info.</p>
              <div className="mt-6 flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                Go to Portal <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link to="/login/reviewer" className="glass-card p-6 rounded-[2rem] block text-left group hover:border-emerald-500/40 transition-all hover:bg-emerald-500/5">
              <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                <ClipboardCheck className="text-emerald-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">Reviewer Panel</h3>
              <p className="text-slate-400 font-bold text-xs leading-relaxed">Evaluation environment for reviewers to grade teams based on criteria.</p>
              <div className="mt-6 flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                Reviewer Entrance <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link to="/login/admin" className="glass-card p-6 rounded-[2rem] block text-left group hover:border-white/20 transition-all hover:bg-white/5">
              <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">Admin Console</h3>
              <p className="text-slate-400 font-bold text-xs leading-relaxed">Central management of event logistics, participants, and settings.</p>
              <div className="mt-6 flex items-center gap-2 text-white font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                Admin Control <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-10 py-10 border-t border-white/5 mt-20 flex flex-col justify-center items-center gap-2 text-center relative z-10">
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} KARE Open Source Society (OSS)
        </p>
        <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Powered By NEXOSS Engine
        </p>
      </footer>
    </div>
  );
}


