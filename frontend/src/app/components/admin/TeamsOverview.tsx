import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  Users, FileText, Award, Upload, AlertCircle, Edit,
  CheckCircle, Search, Loader2, X, ShieldAlert, Briefcase, MapPin,
  GraduationCap, Building, Phone, Mail, ArrowLeft, ShieldCheck, TrendingUp,
  ArrowRight as ArrowRightIcon, ThumbsUp, ThumbsDown, Save, PenLine, RotateCcw,
  Plus, UserPlus, PlusCircle, Trash2
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  name: string;
  regNo: string;
  email: string;
  phone?: string;
  collegeName?: string;
  collegeType?: string;
  residenceType?: string;
  hostelNumber?: string;
  department?: string;
  year?: string;
}

interface Team {
  _id?: string;
  teamId: string;
  teamName: string;
  leaderId?: {
    _id: string;
    name: string;
    email: string;
    institutionName: string;
    department?: string;
    year?: string;
    collegeType?: string;
    residenceType?: string;
    hostelNumber?: string;
    collegeName?: string;
    regNo?: string;
  };
  leaderName?: string;
  members: Member[];
  problemStatementId?: any;
  status?: string;
  paymentStatus?: string;
  paymentReference?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal (2-Step Verification)
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmModal({
  teamName,
  isAll,
  onClose,
  onConfirm,
}: {
  teamName: string;
  isAll: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const expectedText = isAll ? "DELETE ALL" : "DELETE";
  
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#0a0f1e] border border-red-500/30 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-4 text-red-500 mb-6">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">2-Step Verification</h3>
            <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest">Permanent Deletion</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          You are about to permanently delete <strong className="text-white">{isAll ? "ALL registered teams" : teamName}</strong>. This action cannot be undone. To confirm, please explicitly type <span className="font-mono text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded shadow-inner">{expectedText}</span> below.
        </p>
        <input 
          type="text" 
          placeholder={expectedText} 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-slate-900 border border-red-500/20 rounded-xl px-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-red-500 transition-colors mb-8"
        />
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest bg-slate-900 border border-white/5 hover:bg-slate-800 rounded-xl transition-all">
            Cancel
          </button>
          <button 
            disabled={inputValue !== expectedText}
            onClick={onConfirm} 
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex justify-center items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit Members Modal
// ─────────────────────────────────────────────────────────────────────────────
function EditTeamModal({
  team,
  onClose,
  onSaved,
}: {
  team: Team;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [teamName, setTeamName] = useState(team.teamName);
  const [members, setMembers] = useState<Member[]>(
    team.members.map((m) => ({ ...m }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateMember = (idx: number, field: keyof Member, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      {
        name: "",
        regNo: "",
        email: "",
        phone: "",
        collegeType: "KARE",
        year: "1",
        residenceType: "Dayscholor",
      },
    ]);
  };

  const removeMember = (idx: number) => {
    if (idx === 0) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!team._id) return;
    setSaving(true);
    setError("");
    try {
      await fetchApi(`/admin/teams/${team._id}/edit`, {
        method: "PATCH",
        body: JSON.stringify({ teamName, members }),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-4xl bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-7 border-b border-white/5 flex items-center justify-between bg-white/[0.015]">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Edit Details
            </span>
            <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-tight leading-none">
              {team.teamName}
            </h3>
            <p className="text-slate-500 text-xs font-mono mt-1 uppercase tracking-widest">
              {team.teamId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* Team Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <PenLine className="w-3 h-3 text-primary" /> Team Name
            </label>
            <input
              className={inputCls}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
            />
          </div>

          {/* Members */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h4 className="text-base font-black text-white uppercase tracking-tight">
                  Member Details
                </h4>
              </div>
              <button
                onClick={addMember}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            {members.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4 relative"
              >
                {/* Badge */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 text-[10px] font-black text-primary">
                      0{idx + 1}
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {idx === 0 ? "Team Leader" : `Member ${idx + 1}`}
                    </span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black text-primary uppercase tracking-widest">
                        Leader
                      </span>
                    )}
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => removeMember(idx)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Full Name
                    </label>
                    <input
                      className={inputCls}
                      value={member.name}
                      onChange={(e) => updateMember(idx, "name", e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Reg. Number
                    </label>
                    <input
                      className={inputCls}
                      value={member.regNo}
                      onChange={(e) => updateMember(idx, "regNo", e.target.value)}
                      placeholder="Registration No."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Email
                    </label>
                    <input
                      type="email"
                      className={inputCls}
                      value={member.email}
                      onChange={(e) => updateMember(idx, "email", e.target.value)}
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      value={member.phone || ""}
                      onChange={(e) => updateMember(idx, "phone", e.target.value)}
                      placeholder="Phone"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Department
                    </label>
                    <input
                      className={inputCls}
                      value={member.department || ""}
                      onChange={(e) => updateMember(idx, "department", e.target.value)}
                      placeholder="Department"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Year
                    </label>
                    <select
                      className={inputCls}
                      value={member.year || "1"}
                      onChange={(e) => updateMember(idx, "year", e.target.value)}
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={String(y)}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      College
                    </label>
                    <input
                      className={inputCls}
                      value={member.collegeName || ""}
                      onChange={(e) => updateMember(idx, "collegeName", e.target.value)}
                      placeholder="College Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      Residence
                    </label>
                    <select
                      className={inputCls}
                      value={member.residenceType || "Dayscholor"}
                      onChange={(e) => updateMember(idx, "residenceType", e.target.value)}
                    >
                      <option value="Dayscholor">Day Scholar</option>
                      <option value="Hostler">Hostler</option>
                    </select>
                  </div>
                  {member.residenceType === "Hostler" && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        Hostel No.
                      </label>
                      <input
                        className={inputCls}
                        value={member.hostelNumber || ""}
                        onChange={(e) => updateMember(idx, "hostelNumber", e.target.value)}
                        placeholder="e.g. MH1"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Team Modal (Manual Registration)
// ─────────────────────────────────────────────────────────────────────────────
function AddTeamModal({
  onClose,
  onSaved,
  problems,
}: {
  onClose: () => void;
  onSaved: () => void;
  problems: any[];
}) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([
    { name: "", regNo: "", email: "", phone: "", collegeType: "KARE", year: "1", residenceType: "Dayscholor" },
  ]);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateMember = (idx: number, field: keyof Member, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      //@ts-ignore
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: "", regNo: "", email: "", phone: "", collegeType: "KARE", year: "1", residenceType: "Dayscholor" },
    ]);
  };

  const removeMember = (idx: number) => {
    if (idx === 0) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!members[0].email || !members[0].name) {
      setError("Leader name and email are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await fetchApi("/admin/teams/manual-add", {
        method: "POST",
        body: JSON.stringify({ teamName, members, problemStatementId: selectedProblem }),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        className="relative w-full max-w-4xl bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-10 pt-10 pb-7 border-b border-white/5 flex items-center justify-between bg-white/[0.015]">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Special Request
            </span>
            <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-tight leading-none">
              Manual Team Registration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <PenLine className="w-3 h-3 text-primary" /> Team Name (Optional)
              </label>
              <input
                className={inputCls}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-accent" /> Problem Statement
              </label>
              <select
                className={inputCls}
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
              >
                <option value="">Select Problem</option>
                {problems.map((p) => (
                  <option key={p._id} value={p._id}>{p.title || p.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h4 className="text-base font-black text-white uppercase tracking-tight">
                  Team Members
                </h4>
              </div>
              <button
                onClick={addMember}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>

            {members.map((member, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4 relative"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 text-[10px] font-black text-primary">
                      0{idx + 1}
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {idx === 0 ? "Team Leader" : `Member ${idx + 1}`}
                    </span>
                  </div>
                  {idx > 0 && (
                    <button
                      onClick={() => removeMember(idx)}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Full Name</label>
                    <input className={inputCls} value={member.name} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reg. Number</label>
                    <input className={inputCls} value={member.regNo} onChange={(e) => updateMember(idx, "regNo", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Email</label>
                    <input type="email" className={inputCls} value={member.email} onChange={(e) => updateMember(idx, "email", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Phone</label>
                    <input type="text" className={inputCls} value={member.phone || ""} onChange={(e) => updateMember(idx, "phone", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Department</label>
                    <input className={inputCls} value={member.department || ""} onChange={(e) => updateMember(idx, "department", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Year</label>
                    <select className={inputCls} value={member.year || "1"} onChange={(e) => updateMember(idx, "year", e.target.value)}>
                      {[1, 2, 3, 4].map(y => <option key={y} value={String(y)}>Year {y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">College</label>
                    <input className={inputCls} value={member.collegeName || ""} onChange={(e) => updateMember(idx, "collegeName", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}
        </div>

        <div className="px-10 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest font-black uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Registering..." : "Register Team"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Details Modal (read-only view)
// ─────────────────────────────────────────────────────────────────────────────
function TeamDetailsModal({
  team,
  onClose,
  onStatusChange,
  onEditOpen,
}: {
  team: Team;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onEditOpen: () => void;
}) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatus = async (status: string) => {
    if (!team._id) return;
    setUpdatingStatus(status);
    try {
      await fetchApi(`/admin/teams/${team._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onStatusChange(team._id, status);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const statusColor = {
    Approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Rejected: "text-red-400 bg-red-500/10 border-red-500/20",
    Pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  }[team.status || "Pending"] ?? "text-slate-400 bg-slate-800 border-white/10";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl bg-[#0F172A] border border-white/5 rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-10 md:p-14 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex items-center gap-8 relative z-10">
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-inner group/back"
            >
              <ArrowLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                  Team Registration
                </span>
                {/* Status badge */}
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
                  {team.status || "Pending"}
                </span>
              </div>
              <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                {team.teamName}
              </h3>
              <p className="text-slate-500 font-mono text-sm mt-3 tracking-widest opacity-80 uppercase">
                Team ID: {team.teamId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all shadow-inner relative z-10"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-inner group hover:border-primary/30 transition-all">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Team Size</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{team.members.length}</div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Members</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-inner group hover:border-accent/30 transition-all">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Problem Statement</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="text-base font-black text-white uppercase truncate">
                    {team.problemStatementId?.id || team.problemStatementId || "TBD"}
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Problem ID</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-inner group hover:border-emerald-500/30 transition-all">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Payment</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className={`text-xl font-black uppercase ${team.paymentStatus === "Verified" ? "text-emerald-500" : "text-amber-500"}`}>
                    {team.paymentStatus || "Free"}
                  </div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Cards */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-5">
              <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Team Member Details</h4>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {team.members.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-slate-950 border border-white/5 rounded-[2.5rem] p-8 relative group hover:border-primary/20 transition-all shadow-xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
                  <div className="absolute top-8 right-8 w-10 h-10 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500">
                    0{i + 1}
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div>
                      <h5 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
                        {member.name}
                        {i === 0 && (
                          <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] uppercase font-black rounded-xl border border-primary/20">
                            Leader
                          </span>
                        )}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-slate-500 font-mono text-xs">
                        <span className="opacity-50 uppercase text-[9px] font-black">ID:</span>
                        <span className="text-white font-black">{member.regNo || "—"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                      {[
                        { icon: Mail, color: "text-primary", label: "Email", val: member.email },
                        { icon: Briefcase, color: "text-cyan-400", label: "Department", val: member.department || "—" },
                        { icon: Building, color: "text-amber-500", label: "College", val: member.collegeName || (member.collegeType === "KARE" ? "KARE" : "External") },
                        { icon: MapPin, color: "text-red-400", label: "Residence", val: `${member.residenceType || "—"}${member.hostelNumber ? ` [${member.hostelNumber}]` : ""}` },
                        { icon: TrendingUp, color: "text-accent", label: "Year", val: `Year ${member.year || "1"}` },
                        { icon: Phone, color: "text-emerald-500", label: "Phone", val: member.phone || "—" },
                      ].map(({ icon: Icon, color, label, val }) => (
                        <div key={label} className="space-y-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-slate-600`}>
                            <Icon className={`w-3 h-3 ${color}`} /> {label}
                          </span>
                          <p className="text-xs font-bold text-slate-300 truncate">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — Approve / Reject / Edit */}
        <div className="p-8 md:p-12 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-6 h-6 text-slate-700 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-[0.25em]">Admin Control Panel</p>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                Current Status: <span className={
                  team.status === "Approved" ? "text-emerald-400" :
                    team.status === "Rejected" ? "text-red-400" : "text-amber-400"
                }>{team.status || "Pending"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Edit button */}
            <button
              onClick={onEditOpen}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-primary/30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              <Edit className="w-4 h-4 text-primary" /> Edit Members
            </button>

            {/* Reject */}
            {team.status !== "Rejected" && (
              <button
                onClick={() => handleStatus("Rejected")}
                disabled={updatingStatus === "Rejected"}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                {updatingStatus === "Rejected" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsDown className="w-4 h-4" />
                )}
                Reject
              </button>
            )}

            {/* Reset to Pending */}
            {team.status !== "Pending" && (
              <button
                onClick={() => handleStatus("Pending")}
                disabled={updatingStatus === "Pending"}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/50 text-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                {updatingStatus === "Pending" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Reset
              </button>
            )}

            {/* Approve */}
            {team.status !== "Approved" && (
              <button
                onClick={() => handleStatus("Approved")}
                disabled={updatingStatus === "Approved"}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                {updatingStatus === "Approved" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                Approve
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function TeamsOverview() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editModalTeam, setEditModalTeam] = useState<Team | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; isAll: boolean } | null>(null);

  useEffect(() => {
    loadTeams();
    loadProblems();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchApi("/reviewer/teams");
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    try {
      const data = await fetchApi("/team/problem-statements");
      setProblems(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProblem = async (teamId: string) => {
    try {
      await fetchApi("/admin/update-team-problem", {
        method: "PATCH",
        body: JSON.stringify({ teamId, problemStatementId: selectedProblem }),
      });
      loadTeams();
      setEditingTeam(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleQuickStatus = async (team: Team, status: string) => {
    if (!team._id) return;
    setUpdatingStatus((prev) => ({ ...prev, [team._id!]: status }));
    try {
      await fetchApi(`/admin/teams/${team._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTeams((prev) =>
        prev.map((t) => (t._id === team._id ? { ...t, status } : t))
      );
      if (selectedTeam?._id === team._id) {
        setSelectedTeam((prev) => prev ? { ...prev, status } : prev);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus((prev) => {
        const next = { ...prev };
        delete next[team._id!];
        return next;
      });
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.isAll) {
        await fetchApi("/admin/teams/all", { method: "DELETE" });
        import("sonner").then((m) => m.toast.success("All teams have been deleted."));
      } else {
        await fetchApi(`/admin/teams/${deleteTarget.id}`, { method: "DELETE" });
        import("sonner").then((m) => m.toast.success(`Team ${deleteTarget.name} has been deleted.`));
      }
      loadTeams();
      setDeleteTarget(null);
    } catch (err: any) {
      import("sonner").then((m) => m.toast.error(err.message || "Failed to delete team(s)"));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await fetch("/api/admin/upload-teams", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      loadTeams();
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.teamId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || team.status === statusFilter || (!team.status && statusFilter === "Pending");
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: teams.length,
    Pending: teams.filter((t) => !t.status || t.status === "Pending").length,
    Approved: teams.filter((t) => t.status === "Approved").length,
    Rejected: teams.filter((t) => t.status === "Rejected").length,
  };

  const getRowStatusStyle = (status?: string) => {
    if (status === "Approved") return "border-l-2 border-emerald-500/40";
    if (status === "Rejected") return "border-l-2 border-red-500/40 opacity-70";
    return "";
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Team Overview</h2>
            </div>
            <p className="text-slate-400 text-sm ml-1">Manage, approve, and edit all registered teams.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={async () => {
                const response = await fetch("/api/admin/export-teams", {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Registrations_${new Date().toISOString().split("T")[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all shadow-lg"
            >
              <FileText className="w-4 h-4" /> Export Teams
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-primary/30 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              <UserPlus className="w-4 h-4 text-primary" /> Add Team
            </button>

            <label
              className={`flex items-center gap-2 px-5 py-2.5 ${uploading ? "bg-slate-800 cursor-not-allowed" : "bg-primary hover:bg-primary/90"} text-white rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer`}
            >
              {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Processing..." : "Import Teams"}
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={uploading} />
            </label>

            {teams.length > 0 && (
              <button
                onClick={() => setDeleteTarget({ id: "all", name: "All Teams", isAll: true })}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ml-2"
              >
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Teams", value: teams.length, color: "primary" },
            { label: "Pending", value: statusCounts.Pending, color: "amber" },
            { label: "Approved", value: statusCounts.Approved, color: "emerald" },
            { label: "Rejected", value: statusCounts.Rejected, color: "red" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 rounded-2xl"
            >
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color === "emerald" ? "text-emerald-400" :
                  s.color === "amber" ? "text-amber-400" :
                    s.color === "red" ? "text-red-400" : "text-white"
                }`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by Team ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-slate-600"
            />
          </div>

          {/* Status tab filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/5">
            {["all", "Pending", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                    ? s === "Approved" ? "bg-emerald-500 text-white"
                      : s === "Rejected" ? "bg-red-500 text-white"
                        : s === "Pending" ? "bg-amber-500 text-white"
                          : "bg-primary text-white"
                    : "text-slate-500 hover:text-white"
                  }`}
              >
                {s === "all" ? `All (${statusCounts.all})` : `${s} (${statusCounts[s as keyof typeof statusCounts]})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Leader</th>
                  <th className="px-6 py-4 text-center">Size</th>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4 text-center">Payment</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredTeams.map((team, idx) => {
                    const isBusy = !!updatingStatus[team._id || ""];
                    return (
                      <motion.tr
                        key={team.teamId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-white/[0.03] transition-colors group ${getRowStatusStyle(team.status)}`}
                      >
                        {/* Team */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors text-[10px] font-black text-primary">
                              T{idx + 1}
                            </div>
                            <div>
                              <p className="font-black text-white text-sm leading-tight">{team.teamName}</p>
                              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter mt-0.5">{team.teamId}</p>
                            </div>
                          </div>
                        </td>

                        {/* Leader */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-white/10 text-[10px] font-bold text-white">
                              {(team.leaderId?.name || team.leaderName || "N").charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{team.leaderId?.name || team.leaderName || "—"}</p>
                              <p className="text-[10px] text-slate-500">{team.leaderId?.email || "..."}</p>
                            </div>
                          </div>
                        </td>

                        {/* Size */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-black ${team.members.length >= 5
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-800 border-white/10 text-slate-400"
                            }`}>
                            {team.members.length} <span className="text-[10px] opacity-60">Members</span>
                          </span>
                        </td>

                        {/* Problem */}
                        <td className="px-6 py-4">
                          {editingTeam === team.teamId ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedProblem}
                                onChange={(e) => setSelectedProblem(e.target.value)}
                                className="bg-slate-950 border border-primary/30 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                              >
                                <option value="">Select ID</option>
                                {problems.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
                              </select>
                              <button onClick={() => handleUpdateProblem(team.teamId)} className="p-2 bg-emerald-500 text-white rounded-xl">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingTeam(null)} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/prob">
                              <span className={`text-xs font-bold ${team.problemStatementId ? "text-accent" : "text-slate-600 italic"}`}>
                                {team.problemStatementId?.id || team.problemStatementId || "Not Selected"}
                              </span>
                              <button
                                onClick={() => { setEditingTeam(team.teamId); setSelectedProblem(team.problemStatementId?._id || ""); }}
                                className="p-1 text-slate-600 hover:text-primary opacity-0 group-hover/prob:opacity-100 transition-all"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${team.paymentStatus === "Verified" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                              team.paymentStatus === "Rejected" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                team.paymentStatus === "Pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse" :
                                  "bg-white/5 border-white/10 text-slate-500"
                            }`}>
                            {team.paymentStatus || "Free"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${team.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              team.status === "Rejected" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                            {team.status || "Pending"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Approve */}
                            {team.status !== "Approved" && (
                              <button
                                onClick={() => handleQuickStatus(team, "Approved")}
                                disabled={isBusy}
                                title="Approve"
                                className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all"
                              >
                                {isBusy && updatingStatus[team._id || ""] === "Approved"
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <ThumbsUp className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {/* Quick Reject */}
                            {team.status !== "Rejected" && (
                              <button
                                onClick={() => handleQuickStatus(team, "Rejected")}
                                disabled={isBusy}
                                title="Reject"
                                className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                              >
                                {isBusy && updatingStatus[team._id || ""] === "Rejected"
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <ThumbsDown className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {/* Edit */}
                            <button
                              onClick={() => setEditModalTeam(team)}
                              title="Edit Members"
                              className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-primary border border-white/5 hover:border-primary/50 text-slate-400 hover:text-white rounded-xl transition-all"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete Single Team */}
                            <button
                              onClick={() => setDeleteTarget({ id: team._id as string, name: team.teamName, isAll: false })}
                              title="Delete Team"
                              className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 border border-red-500/10 hover:border-red-500 focus:outline-none text-red-500 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Details */}
                            <button
                              onClick={() => setSelectedTeam(team)}
                              className="px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 hover:text-white hover:border-primary/50 transition-all flex items-center gap-1 group/btn"
                            >
                              Details
                              <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>

                {(loading || filteredTeams.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-28 text-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Teams...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <AlertCircle className="w-10 h-10 text-slate-700" />
                          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Matching Teams</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-4 bg-primary/[0.02] border-t border-white/5 flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {filteredTeams.length} Teams Found
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedTeam && (
          <TeamDetailsModal
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
            onStatusChange={(id, status) => {
              setTeams((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
              setSelectedTeam((prev) => prev ? { ...prev, status } : prev);
            }}
            onEditOpen={() => {
              setEditModalTeam(selectedTeam);
              setSelectedTeam(null);
            }}
          />
        )}
        {editModalTeam && (
          <EditTeamModal
            team={editModalTeam}
            onClose={() => setEditModalTeam(null)}
            onSaved={loadTeams}
          />
        )}

        {showAddModal && (
          <AddTeamModal
            problems={problems}
            onClose={() => setShowAddModal(false)}
            onSaved={loadTeams}
          />
        )}

        {deleteTarget && (
          <DeleteConfirmModal
            teamName={deleteTarget.name}
            isAll={deleteTarget.isAll}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteExecute}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
