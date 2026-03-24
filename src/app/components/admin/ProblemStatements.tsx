import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  Upload, Trash2, Edit, Save,
  FileText, Shield, Zap, Search,
  Filter, Plus, Loader2, AlertCircle,
  ChevronRight, Brain, Target, Cpu,
  Lock, Unlock
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Problem {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
}

export function ProblemStatements() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [newData, setNewData] = useState({
    id: "",
    title: "",
    description: "",
    category: "Intermediate"
  });

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    category: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [problemsData, settingsData] = await Promise.all([
        fetchApi("/team/problem-statements"),
        fetchApi("/admin/settings")
      ]);
      setProblems(problemsData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load problem statements.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRelease = async () => {
    if (!settings) return;
    try {
      const updatedSettings = { ...settings, problemsReleased: !settings.problemsReleased };
      await fetchApi("/admin/settings", {
        method: "POST",
        body: JSON.stringify(updatedSettings)
      });
      setSettings(updatedSettings);
      toast.success(updatedSettings.problemsReleased ? "Problem statements are now visible to teams." : "Problem statements are now hidden from teams.");
    } catch (err) {
      toast.error("Failed to update release status.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newData.id || !newData.title || !newData.description) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi("/admin/problem-statements", {
        method: "POST",
        body: JSON.stringify(newData),
      });
      toast.success(`Problem statement ${newData.id} added successfully.`);
      setNewData({ id: "", title: "", description: "", category: "Intermediate" });
      setIsAdding(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to add problem statement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (problem: Problem) => {
    setEditingId(problem._id);
    setEditData({
      title: problem.title,
      description: problem.description,
      category: problem.category,
    });
  };

  const handleSaveEdit = async (id: string) => {
    setSubmitting(true);
    try {
      await fetchApi(`/admin/problem-statements/${id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });
      toast.success("Problem statement updated successfully.");
      setEditingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update objective.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete problem statement ${code}?`)) return;
    try {
      await fetchApi(`/admin/problem-statements/${id}`, {
        method: "DELETE",
      });
      toast.success(`Problem statement ${code} deleted.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Deletion failed.");
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Basic": return "text-emerald-400 bg-emerald-400/5 border-emerald-400/20";
      case "Intermediate": return "text-amber-400 bg-amber-400/5 border-amber-400/20";
      case "Advanced": return "text-rose-400 bg-rose-400/5 border-rose-400/20";
      default: return "text-cyan-400 bg-cyan-400/5 border-cyan-400/20";
    }
  };

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
              Problem <span className="text-primary italic">Statements</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl">
              Manage problem statements for team evaluations.
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleRelease}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl border ${settings?.problemsReleased
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10"
                }`}
            >
              {settings?.problemsReleased ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {settings?.problemsReleased ? "Visible" : "Release to Teams"}
            </motion.button>

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
              {isAdding ? "Cancel" : "Add New Problem"}
            </motion.button>
          </div>
        </div>

        {/* Global Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Problems", value: problems.length, icon: Brain, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
            { label: "Ready", value: problems.length, icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
            { label: "Avg. Difficulty", value: "Intermediate", icon: Cpu, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
            { label: "Status", value: "Locked", icon: Shield, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" }
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
                  <p className="text-xl font-black text-white tracking-widest">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Objective Creation Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[3rem] p-10 border border-primary/20 shadow-primary/10"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                    Add New <span className="text-primary italic">Problem Statement</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Problem Details</p>
                </div>
              </div>

              <form onSubmit={handleUpload} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Problem ID</label>
                    <div className="relative group">
                      <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. P001"
                        value={newData.id}
                        onChange={(e) => setNewData({ ...newData, id: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Problem Title</label>
                    <div className="relative group">
                      <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Enter problem title"
                        value={newData.title}
                        onChange={(e) => setNewData({ ...newData, title: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Difficulty</label>
                    <select
                      className="w-full px-8 py-5 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl text-white font-bold appearance-none outline-none shadow-inner"
                      value={newData.category}
                      onChange={(e) => setNewData({ ...newData, category: e.target.value })}
                    >
                      <option>Basic</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed problem description"
                    value={newData.description}
                    onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                    className="w-full px-8 py-6 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl text-white font-medium outline-none shadow-inner resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Problem Document (PDF)</label>
                    <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-10 text-center hover:border-primary/50 transition-all cursor-pointer group bg-slate-900/50 shadow-inner">
                      <Upload className="w-12 h-12 text-slate-700 mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-slate-600 font-bold mt-2 tracking-widest uppercase">PDF (MAX. 10MB)</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                      Add Problem Statement
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="w-full py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Cancel action
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Objectives Registry */}
        <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                <FileText className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">All Problem Statements</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Manage all problem statements</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative group min-w-[320px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search by ID or Category..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all outline-none text-white"
                />
              </div>
              <button className="p-4 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-2xl transition-all shadow-inner">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Problems...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
                    <th className="px-10 py-8">Problem ID</th>
                    <th className="px-10 py-8">Title & Description</th>
                    <th className="px-10 py-8 text-center">Difficulty</th>
                    <th className="px-10 py-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {problems.map((problem) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={problem._id}
                        className="group hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center font-black text-[10px] text-primary shadow-inner">
                              {problem.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 max-w-xl">
                          {editingId === problem._id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none"
                              />
                              <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-primary/50 outline-none h-24"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white leading-tight uppercase group-hover:text-primary transition-colors">{problem.title}</span>
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">{problem.description}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8 text-center">
                          {editingId === problem._id ? (
                            <select
                              value={editData.category}
                              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white outline-none"
                            >
                              <option>Basic</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getCategoryColor(problem.category)}`}>
                              {problem.category}
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            {editingId === problem._id ? (
                              <button
                                onClick={() => handleSaveEdit(problem._id)}
                                className="w-11 h-11 flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(problem)}
                                className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(problem._id, problem.id)}
                              className="w-11 h-11 flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {problems.length === 0 && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={4} className="px-10 py-32 text-center">
                          <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner">
                              <Target className="w-10 h-10 text-slate-700" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs italic">No problem statements found.</p>
                              <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest">Start by adding a new problem statement.</p>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Admin Sync</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Problem Statements: {problems.length}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
