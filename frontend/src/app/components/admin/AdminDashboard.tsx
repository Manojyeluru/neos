import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  Users, UserCheck, Calendar, FileText,
  Loader2, Award, ShieldAlert,
  ArrowUpRight, Clock, ChevronRight, Trophy,
  Activity, CheckCircle2, AlertCircle, List
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";

export function AdminDashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentTeams, setRecentTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, teams] = await Promise.all([
        fetchApi("/admin/stats"),
        fetchApi("/admin/teams")
      ]);
      setStatsData(stats);
      setRecentTeams(teams.slice(-8).reverse());
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Teams",
      value: statsData?.teams ?? "—",
      icon: Users,
      color: "text-primary",
      borderColor: "border-primary/20",
      bgColor: "bg-primary/10",
      glowColor: "bg-primary/5",
      href: "/admin/teams",
      description: "Registered participants",
      trend: statsData?.teams > 0 ? "ACTIVE" : "NONE",
      trendColor: statsData?.teams > 0 ? "text-emerald-400" : "text-slate-600",
    },
    {
      label: "Active Reviewers",
      value: statsData?.reviewers ?? "—",
      icon: UserCheck,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/10",
      glowColor: "bg-emerald-500/5",
      href: "/admin/reviewers",
      description: "Assigned evaluators",
      trend: statsData?.reviewers > 0 ? "ONLINE" : "NONE",
      trendColor: statsData?.reviewers > 0 ? "text-emerald-400" : "text-slate-600",
    },
    {
      label: "Total Rounds",
      value: statsData?.rounds ?? "—",
      icon: Calendar,
      color: "text-violet-400",
      borderColor: "border-violet-500/20",
      bgColor: "bg-violet-500/10",
      glowColor: "bg-violet-500/5",
      href: "/admin/rounds",
      description: "Evaluation phases",
      trend: statsData?.rounds > 0 ? "SET" : "NONE",
      trendColor: statsData?.rounds > 0 ? "text-violet-400" : "text-slate-600",
    },
    {
      label: "Problem Statements",
      value: statsData?.problems ?? "—",
      icon: FileText,
      color: "text-cyan-400",
      borderColor: "border-cyan-400/20",
      bgColor: "bg-cyan-400/10",
      glowColor: "bg-cyan-500/5",
      href: "/admin/problems",
      description: "Active challenges",
      trend: statsData?.problems > 0 ? "LIVE" : "NONE",
      trendColor: statsData?.problems > 0 ? "text-cyan-400" : "text-slate-600",
    },
    {
      label: "Total Members",
      value: statsData?.members ?? "—",
      icon: UserCheck,
      color: "text-amber-400",
      borderColor: "border-amber-400/20",
      bgColor: "bg-amber-400/10",
      glowColor: "bg-amber-500/5",
      href: "/admin/teams",
      description: "Registered participants",
      trend: statsData?.members > 0 ? "ENROLLED" : "NONE",
      trendColor: statsData?.members > 0 ? "text-amber-400" : "text-slate-600",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
              Admin <span className="text-primary italic">Overview</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm">
              Real-time overview of event metrics and team activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl shadow-inner">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Stat Cards — Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={stat.href}
                  className="glass-card p-6 rounded-2xl group relative overflow-hidden flex flex-col gap-4 cursor-pointer hover:border-white/10 hover:shadow-xl transition-all duration-300 block"
                >
                  {/* Glow blob */}
                  <div className={`absolute -right-6 -bottom-6 w-20 h-20 ${stat.glowColor} rounded-full blur-[30px] group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

                  {/* Top row */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className={`w-11 h-11 ${stat.bgColor} ${stat.borderColor} border rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">View</span>
                      <ChevronRight className={`w-3 h-3 ${stat.color}`} />
                    </div>
                  </div>

                  {/* Value & label */}
                  <div className="relative z-10">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">{stat.label}</p>
                    <p className="text-4xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{stat.description}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 ${stat.trendColor}`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className={`h-0.5 w-0 group-hover:w-full ${stat.bgColor} rounded-full transition-all duration-500 relative z-10`} />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: "Manage Events", icon: List, href: "/admin/events", color: "text-primary", bg: "hover:bg-primary/10 hover:border-primary/30" },
            { label: "Manage Reviewers", icon: UserCheck, href: "/admin/reviewers", color: "text-emerald-400", bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30" },
            { label: "Evaluation Rounds", icon: Calendar, href: "/admin/rounds", color: "text-violet-400", bg: "hover:bg-violet-500/10 hover:border-violet-500/30" },
            { label: "Final Results", icon: Trophy, href: "/admin/results", color: "text-amber-400", bg: "hover:bg-amber-500/10 hover:border-amber-500/30" },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.href}
                className={`flex items-center gap-3 px-4 py-3.5 bg-slate-900/60 border border-white/5 rounded-xl transition-all group ${action.bg}`}
              >
                <Icon className={`w-4 h-4 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">{action.label}</span>
                <ArrowUpRight className={`w-3 h-3 ml-auto ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Link>
            );
          })}
        </motion.div>

        {/* Recent Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tighter uppercase leading-none">Recent Registrations</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Latest team sign-ups</p>
              </div>
            </div>
            <Link
              to="/admin/teams"
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black text-slate-400 hover:text-white hover:border-primary/30 transition-all uppercase tracking-widest"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[9px] text-slate-600">
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Problem Statement</th>
                  <th className="px-6 py-4">Members</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTeams.map((team, index) => (
                  <tr
                    key={index}
                    onClick={() => navigate("/admin/teams")}
                    className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors text-[9px] font-black text-primary">
                          {(team.teamName || 'T')[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white leading-tight">{team.teamName}</span>
                          <span className="text-[9px] font-mono text-slate-600 mt-0.5 uppercase">{team.teamId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${team.problemStatementId ? 'bg-accent' : 'bg-slate-700'}`} />
                        <span className={`text-xs font-bold ${team.problemStatementId ? 'text-accent' : 'text-slate-600 italic uppercase'}`}>
                          {team.problemStatementId?.id || team.problemStatementId || "Not Selected"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-400">{team.members?.length ?? 1}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${team.locked
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : team.paymentStatus === 'Pending'
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-slate-800 text-slate-500 border-white/5"
                          }`}
                      >
                        <div className={`w-1 h-1 rounded-full ${team.locked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {team.locked ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTeams.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5">
                          <ShieldAlert className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No registrations yet</p>
                        <Link to="/admin/events" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                          Create an Event →
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              Showing {recentTeams.length} of {statsData?.teams ?? 0} teams
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Last updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </AdminLayout>
  );
}
