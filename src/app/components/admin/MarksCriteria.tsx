import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  Plus, Save, Trash2, Loader2, Target,
  Info, Edit, Check, X,
  Zap, TrendingUp, AlertTriangle,
  ChevronRight, Hash, BarChart3, Layers, FileText
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "react-router";

interface Criteria {
  _id: string;
  name: string;
  description: string;
  maxMarks: number;
  roundNumber: number;
}

export function MarksCriteria() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roundFromUrl = queryParams.get('round');

  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(roundFromUrl ? parseInt(roundFromUrl) : 1);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newCriteria, setNewCriteria] = useState({ name: "", description: "", maxMarks: "10" });
  const [editData, setEditData] = useState({ name: "", description: "", maxMarks: "" });

  useEffect(() => { loadRounds(); }, []);
  useEffect(() => { if (selectedRound) loadCriteria(selectedRound); }, [selectedRound]);

  const loadRounds = async () => {
    try {
      const data = await fetchApi("/admin/rounds");
      setRounds(data);
      if (data.length > 0 && !roundFromUrl) setSelectedRound(data[0].roundNumber);
    } catch (err) {
      toast.error("Failed to load evaluation phases.");
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async (roundNum: number) => {
    setLoading(true);
    try {
      const data = await fetchApi(`/admin/criteria/${roundNum}`);
      setCriteria(data);
    } catch (err) {
      toast.error("Failed to load criteria.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriteria = async () => {
    const marks = parseInt(newCriteria.maxMarks);
    if (!newCriteria.name || isNaN(marks) || marks <= 0) {
      toast.error("Criteria name and valid marks are required.");
      return;
    }
    setSubmitting(true);
    try {
      await fetchApi("/admin/criteria", {
        method: "POST",
        body: JSON.stringify({
          name: newCriteria.name,
          description: newCriteria.description,
          maxMarks: marks,
          roundNumber: selectedRound
        })
      });
      setNewCriteria({ name: "", description: "", maxMarks: "10" });
      toast.success("Criteria added successfully.");
      loadCriteria(selectedRound);
      loadRounds();
    } catch (err: any) {
      toast.error(err.message || "Failed to save criteria.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (criteria.length > 0 && !window.confirm("Existing criteria found. Initialize defaults anyway?")) return;
    setSubmitting(true);
    try {
      await fetchApi("/admin/criteria/initialize-defaults", {
        method: "POST",
        body: JSON.stringify({ roundNumber: selectedRound })
      });
      toast.success("Default criteria deployed.");
      loadCriteria(selectedRound);
      loadRounds();
    } catch (err) {
      toast.error("Initialization failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: Criteria) => {
    setEditingId(c._id);
    setEditData({ name: c.name, description: c.description || "", maxMarks: c.maxMarks.toString() });
  };

  const handleSaveEdit = async (id: string) => {
    const marks = parseInt(editData.maxMarks);
    if (!editData.name || isNaN(marks)) return;
    try {
      await fetchApi(`/admin/criteria/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editData.name, description: editData.description, maxMarks: marks })
      });
      toast.success("Criteria updated.");
      setEditingId(null);
      loadCriteria(selectedRound);
      loadRounds();
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleDeleteCriteria = async (id: string) => {
    if (!window.confirm("Delete this criteria permanently?")) return;
    try {
      await fetchApi(`/admin/criteria/${id}`, { method: "DELETE" });
      toast.success("Criteria removed.");
      loadCriteria(selectedRound);
      loadRounds();
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const totalMarks = criteria.reduce((sum, c) => sum + (c.maxMarks || 0), 0);
  const selectedRoundData = rounds.find(r => r.roundNumber === selectedRound);

  const roundColors = [
    { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", activeBg: "bg-primary/20" },
    { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", activeBg: "bg-emerald-500/20" },
    { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", activeBg: "bg-violet-500/20" },
    { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", activeBg: "bg-amber-500/20" },
    { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", activeBg: "bg-cyan-500/20" },
  ];
  const criteriaColors = ['text-primary', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-cyan-400', 'text-rose-400'];
  const criteriaDots = ['bg-primary', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
              Scoring <span className="text-primary italic">Criteria</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Define criteria with name, description, and marks for each round. Reviewers see these when scoring teams.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-white/5 rounded-2xl p-1">
            {[
              { label: "Rounds", value: rounds.length, color: "text-white" },
              { label: "Criteria", value: criteria.length, color: "text-primary" },
              { label: "Total Marks", value: totalMarks, color: "text-white" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center px-5 py-2.5">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{s.label}</span>
                <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-4">

            {/* Round Selector */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evaluation Rounds</span>
                </div>
                <span className="text-[9px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded-lg">{rounds.length} phases</span>
              </div>
              <div className="space-y-2">
                {rounds.map((r, idx) => {
                  const color = roundColors[idx % roundColors.length];
                  const isActive = selectedRound === r.roundNumber;
                  return (
                    <button key={r._id} onClick={() => setSelectedRound(r.roundNumber)}
                      className={`w-full text-left rounded-xl border transition-all group overflow-hidden ${isActive ? `${color.activeBg} ${color.border}` : "bg-slate-900/60 border-white/5 hover:border-white/10"}`}
                    >
                      <div className="p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${isActive ? color.bg : 'bg-slate-800'} flex items-center justify-center`}>
                              <span className={`text-sm font-black ${isActive ? color.text : 'text-slate-500'}`}>{r.roundNumber}</span>
                            </div>
                            <div>
                              <p className={`text-xs font-black uppercase tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-400'}`}>Round {r.roundNumber}</p>
                              <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? color.text : 'text-slate-600'}`}>{r.name}</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 transition-all ${isActive ? `${color.text} rotate-90` : 'text-slate-700'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black flex items-center gap-1 ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Hash className="w-2.5 h-2.5" />{r.criteriaCount ?? 0} criteria
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${isActive ? `${color.bg} ${color.text}` : 'bg-white/5 text-slate-600'}`}>
                            {r.totalMaxMarks ?? 0} pts
                          </span>
                        </div>
                        {(r.criteriaCount ?? 0) > 0 && (
                          <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color.text.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, ((r.criteriaCount ?? 0) / 10) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {rounds.length === 0 && (
                  <div className="py-8 text-center">
                    <AlertTriangle className="w-7 h-7 text-amber-500/40 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No rounds found. Create rounds first.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Add Criteria Form */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Add Criteria</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Round {selectedRound} — {selectedRoundData?.name || '...'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Criteria Name *</label>
                  <input
                    type="text"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-xl outline-none text-white font-bold text-sm placeholder:text-slate-700 transition-all"
                    placeholder="e.g. Innovation & Originality"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
                    Description <span className="text-slate-700 normal-case font-medium">(shown to reviewers)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-xl outline-none text-white font-medium text-sm placeholder:text-slate-700 resize-none transition-all"
                    placeholder="Explain what reviewers should assess for this criteria..."
                  />
                </div>

                {/* Marks quick-select */}
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Maximum Marks *</label>
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {[5, 10, 15, 20, 25, 30].map(v => (
                      <button key={v} type="button"
                        onClick={() => setNewCriteria({ ...newCriteria, maxMarks: v.toString() })}
                        className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${newCriteria.maxMarks === v.toString() ? 'bg-primary text-white' : 'bg-slate-900 border border-white/5 text-slate-500 hover:text-white'}`}
                      >{v}</button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={newCriteria.maxMarks}
                    onChange={(e) => setNewCriteria({ ...newCriteria, maxMarks: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-xl outline-none text-white font-black text-xl text-center transition-all"
                    min="1"
                  />
                </div>

                <button
                  onClick={handleAddCriteria}
                  disabled={submitting || !newCriteria.name}
                  className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Add to Round {selectedRound}
                </button>

                {selectedRound === 1 && criteria.length === 0 && (
                  <button onClick={handleInitializeDefaults}
                    className="w-full py-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3 h-3" /> Load Default Criteria for Round 1
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Criteria List */}
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl">

              {/* Panel header */}
              <div className="p-5 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-black text-primary">{selectedRound}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight leading-none">
                        Round {selectedRound} — {selectedRoundData?.name || 'Loading...'}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {criteria.length} criteria · {totalMarks} total marks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center px-3 py-2 bg-slate-900 border border-white/5 rounded-xl">
                      <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Criteria</span>
                      <span className="text-lg font-black text-white">{criteria.length}</span>
                    </div>
                    <div className="flex flex-col items-center px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                      <span className="text-[7px] font-black text-primary uppercase tracking-widest">Max Marks</span>
                      <span className="text-lg font-black text-white">{totalMarks}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                  </div>
                </div>

                {/* Color breakdown bar */}
                {criteria.length > 0 && (
                  <div>
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                      {criteria.map((c, i) => (
                        <div key={c._id}
                          className={`${criteriaDots[i % criteriaDots.length]} rounded-full transition-all duration-500`}
                          style={{ width: `${totalMarks > 0 ? (c.maxMarks / totalMarks) * 100 : 0}%` }}
                          title={`${c.name}: ${c.maxMarks} pts`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {criteria.map((c, i) => (
                        <div key={c._id} className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${criteriaDots[i % criteriaDots.length]}`} />
                          <span className={`text-[8px] font-bold ${criteriaColors[i % criteriaColors.length]} uppercase tracking-widest`}>
                            {c.name} ({c.maxMarks}pts)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Criteria list */}
              <div className="p-4 space-y-3 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    </div>
                  ) : criteria.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 space-y-3"
                    >
                      <div className="w-14 h-14 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center">
                        <Info className="w-6 h-6 text-slate-700" />
                      </div>
                      <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No criteria for Round {selectedRound}</p>
                      <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Add via the form on the left</p>
                    </motion.div>
                  ) : (
                    criteria.map((c, idx) => {
                      const color = criteriaColors[idx % criteriaColors.length];
                      const dotColor = criteriaDots[idx % criteriaDots.length];
                      const pct = totalMarks > 0 ? Math.round((c.maxMarks / totalMarks) * 100) : 0;
                      const isEditing = editingId === c._id;

                      return (
                        <motion.div key={c._id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.04 }}
                          className="group relative p-4 bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-xl transition-all"
                        >
                          {isEditing ? (
                            // Edit mode
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Name</label>
                                  <input type="text" value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-primary/30 rounded-lg px-3 py-2 text-white font-bold outline-none text-sm"
                                    autoFocus
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Max Marks</label>
                                  <input type="number" value={editData.maxMarks}
                                    onChange={(e) => setEditData({ ...editData, maxMarks: e.target.value })}
                                    className="w-full bg-slate-950 border border-primary/30 rounded-lg px-3 py-2 text-white font-black text-center outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Description</label>
                                <textarea rows={2} value={editData.description}
                                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                  className="w-full bg-slate-950 border border-primary/30 rounded-lg px-3 py-2 text-white font-medium outline-none text-sm resize-none"
                                  placeholder="Optional description for reviewers..."
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-all text-xs font-black flex items-center gap-1.5">
                                  <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                                <button onClick={() => handleSaveEdit(c._id)} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-xs font-black flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" /> Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className="flex items-start gap-3">
                              {/* Index */}
                              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <span className={`text-xs font-black ${color}`}>{idx + 1}</span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{c.name}</p>
                                    {c.description && (
                                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                                        {c.description}
                                      </p>
                                    )}
                                    {!c.description && (
                                      <p className="text-[9px] text-slate-700 italic mt-0.5">No description added</p>
                                    )}
                                  </div>

                                  {/* Marks */}
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Max</p>
                                      <p className={`text-2xl font-black ${color} tracking-tighter leading-none`}>{c.maxMarks}</p>
                                      <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{pct}% of total</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEdit(c)} className="w-8 h-8 bg-slate-800 text-slate-400 rounded-lg hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center">
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handleDeleteCriteria(c._id)} className="w-8 h-8 bg-slate-800 text-slate-500 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center justify-center">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Mini progress bar */}
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${dotColor}`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-[8px] font-black text-slate-700 w-8 text-right">{pct}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-slate-600" />
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    Reviewers see name, description & max marks for Round {selectedRound}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-slate-700" />
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{criteria.length} criteria · {totalMarks} pts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
