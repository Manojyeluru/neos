import { useState, useEffect } from "react";
import { fetchApi } from "../../utils/api";
import { toast } from "sonner";
import { Link } from "react-router";
import { Vote, ArrowLeft, Loader2, PlayCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../../firebase"; // Correct path to src/firebase.ts

export function PublicVoting() {
    const [status, setStatus] = useState<"loading" | "login" | "dashboard">("loading");
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [voter, setVoter] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Automatically check if voter exists in localStorage, or prompt login
        const savedVoter = localStorage.getItem("voter");
        if (savedVoter) {
            setVoter(JSON.parse(savedVoter));
            setStatus("dashboard");
            loadEvents();
        } else {
            setStatus("login");
            loadEvents();
        }
    }, []);

    useEffect(() => {
        if (selectedEventId && status === "dashboard") {
            loadProjects();
        }
    }, [selectedEventId, status]);

    const loadEvents = async () => {
        try {
            const data = await fetchApi("/auth/public-events");
            setEvents(data);
            if (data.length > 0) setSelectedEventId(data[0]._id);
        } catch (err) {
            console.error("Failed to load events", err);
        } finally {
            if (status === "loading") setStatus("login");
        }
    };

    const loadProjects = async () => {
        try {
            const data = await fetchApi(`/voting/projects/${selectedEventId}`);
            setProjects(data);
            
            // Check if user already voted from backend or saved state
        } catch (err: any) {
            toast.error(err.message || "Failed to load projects");
            setProjects([]);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            
            const reqData = await fetchApi("/voting/auth", {
                method: "POST",
                body: JSON.stringify({ idToken, eventId: selectedEventId })
            });

            localStorage.setItem("voter", JSON.stringify(reqData.voter));
            setVoter(reqData.voter);
            setStatus("dashboard");
            toast.success("Authenticated successfully!");
        } catch (err: any) {
            toast.error(err.message || "Login failed.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("voter");
        setVoter(null);
        setStatus("login");
        setSelectedProjects([]);
    };

    const toggleProjectSelection = (teamId: string) => {
        if (voter?.votedProjects?.length > 0) {
            toast.error("You have already cast your votes.");
            return;
        }

        if (selectedProjects.includes(teamId)) {
            setSelectedProjects(prev => prev.filter(id => id !== teamId));
        } else {
            if (selectedProjects.length >= 3) {
                toast.error("You can only select up to 3 projects.");
                return;
            }
            setSelectedProjects(prev => [...prev, teamId]);
        }
    };

    const submitVotes = async () => {
        if (selectedProjects.length === 0) {
            toast.error("Please select at least 1 project to vote for.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetchApi("/voting/submit", {
                method: "POST",
                body: JSON.stringify({
                    email: voter.email,
                    eventId: selectedEventId,
                    teamIds: selectedProjects
                })
            });
            
            const updatedVoter = { ...voter, votedProjects: res.votedProjects };
            setVoter(updatedVoter);
            localStorage.setItem("voter", JSON.stringify(updatedVoter));
            
            toast.success("Thank you! Your votes have been counted.");
            setSelectedProjects([]);
            loadProjects(); // refresh projects to show updated info if needed
        } catch (err: any) {
            toast.error(err.message || "Failed to submit votes");
        } finally {
            setSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-primary font-black uppercase tracking-widest text-xs">Loading Voting Systems...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6 text-white font-sans selection:bg-primary selection:text-white pb-32">
            {/* Header */}
            <header className="w-full max-w-7xl flex items-center justify-between mb-8 z-10">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors shadow-lg overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
                    </div>
                </Link>
                {voter && (
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-white uppercase tracking-widest">{voter.email}</p>
                            <span className="text-[10px] font-black italic text-primary uppercase">
                                {voter.role} Account (x{voter.role === 'faculty' ? '10' : '1'} Points)
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-10 h-10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl flex items-center justify-center transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </header>

            {status === "login" && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
                >
                    <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <Vote className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-center text-white uppercase tracking-tighter mb-2">
                        University <span className="text-primary italic">Voting Network</span>
                    </h1>
                    <p className="text-center text-slate-400 text-xs font-bold leading-relaxed mb-8">
                        Cast your vote for the best technical projects. Exclusive to KL University students and faculty.
                    </p>

                    <div className="space-y-4 mb-8">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Event</label>
                        <select 
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
                        >
                            {events.map(ev => (
                                <option key={ev._id} value={ev._id}>{ev.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-slate-200 text-slate-950 font-black uppercase text-sm tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Log in with KLU Email
                    </button>
                    
                    <div className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest space-y-2">
                        <p>1 Vote = 1 Point (Students)</p>
                        <p>1 Vote = 10 Points (Faculty)</p>
                    </div>
                </motion.div>
            )}

            {status === "dashboard" && (
                <div className="w-full max-w-7xl z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                        <div>
                            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                                {voter?.role} Voting Terminal
                            </h2>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                                Selected <span className="text-primary italic">Projects</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900 border border-white/5 p-2 rounded-2xl shadow-lg">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                {voter?.votedProjects?.length > 0 ? "VOTES CASTED" : `${3 - selectedProjects.length} VOTES REMAINING`}
                            </span>
                            {!voter?.votedProjects?.length && (
                                <button 
                                    onClick={submitVotes}
                                    disabled={submitting || selectedProjects.length === 0}
                                    className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Authenticating...' : 'SUBMIT VOTES'}
                                </button>
                            )}
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center bg-slate-900 border border-white/5 rounded-3xl p-16">
                            <div className="w-16 h-16 mx-auto bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <Vote className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest">No Projects Available</h3>
                            <p className="text-slate-500 font-bold text-xs">Waiting for teams to submit their projects, or voting is currently closed.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(team => {
                                const isVoted = voter?.votedProjects?.includes(team._id);
                                const isSelected = selectedProjects.includes(team._id);

                                return (
                                    <div 
                                        key={team._id} 
                                        className={`glass-card p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col ${
                                            isVoted 
                                                ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                                                : isSelected 
                                                    ? 'border-primary shadow-[0_0_30px_rgba(239,68,68,0.2)] scale-[1.02]' 
                                                    : 'border-white/5 hover:border-white/20'
                                        }`}
                                        onClick={() => toggleProjectSelection(team._id)}
                                    >
                                        {(isVoted || isSelected) && (
                                            <div className="absolute top-0 right-0 p-4 z-10">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${isVoted ? 'bg-emerald-500' : 'bg-primary'}`}>
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <h3 className="text-xl font-black text-white leading-tight mb-1">{team.teamName}</h3>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                {team.problemStatementId?.title || 'General Submission'}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-slate-400 text-xs leading-relaxed font-mono line-clamp-4 mb-4">
                                                {team.project.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto border-t border-white/5 pt-4">
                                            <a 
                                                href={team.project.videoUrl} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-white uppercase tracking-widest px-4 py-2 bg-slate-950 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <PlayCircle className="w-4 h-4 text-primary" /> View Demo Link
                                            </a>
                                        </div>

                                        {voter?.votedProjects?.length > 0 && (
                                            <div className="absolute bottom-4 right-6 text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Votes</p>
                                                <p className="text-2xl font-black text-white">{team.votes}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>
        </div>
    );
}
