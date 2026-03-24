import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { Plus, Save, Trash2, Loader2, CheckCircle2, Circle, Calendar, Target, Shield, Clock, Search, Filter, Edit } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";

interface Round {
  _id: string;
  roundNumber: number;
  name: string;
  date: string;
  active: boolean;
  criteriaCount?: number;
  totalMaxMarks?: number;
}

export function ManageRounds() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [newRound, setNewRound] = useState({ name: "", date: "", roundNumber: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      const [roundsData, settingsData] = await Promise.all([
        fetchApi("/admin/rounds"),
        fetchApi("/admin/settings")
      ]);
      setRounds(roundsData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load evaluation rounds.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRound.name) {
      toast.error("Please provide a name for the round.");
      return;
    }

    setSubmitting(true);
    try {
      await fetchApi("/admin/rounds", {
        method: "POST",
        body: JSON.stringify({
          ...newRound,
          active: false
        })
      });
      setNewRound({ name: "", date: "", roundNumber: rounds.length + 2 });
      setIsAdding(false);
      toast.success(`Evaluation round ${newRound.name} created successfully.`);
      loadRounds();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create evaluation round.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRound) return;

    setSubmitting(true);
    try {
      await fetchApi("/admin/rounds", {
        method: "POST", // The backend uses POST for upsert
        body: JSON.stringify(editingRound)
      });
      setEditingRound(null);
      toast.success(`Evaluation round updated successfully.`);
      loadRounds();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update round.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRoundStatus = async (round: Round) => {
    try {
      await fetchApi("/admin/rounds", {
        method: "POST",
        body: JSON.stringify({
          ...round,
          active: !round.active
        })
      });
      toast.success(`Round ${round.roundNumber} status updated.`);
      loadRounds();
    } catch (err) {
      console.error(err);
      toast.error("Failed to change round status.");
    }
  };

  const handleDeleteRound = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete round "${name}" and all its data?`)) return;

    try {
      await fetchApi(`/admin/rounds/${id}`, { method: "DELETE" });
      toast.success(`Round ${name} deleted successfully.`);
      loadRounds();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete round.");
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
            className="space-y-1"
          >
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
              Evaluation <span className="text-primary italic">Rounds</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
              Manage evaluation rounds and scheduling for the event.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl ${isAdding
              ? "bg-slate-800 text-slate-400 border border-white/5"
              : "bg-primary text-white shadow-primary/20"
              }`}
          >
            {isAdding ? <Clock className="w-5 h-5 text-amber-500 animate-pulse" /> : <Plus className="w-5 h-5" />}
            {isAdding ? "Cancel" : "Add New Round"}
          </motion.button>
        </div>

        {/* Tactical Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Rounds", value: rounds.length, icon: Target, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
            { label: "Active", value: rounds.filter(r => r.active).length, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
            { label: "Next Round", value: rounds.find(r => !r.active)?.name || "TBD", icon: Calendar, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
            { label: "Round Sync", value: `${rounds.length} / ${settings?.totalRounds || '...'}`, icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-[1.5rem] relative overflow-hidden group"
            >
              <div className={`absolute -right-8 -bottom-8 w-24 h-24 ${stat.bg} rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700`} />
              <div className="relative z-10 flex flex-col gap-3">
                <div className={`w-10 h-10 ${stat.bg} ${stat.border} border rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-lg font-black text-white tracking-widest">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Phase Initialization & Edit Form */}
        <AnimatePresence mode="wait">
          {(isAdding || editingRound) && (
            <motion.div
              key={editingRound ? "edit" : "add"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-[3rem] p-10 border border-primary/20 shadow-primary/10"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                  {editingRound ? <Edit className="w-6 h-6 text-primary" /> : <Calendar className="w-6 h-6 text-primary" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                    Round <span className="text-primary italic">{editingRound ? "Edit" : "Creation"}</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
                    {editingRound ? "Edit round details" : "Enter round name"}
                  </p>
                </div>
              </div>

              <form onSubmit={editingRound ? handleUpdateRound : handleAddRound} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Round Number</label>
                  <div className="relative group">
                    <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                    <input
                      type="number"
                      value={editingRound ? editingRound.roundNumber : newRound.roundNumber}
                      onChange={(e) => editingRound
                        ? setEditingRound({ ...editingRound, roundNumber: parseInt(e.target.value) })
                        : setNewRound({ ...newRound, roundNumber: parseInt(e.target.value) })}
                      className="w-full pl-14 pr-6 py-5 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold shadow-inner"
                    />
                  </div>
                </div>
                <div className="md:col-span-3 space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Round Name</label>
                  <div className="relative group">
                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={editingRound ? editingRound.name : newRound.name}
                      onChange={(e) => editingRound
                        ? setEditingRound({ ...editingRound, name: e.target.value })
                        : setNewRound({ ...newRound, name: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold placeholder:text-slate-700 shadow-inner"
                      placeholder="e.g. Round 1, Final Round"
                    />
                  </div>
                </div>
                <div className="md:col-span-4 flex justify-end gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingRound(null); }}
                    className="px-8 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-3 px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {editingRound ? "Save Changes" : "Add Round"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase Registry List */}
        <div className="glass-card rounded-[1.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                <Target className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tighter uppercase leading-none">All Evaluation Rounds</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Manage all evaluation rounds</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative group min-w-[320px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all outline-none text-white"
                />
              </div>
              <button className="p-4 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-2xl transition-all shadow-inner">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
                  <th className="px-10 py-8">Round</th>
                  <th className="px-10 py-8">Details</th>
                  <th className="px-10 py-8 text-center">Criteria Count</th>
                  <th className="px-10 py-8 text-center">Total Marks</th>
                  <th className="px-10 py-8 text-center">Status</th>
                  <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {rounds.length > 0 ? (
                    rounds.map((round) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={round._id}
                        className="group hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center font-black text-[10px] text-primary shadow-inner">
                              PH_{round.roundNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-white leading-tight uppercase group-hover:text-primary transition-colors">{round.name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-black">
                            {round.criteriaCount || 0} Criteria
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-black">
                            {round.totalMaxMarks || 0} Marks
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <button
                            onClick={() => toggleRoundStatus(round)}
                            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${round.active
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                              : "bg-slate-900 text-slate-500 border-white/5"
                              }`}
                          >
                            {round.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                            {round.active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <Link
                              to={`/admin/criteria?round=${round.roundNumber}`}
                              className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg"
                              title="MANAGE EVALUATION CRITERIA"
                            >
                              <Target className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => { setEditingRound(round); setIsAdding(false); }}
                              className="w-12 h-12 flex items-center justify-center bg-white/5 text-slate-400 border border-white/5 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRound(round._id, round.name)}
                              className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner">
                            <Target className="w-10 h-10 text-slate-700" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs font-inter italic">No evaluation rounds found.</p>
                            <p className="text-slate-700 text-[10px] font-bold uppercase tracking-widest">Start by adding a new evaluation round.</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Timeline Sync</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Rounds: {rounds.length}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
