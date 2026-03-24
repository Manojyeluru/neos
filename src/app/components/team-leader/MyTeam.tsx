import { useState, useEffect } from "react";
import { TeamLeaderLayout } from "../layouts/TeamLeaderLayout";
import { fetchApi } from "../../utils/api";
import {
  Users, User, Mail, Phone, Hash,
  FileText, Award, Calendar, Shield,
  ChevronRight, Sparkles, Zap, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export function MyTeam() {
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      loadTeamData(user.uniqueId);
    }
  }, []);

  const loadTeamData = async (id: string) => {
    try {
      const data = await fetchApi(`/team/info/${id}`);
      setTeamData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeamLeaderLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Team Data...</p>
        </div>
      </TeamLeaderLayout>
    );
  }

  if (!teamData) {
    return (
      <TeamLeaderLayout>
        <div className="max-w-4xl mx-auto p-12 text-center glass-card rounded-[2rem]">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">Error</h2>
          <p className="text-slate-400">Team data could not be retrieved. Please log in again.</p>
        </div>
      </TeamLeaderLayout>
    );
  }

  return (
    <TeamLeaderLayout>
      <div className="max-w-6xl mx-auto pb-20 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight uppercase">{teamData.teamName}</h2>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-mono text-sm ml-1">
              <span className="flex items-center gap-1.5"><Hash className="w-4 h-4 text-accent" /> {teamData.teamId}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Team Leader: {teamData.leaderId?.name || teamData.leaderName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 shadow-inner rounded-2xl border border-white/5">
            <div className={`w-3 h-3 rounded-full ${teamData.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'} shadow-[0_0_10px_rgba(16,185,129,0.3)]`} />
            <span className="text-xs font-black text-white uppercase tracking-widest">{teamData.status || 'Active'} Registration</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: The Squad Members */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Team Members</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leader Highlight */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-3xl border-2 border-primary/30 bg-primary/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <Shield className="w-5 h-5 text-primary opacity-50" />
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-primary/20">
                      {(teamData.leaderId?.name || teamData.leaderName || "L").charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Team Leader</p>
                      <h4 className="text-xl font-bold text-white mb-1">{teamData.leaderId?.name || teamData.leaderName}</h4>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Mail className="w-3.5 h-3.5" />
                        {teamData.leaderId?.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Other Members */}
                {(teamData.members || []).slice(1).map((member: any, index: number) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center font-black text-slate-500 text-xl group-hover:text-white transition-colors">
                        {member.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white">{member.name}</h4>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                            <Mail className="w-3.5 h-3.5" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Problem Selection Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Problem Statement Assignment</h3>
              </div>

              <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                {teamData.problemStatementId ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="px-4 py-1 bg-accent/20 border border-accent/30 rounded-full inline-block">
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Active Challenge</span>
                      </div>
                      <h4 className="text-3xl font-black text-white tracking-tight">{teamData.problemStatementId}</h4>
                      <p className="text-slate-400 max-w-md">Your problem statement has been locked in. Prepare your technical project for evaluation.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <FileText className="w-10 h-10 text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Assigned</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white mb-2 tracking-tight">No Problem Statement Selected</h4>
                      <p className="text-slate-500 max-w-sm mx-auto">Your team has not selected a problem statement yet. Select one to activate evaluation rounds.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Stats & Affiliation */}
          <div className="space-y-8">
            {/* Payment Status Card */}
            <section className="glass-card p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Status</p>
                  <h4 className="text-lg font-black text-white">Registration Fee</h4>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                  <span className="text-sm font-bold text-slate-400">Current Status</span>
                  {teamData.paymentStatus === 'Verified' ? (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Verified</span>
                    </div>
                  ) : teamData.paymentStatus === 'Rejected' ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase">Rejected</span>
                    </div>
                  ) : teamData.paymentStatus === 'Free' ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="text-xs font-black uppercase tracking-widest">Free Entry</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <AlertCircle className="w-4 h-4" />
                      </motion.div>
                      <span className="text-xs font-black uppercase">Pending Review</span>
                    </div>
                  )}
                </div>

                {teamData.paymentReference && (
                  <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 text-center">Reference Number</p>
                    <p className="text-sm font-mono text-center text-slate-400">{teamData.paymentReference}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Affiliation Card */}
            <section className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-black text-white tracking-tight">College Details</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institution</p>
                  <p className="text-sm font-bold text-white">{teamData.leaderId?.institutionName || 'Kalasalingam Academy'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</p>
                    <p className="text-sm font-bold text-white">{teamData.leaderId?.department || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Year</p>
                    <p className="text-sm font-bold text-white">{teamData.leaderId?.year || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </TeamLeaderLayout>
  );
}
