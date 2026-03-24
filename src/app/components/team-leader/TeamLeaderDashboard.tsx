import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TeamLeaderLayout } from "../layouts/TeamLeaderLayout";
import {
  Hash, ArrowRight, User, CheckCircle,
  ShieldCheck, Sparkles, Zap, Users,
  Rocket, LayoutDashboard, Cpu, Loader2
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export function TeamLeaderDashboard() {
  const navigate = useNavigate();
  const [teamId, setTeamId] = useState("");
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setTeamId(user.uniqueId);
      handleFetchTeam(user.uniqueId);
    } else {
      setLoading(false);
    }
  }, []);

  const handleFetchTeam = async (id: string) => {
    setChecking(true);
    try {
      const data = await fetchApi(`/team/info/${id}`);
      setTeamInfo(data);
    } catch (err) {
      console.error(err);
      setTeamInfo(null);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamId) {
      handleFetchTeam(teamId);
    }
  };

  if (loading) {
    return (
      <TeamLeaderLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-t-2 border-primary rounded-full" />
            <Cpu className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-6">Loading...</p>
        </div>
      </TeamLeaderLayout>
    );
  }

  return (
    <TeamLeaderLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">Dashboard</h2>
            </div>
            <p className="text-slate-400 text-lg">Role: <span className="text-primary font-bold">Team Leader</span> | Team ID: <span className="text-accent underline font-mono">{teamId}</span></p>
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Portal Active</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-12">
            <AnimatePresence mode="wait">
              {!teamInfo ? (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="glass-card max-w-2xl mx-auto p-12 text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_15px_40px_rgba(99,102,241,0.4)] relative z-10">
                    <ShieldCheck className="w-12 h-12 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4 relative z-10">Identity Verification</h3>
                  <p className="text-slate-400 mb-8 relative z-10">Enter your Team ID to access your dashboard.</p>

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest text-left block ml-1">Team ID</label>
                      <input
                        type="text"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        className="w-full bg-slate-950/50 border-2 border-white/5 rounded-3xl py-6 px-8 text-white font-black text-2xl tracking-widest text-center focus:outline-none focus:border-primary transition-all placeholder:text-slate-700"
                        placeholder="TEAM-XXXXXX"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={checking}
                      className="w-full bg-primary py-6 rounded-3xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(99,102,241,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {checking ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 text-accent fill-accent" />}
                      {checking ? "VERIFYING..." : "CONTINUE"}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Dashboard Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Team Identity Card */}
                    <div className="lg:col-span-7">
                      <div className="glass-card p-10 rounded-[3rem] h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />

                        <div className="flex items-start justify-between mb-12">
                          <div className="space-y-2">
                            <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">Team Details</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{teamInfo.teamName}</h3>
                          </div>
                          <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-3xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Team Leader</p>
                            <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-white text-lg">
                                {(teamInfo.leaderId?.name || teamInfo.leaderName || "TL").charAt(0)}
                              </div>
                                <div>
                                  <p className="font-bold text-white">{teamInfo.leaderId?.name || teamInfo.leaderName || "Leader Name"}</p>
                                  <p className="text-xs text-slate-500">{teamInfo.leaderId?.email || "leader@matrix.com"}</p>
                                  {teamInfo.leaderId?.phone && <p className="text-xs text-slate-500 mt-1">Phone: {teamInfo.leaderId.phone}</p>}
                                </div>
                              </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Team Members ({teamInfo.members.length})</p>
                            <div className="flex flex-wrap gap-2">
                              {teamInfo.members.map((m: any, i: number) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Team Validated</span>
                          </div>
                          <button
                            onClick={() => navigate("/team-leader/my-team")}
                            className="text-primary font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all"
                          >
                            VIEW TEAM <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Next Step Card */}
                    <div className="lg:col-span-5">
                      <div className="glass-card p-10 rounded-[3.5rem] h-full flex flex-col justify-between border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                            <Rocket className="w-10 h-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-4xl font-black text-white tracking-tighter">Problem Selection</h4>
                            <p className="text-slate-400 text-lg leading-relaxed">Your team is verified. You can now select a problem statement.</p>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate("/team-leader/problems")}
                          className="w-full bg-white text-primary py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-slate-50 transition-all relative z-10 mt-12"
                        >
                          SELECT PROBLEM <ArrowRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline/Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { step: "01", label: "Registration", status: "Completed", icon: CheckCircle, color: "emerald-500" },
                      { step: "02", label: "Verification", status: "Verified", icon: ShieldCheck, color: "primary" },
                      { step: "03", label: "Selection", status: teamInfo.problemStatementId ? "Selected" : "Active Now", icon: Zap, color: teamInfo.problemStatementId ? "emerald-500" : "accent" },
                    ].map((step, i) => (
                      <div key={i} className="glass-card p-6 rounded-3xl flex items-center gap-6 border border-white/5">
                        <div className={`text-4xl font-black text-${step.color} opacity-40 font-mono tracking-tighter`}>{step.step}</div>
                        <div>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{step.label}</p>
                          <div className="flex items-center gap-2">
                            <step.icon className={`w-4 h-4 text-${step.color}`} />
                            <p className="text-sm font-bold text-white">{step.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </TeamLeaderLayout>
  );
}

export default TeamLeaderDashboard;
