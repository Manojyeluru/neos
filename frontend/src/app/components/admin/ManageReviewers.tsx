import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Plus, Save, Trash2, Mail, User, Briefcase, Search, Filter, ShieldCheck, Zap, Activity, Info, Loader2, Lock, Link, Send, Copy, ExternalLink, Check, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchApi } from "../../utils/api";

interface Reviewer {
  _id: string;
  id: string;
  name: string;
  email: string;
  expertise: string;
  teamsAssigned: number;
}

export function ManageReviewers() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newReviewer, setNewReviewer] = useState({
    name: "",
    email: "",
    expertise: "",
    password: "",
    sendLoginLink: true
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadReviewers();
  }, []);

  const loadReviewers = async () => {
    try {
      const data = await fetchApi("/admin/reviewers");
      setReviewers(data.map((r: any) => ({
        ...r,
        expertise: r.department || "General"
      })));
    } catch (err: any) {
      console.error(err);
      toast.error(`DATA LOSS: ${err.message || "Failed to intercept validator registry."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewer.name || !newReviewer.email || !newReviewer.expertise || !newReviewer.password) {
      toast.error("MISSION FAILED: Missing essential credentials.");
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi("/admin/add-reviewer", {
        method: "POST",
        body: JSON.stringify(newReviewer)
      });
      toast.success(newReviewer.sendLoginLink
        ? `VALIDATOR SYNCED: Credentials beamed to ${newReviewer.email}.`
        : `VALIDATOR SYNCED: ${newReviewer.name} is now operational.`);
      setNewReviewer({ name: "", email: "", expertise: "", password: "", sendLoginLink: true });
      setIsAdding(false);
      loadReviewers();
    } catch (err: any) {
      toast.error(err.message || "Failed to commission validator.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSubmitting(true);
    try {
      await fetchApi(`/admin/reviewers/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: newReviewer.name,
          email: newReviewer.email,
          expertise: newReviewer.expertise
        })
      });
      toast.success("VALIDATOR RECORDS UPDATED: Protocol synchronized.");
      setNewReviewer({ name: "", email: "", expertise: "", password: "", sendLoginLink: true });
      setEditingId(null);
      setIsAdding(false);
      loadReviewers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update validator records.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (reviewer: Reviewer) => {
    setNewReviewer({
      name: reviewer.name,
      email: reviewer.email,
      expertise: reviewer.expertise,
      password: "UNCHANGED", // Not used for updates
      sendLoginLink: false
    });
    setEditingId(reviewer._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyMagicLink = async (reviewerId: string) => {
    try {
      const data = await fetchApi(`/admin/reviewers/${reviewerId}/generate-link`, {
        method: "POST"
      });
      await navigator.clipboard.writeText(data.loginUrl);
      toast.success("UPLINK SECURED: Access token copied to clipboard.");
    } catch (err) {
      toast.error("Signal Jammed: Failed to generate access link.");
    }
  };

  const handleDeleteReviewer = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to decommission ${name}?`)) return;
    try {
      await fetchApi(`/admin/reviewers/${id}`, { method: "DELETE" });
      toast.success(`ACCESS REVOKED: Reviewer ${name} decommissioned.`);
      loadReviewers();
    } catch (err) {
      toast.error("Action denied by security protocol.");
    }
  };

  const filteredReviewers = reviewers.filter(r => {
    const search = searchQuery.toLowerCase();
    return (
      (r.name?.toLowerCase() || "").includes(search) ||
      (r.email?.toLowerCase() || "").includes(search) ||
      (r.expertise?.toLowerCase() || "").includes(search) ||
      (r.id?.toLowerCase() || "").includes(search)
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12 font-inter">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Expert <span className="text-primary italic">Validators</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl">
              Register and commission high-level reviewers for tactical evaluation rounds.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl ${isAdding
              ? "bg-slate-800 text-slate-400 border border-white/5"
              : "bg-primary text-white shadow-primary/20"
              }`}
          >
            {isAdding ? <Zap className="w-5 h-5 text-amber-500 animate-pulse" /> : <Plus className="w-5 h-5" />}
            {isAdding ? "Abort Deployment" : "Commission New Validator"}
          </motion.button>
        </div>

        {/* Tactical Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Validators", value: reviewers.length, icon: ShieldCheck, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
            { label: "Active Loads", value: reviewers.reduce((sum, r) => sum + r.teamsAssigned, 0), icon: Activity, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
            { label: "Sectors Covered", value: new Set(reviewers.map(r => r.expertise)).size, icon: Zap, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
            { label: "Efficiency Rating", value: "98.4%", icon: Info, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${stat.bg} rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-700`} />
              <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.border} border rounded-2xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-3xl font-black text-white tracking-widest">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add Validator Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-[3rem] border border-white/5 overflow-hidden mb-12"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                      {editingId ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {editingId ? "Modify Tactical Protocol" : "Deployment Protocol"}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setNewReviewer({ name: "", email: "", expertise: "", password: "", sendLoginLink: true });
                    }}
                    className="p-3 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <form onSubmit={editingId ? handleUpdateReviewer : handleAddReviewer} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 font-inter">Full Identity Name</label>
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all font-inter"
                        placeholder="e.g. Dr. Sarah Chen"
                        value={newReviewer.name}
                        onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 font-inter">Uplink (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all font-inter"
                        placeholder="uplink@domain.com"
                        value={newReviewer.email}
                        onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 font-inter">Specialization</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all font-inter"
                        placeholder="AI, Security, Cloud etc."
                        value={newReviewer.expertise}
                        onChange={(e) => setNewReviewer({ ...newReviewer, expertise: e.target.value })}
                      />
                    </div>
                  </div>

                  {!editingId && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 font-inter">Security Cipher</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                          type="password"
                          className="w-full bg-slate-950 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all font-inter"
                          placeholder="••••••••"
                          value={newReviewer.password}
                          onChange={(e) => setNewReviewer({ ...newReviewer, password: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
                    {!editingId && (
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newReviewer.sendLoginLink ? "bg-primary border-primary" : "border-white/10 group-hover:border-white/20"}`}>
                          {newReviewer.sendLoginLink && <Check className="w-4 h-4 text-white" />}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={newReviewer.sendLoginLink}
                            onChange={(e) => setNewReviewer({ ...newReviewer, sendLoginLink: e.target.checked })}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Beam Access Link to Email</span>
                      </label>
                    )}

                    <div className="flex items-center gap-4 w-full md:w-auto ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setEditingId(null);
                          setNewReviewer({ name: "", email: "", expertise: "", password: "", sendLoginLink: true });
                        }}
                        className="flex-1 md:flex-none py-5 px-10 bg-slate-900 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all shadow-inner"
                      >
                        Discard Protocol
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 md:flex-none py-5 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            {editingId ? "Update Validator" : "Commission Validator"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validator Registry List */}
        <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          {/* List Controls */}
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Validator Logs</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Active Strategic Personnel</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Intercept signal (Search Name, ID...)"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all font-inter shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-4 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-2xl transition-all shadow-inner">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
                  <th className="px-10 py-8">Tactical Personnel</th>
                  <th className="px-10 py-8">Uplink Signal</th>
                  <th className="px-10 py-8">Mission Specialization</th>
                  <th className="px-10 py-8 text-center">Engagement</th>
                  <th className="px-10 py-8 text-right">Operational Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Personnel Registry...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredReviewers.length > 0 ? (
                      filteredReviewers.map((reviewer) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={reviewer._id}
                          className="group hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center font-black text-primary shadow-inner">
                                <span className="text-[8px] opacity-50 mb-0.5">ID</span>
                                <span className="text-[10px]">{reviewer.id}</span>
                              </div>
                              <div>
                                <p className="text-lg font-black text-white leading-tight">{reviewer.name}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Verified Validator</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <span className="text-sm font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center gap-3">
                              <Mail className="w-4 h-4 text-slate-600" />
                              {reviewer.email}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span className="text-xs font-black uppercase tracking-widest text-accent">
                                {reviewer.expertise}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xl font-black text-white">{reviewer.teamsAssigned}</span>
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Target Units</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <button
                                onClick={() => startEditing(reviewer)}
                                className="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                                title="Update Validator Record"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCopyMagicLink(reviewer._id)}
                                className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg"
                                title="Copy Magic Access Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReviewer(reviewer._id, reviewer.name)}
                                className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                title="Revoke Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={5} className="px-10 py-32 text-center">
                          <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner">
                              <Search className="w-10 h-10 text-slate-700" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">No matching signals found</p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                              >
                                Reset Intercept Filters
                              </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cryptographic Signal Active</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Personnel DB Operational</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
