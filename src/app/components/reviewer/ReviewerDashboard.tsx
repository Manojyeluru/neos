import { useState, useEffect, useMemo } from "react";
import { ReviewerLayout } from "../layouts/ReviewerLayout";
import {
  ChevronDown, Loader2, Star,
  CheckCircle, ShieldCheck,
  MessageSquare, AlertCircle, TrendingUp, Award, ArrowLeft,
  BarChart3, Calculator, Layers, Hash
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Team {
  _id: string;
  teamId: string;
  teamName: string;
  problemStatementId?: {
    _id: string;
    title: string;
    description: string;
  };
  scores?: any[];
}

interface Criterion {
  _id: string;
  name: string;
  description: string;
  maxMarks: number;
}

export function ReviewerDashboard() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [currentMarks, setCurrentMarks] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState("");
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewerName, setSelectedReviewerName] = useState("");

  // ─── Auto-calculate live total for current round ───────────────────────────
  const liveRoundTotal = useMemo(() => {
    return Object.values(currentMarks).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  }, [currentMarks]);

  const maxRoundMarks = useMemo(() => {
    return criteria.reduce((sum, c) => sum + c.maxMarks, 0);
  }, [criteria]);

  // ─── Calculate round totals from stored scores ─────────────────────────────
  const getTeamRoundScore = (team: Team, roundNumber: number) => {
    // Average if multiple reviewers scored this team in this round
    const roundScores = team.scores?.filter(s => s.roundNumber === roundNumber) || [];
    if (roundScores.length === 0) return null;
    const avg = roundScores.reduce((sum: number, s: any) => sum + (s.totalMarks || 0), 0) / roundScores.length;
    return Math.round(avg * 10) / 10;
  };

  // ─── Grand total across ALL rounds ─────────────────────────────────────────
  const getTeamGrandTotal = (team: Team) => {
    if (!team.scores || team.scores.length === 0) return null;
    // Sum of average marks per round
    const roundNumbers = [...new Set(team.scores.map((s: any) => s.roundNumber))] as number[];
    const total = roundNumbers.reduce((sum, rn) => {
      const score = getTeamRoundScore(team, rn);
      return sum + (score ?? 0);
    }, 0);
    return Math.round(total * 10) / 10;
  };

  // ─── Score for current reviewer this round ─────────────────────────────────
  const getMyScoreForRound = (team: Team, roundNumber: number) => {
    return team.scores?.find(
      s => s.roundNumber === roundNumber &&
        (s.reviewerId === user?.id || s.reviewerId?._id === user?.id)
    ) || null;
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setSelectedReviewerName(parsed.name || "");
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRound) loadCriteria(selectedRound);
  }, [selectedRound]);

  const loadInitialData = async () => {
    try {
      const [roundsData, teamsData, reviewersData] = await Promise.all([
        fetchApi("/reviewer/rounds"),
        fetchApi("/reviewer/teams"),
        fetchApi("/reviewer/reviewers").catch(() => [])
      ]);
      setRounds(roundsData);
      setTeams(teamsData);
      setReviewers(reviewersData);
      if (roundsData.length > 0) setSelectedRound(roundsData[0].roundNumber);
    } catch (err) {
      console.error("Error loading reviewer data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async (roundNum: number) => {
    try {
      const data = await fetchApi(`/reviewer/criteria/${roundNum}`);
      setCriteria(data);
      const initialMarks: { [key: string]: string } = {};
      data.forEach((c: Criterion) => { initialMarks[c._id] = ""; });
      setCurrentMarks(initialMarks);
    } catch (err) {
      console.error("Error loading criteria:", err);
    }
  };

  const handleExpandTeam = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      return;
    }
    setExpandedTeamId(teamId);
    const team = teams.find(t => t._id === teamId);
    const myScore = getMyScoreForRound(team!, selectedRound);

    if (myScore) {
      const marks: { [key: string]: string } = {};
      myScore.criteriaScores.forEach((cs: any) => {
        const criterion = criteria.find(c => c.name === cs.name);
        if (criterion) marks[criterion._id] = cs.marks.toString();
      });
      setCurrentMarks(marks);
      setComments(myScore.comments || "");
      setSelectedReviewerName(myScore.reviewerName || user?.name || "");
    } else {
      const initialMarks: { [key: string]: string } = {};
      criteria.forEach(c => { initialMarks[c._id] = ""; });
      setCurrentMarks(initialMarks);
      setComments("");
      setSelectedReviewerName(user?.name || "");
    }
  };

  const handleSubmitMarks = async (teamInternalId: string) => {
    if (!selectedReviewerName) {
      toast.error("Please select a reviewer name.");
      return;
    }
    const scores = criteria.map(c => ({
      name: c.name,
      _id: c._id,
      marks: parseInt(currentMarks[c._id]) || 0,
      maxMarks: c.maxMarks
    }));

    for (const score of scores) {
      if (score.marks < 0 || score.marks > score.maxMarks) {
        toast.error(`${score.name}: must be between 0 and ${score.maxMarks}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await fetchApi("/reviewer/submit-review", {
        method: "POST",
        body: JSON.stringify({
          teamId: teamInternalId,
          reviewerId: user?.id,
          reviewerName: selectedReviewerName,
          roundNumber: selectedRound,
          criteriaScores: scores.map(s => ({ name: s.name, marks: s.marks })),
          comments
        }),
      });
      toast.success(`Review submitted! Total: ${liveRoundTotal} / ${maxRoundMarks} marks`);
      const updatedTeams = await fetchApi("/reviewer/teams");
      setTeams(updatedTeams);
      setExpandedTeamId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const evaluatedCount = teams.filter(t =>
    t.scores?.some(s => s.roundNumber === selectedRound &&
      (s.reviewerId === user?.id || s.reviewerId?._id === user?.id))
  ).length;

  const criteriaColors = ['text-primary', 'text-emerald-400', 'text-violet-400', 'text-amber-400', 'text-cyan-400', 'text-rose-400'];
  const criteriaBg = ['border-primary/20 bg-primary/5', 'border-emerald-500/20 bg-emerald-500/5', 'border-violet-500/20 bg-violet-500/5', 'border-amber-500/20 bg-amber-500/5', 'border-cyan-500/20 bg-cyan-500/5', 'border-rose-500/20 bg-rose-500/5'];
  const criteriaDots = ['bg-primary', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'];

  if (loading) {
    return (
      <ReviewerLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Loading Evaluation Data...</p>
        </div>
      </ReviewerLayout>
    );
  }

  return (
    <ReviewerLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12 font-inter">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-5"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 bg-slate-900 border border-white/5 rounded-2xl p-3 pr-6">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center relative">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reviewer</p>
                <h3 className="text-base font-black text-white tracking-tight uppercase">{user?.name || "Reviewer"}</h3>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{user?.uniqueId || "REV"}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                Evaluation <span className="text-emerald-400 italic">Dashboard</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium">Round {selectedRound} · {evaluatedCount}/{teams.length} teams reviewed</p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Reviewed</span>
              <p className="text-xl font-black text-white">{evaluatedCount}<span className="text-slate-600 text-sm">/{teams.length}</span></p>
            </div>
            <div className="flex flex-col items-center px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Progress</span>
              <p className="text-xl font-black text-emerald-400">{teams.length > 0 ? Math.round((evaluatedCount / teams.length) * 100) : 0}%</p>
            </div>
            <div className="flex flex-col items-center px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">Max/Round</span>
              <p className="text-xl font-black text-white">{maxRoundMarks}</p>
            </div>
          </div>
        </motion.div>

        {/* Round Selector */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2 flex-1">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Round</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {rounds.map((r, idx) => {
              const isActive = selectedRound === r.roundNumber;
              return (
                <button key={r._id} onClick={() => setSelectedRound(r.roundNumber)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                >
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                    {r.roundNumber}
                  </span>
                  {r.name}
                  {r.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}
            {rounds.length === 0 && <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">No rounds configured</span>}
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl">
            <Award className="w-4 h-4 text-primary" />
            <div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Max this round</span>
              <span className="text-sm font-black text-white">{maxRoundMarks} pts</span>
            </div>
          </div>
        </motion.div>

        {/* Teams Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Teams — Round {selectedRound} Review</h3>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">{teams.length} teams</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Problem</th>
                  {/* Per-round columns */}
                  {rounds.map(r => (
                    <th key={r._id} className={`px-4 py-4 text-center ${r.roundNumber === selectedRound ? 'text-primary' : ''}`}>
                      R{r.roundNumber}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center text-amber-400">Total</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {teams.map(team => {
                    const myScore = getMyScoreForRound(team, selectedRound);
                    const grandTotal = getTeamGrandTotal(team);
                    const isExpanded = expandedTeamId === team._id;

                    return (
                      <React.Fragment key={team._id}>
                        <tr className={`transition-all ${isExpanded ? "bg-primary/[0.03]" : "hover:bg-white/[0.02]"} group`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-[10px] font-black text-primary">
                                {(team.teamName || 'T')[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white leading-tight">{team.teamName}</p>
                                <p className="text-[9px] font-mono text-slate-600 uppercase">{team.teamId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-bold ${team.problemStatementId ? 'text-accent' : 'text-slate-600 italic'}`}>
                              {team.problemStatementId?.title || "Not selected"}
                            </span>
                          </td>

                          {/* Per-round score cells */}
                          {rounds.map(r => {
                            const rScore = getTeamRoundScore(team, r.roundNumber);
                            const isCurrentRound = r.roundNumber === selectedRound;
                            return (
                              <td key={r._id} className="px-4 py-4 text-center">
                                {rScore !== null ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${isCurrentRound
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-white/5 text-slate-400'
                                    }`}>
                                    {rScore}
                                  </span>
                                ) : (
                                  <span className="text-slate-700 text-[9px] font-black">—</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Grand total */}
                          <td className="px-4 py-4 text-center">
                            {grandTotal !== null ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <BarChart3 className="w-3 h-3" />{grandTotal}
                              </span>
                            ) : (
                              <span className="text-slate-700 text-[9px] font-black">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleExpandTeam(team._id)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded
                                  ? "bg-white text-slate-950"
                                  : myScore
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white"
                                }`}
                            >
                              {isExpanded ? "Close" : myScore ? "Re-Score" : "Score"}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded scoring panel */}
                        {isExpanded && (
                          <tr key={`${team._id}-expanded`}>
                            <td colSpan={rounds.length + 4} className="px-5 py-6 bg-slate-900/40 border-b border-white/5">
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-5xl mx-auto space-y-5"
                              >
                                {/* Panel header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                                      <Star className="w-5 h-5 text-primary fill-primary/30" />
                                    </div>
                                    <div>
                                      <h4 className="text-base font-black text-white uppercase tracking-tight">
                                        Scoring — {team.teamName}
                                      </h4>
                                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                        Round {selectedRound} · {criteria.length} criteria · Max {maxRoundMarks} marks
                                      </p>
                                    </div>
                                  </div>

                                  {/* Live total display */}
                                  <div className="flex items-center gap-3">
                                    {/* Reviewer selector */}
                                    <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 min-w-[180px]">
                                      <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Reviewer</label>
                                      <select
                                        value={selectedReviewerName}
                                        onChange={e => setSelectedReviewerName(e.target.value)}
                                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                                      >
                                        <option value={user?.name} className="bg-slate-900">{user?.name} (You)</option>
                                        {reviewers.filter(r => r.name !== user?.name).map(r => (
                                          <option key={r._id} value={r.name} className="bg-slate-900">{r.name}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Live total pill */}
                                    <div className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all ${liveRoundTotal === maxRoundMarks
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : liveRoundTotal > 0
                                          ? 'bg-primary/10 border-primary/20'
                                          : 'bg-slate-900 border-white/5'
                                      }`}>
                                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        <Calculator className="w-2.5 h-2.5" /> Round {selectedRound} Total
                                      </span>
                                      <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-black tracking-tighter ${liveRoundTotal > 0 ? 'text-white' : 'text-slate-600'
                                          }`}>{liveRoundTotal}</span>
                                        <span className="text-slate-600 text-sm font-black">/ {maxRoundMarks}</span>
                                      </div>
                                      {/* Mini progress */}
                                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-primary rounded-full transition-all duration-300"
                                          style={{ width: `${maxRoundMarks > 0 ? Math.min(100, (liveRoundTotal / maxRoundMarks) * 100) : 0}%` }}
                                        />
                                      </div>
                                      <span className="text-[8px] font-black text-slate-600 mt-0.5">
                                        {maxRoundMarks > 0 ? Math.round((liveRoundTotal / maxRoundMarks) * 100) : 0}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* All-rounds summary for this team */}
                                {rounds.length > 1 && (
                                  <div className="flex items-center gap-2 flex-wrap p-3 bg-black/20 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-1.5 mr-2">
                                      <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">All Rounds:</span>
                                    </div>
                                    {rounds.map((r, idx) => {
                                      const rScore = getTeamRoundScore(team, r.roundNumber);
                                      const isCurrentRound = r.roundNumber === selectedRound;
                                      return (
                                        <div key={r._id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border ${isCurrentRound
                                            ? 'bg-primary/10 border-primary/20 text-primary'
                                            : rScore !== null
                                              ? 'bg-white/5 border-white/5 text-slate-400'
                                              : 'bg-transparent border-white/5 text-slate-700'
                                          }`}>
                                          <span>R{r.roundNumber}</span>
                                          {isCurrentRound && liveRoundTotal > 0 ? (
                                            <span className="text-white">{liveRoundTotal}*</span>
                                          ) : rScore !== null ? (
                                            <span className="text-white">{rScore}</span>
                                          ) : (
                                            <span>—</span>
                                          )}
                                        </div>
                                      );
                                    })}
                                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9px] font-black text-amber-400">
                                      <Hash className="w-3 h-3" />
                                      Grand Total: {(() => {
                                        const storedTotal = getTeamGrandTotal(team) ?? 0;
                                        // Find if current round already has stored score
                                        const hasCurrentRoundScore = getTeamRoundScore(team, selectedRound) !== null;
                                        // If current round not yet saved, add live total to other rounds
                                        if (!hasCurrentRoundScore && liveRoundTotal > 0) {
                                          return Math.round((storedTotal + liveRoundTotal) * 10) / 10;
                                        }
                                        return storedTotal;
                                      })()}
                                    </div>
                                  </div>
                                )}

                                {/* Criteria cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {criteria.map((c, idx) => {
                                    const color = criteriaBg[idx % criteriaBg.length];
                                    const textColor = criteriaColors[idx % criteriaColors.length];
                                    const dotColor = criteriaDots[idx % criteriaDots.length];
                                    const marks = parseInt(currentMarks[c._id]) || 0;
                                    const pct = c.maxMarks > 0 ? (marks / c.maxMarks) * 100 : 0;

                                    return (
                                      <div key={c._id} className={`bg-slate-950 border ${color} rounded-xl overflow-hidden`}>
                                        {/* Criteria info */}
                                        <div className="p-4 border-b border-white/5">
                                          <div className="flex items-start justify-between gap-3 mb-1">
                                            <div className="flex items-center gap-2">
                                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md bg-white/5 ${textColor}`}>#{idx + 1}</span>
                                              <span className="text-sm font-black text-white uppercase tracking-tight">{c.name}</span>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                              <p className="text-[7px] font-black text-slate-700 uppercase">Max</p>
                                              <p className={`text-xl font-black ${textColor} leading-none`}>{c.maxMarks}</p>
                                            </div>
                                          </div>
                                          {c.description ? (
                                            <p className="text-[11px] text-slate-500 leading-relaxed">{c.description}</p>
                                          ) : (
                                            <p className="text-[10px] text-slate-700 italic">Score out of {c.maxMarks}</p>
                                          )}
                                        </div>
                                        {/* Score input */}
                                        <div className="p-3">
                                          <input
                                            type="number" min="0" max={c.maxMarks}
                                            value={currentMarks[c._id] || ""}
                                            onChange={e => {
                                              let val = parseInt(e.target.value);
                                              if (!isNaN(val) && val > c.maxMarks) val = c.maxMarks;
                                              setCurrentMarks({ ...currentMarks, [c._id]: isNaN(val) ? '' : val.toString() });
                                            }}
                                            className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 text-white font-black text-4xl tracking-tighter text-center focus:outline-none focus:border-primary/50 shadow-inner transition-all"
                                            placeholder="0"
                                          />
                                          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${dotColor} transition-all duration-300`}
                                              style={{ width: `${Math.min(100, pct)}%` }}
                                            />
                                          </div>
                                          <p className="text-[9px] font-black text-slate-600 text-center mt-1">{marks} / {c.maxMarks}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Comments */}
                                <div className="bg-slate-950 p-5 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comments (optional)</label>
                                  </div>
                                  <textarea rows={3} value={comments}
                                    onChange={e => setComments(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white font-medium text-sm focus:outline-none focus:border-primary/50 shadow-inner placeholder:text-slate-800 resize-none"
                                    placeholder="Your observations about this team..."
                                  />
                                </div>

                                {/* Submit bar */}
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Scores must be within 0 – max range</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button onClick={() => setExpandedTeamId(null)}
                                      className="px-5 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors bg-slate-900 border border-white/5 rounded-xl"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      disabled={submitting}
                                      onClick={() => handleSubmitMarks(team._id)}
                                      className="px-8 py-2.5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                      Submit · {liveRoundTotal}/{maxRoundMarks}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>

                {teams.length === 0 && (
                  <tr>
                    <td colSpan={rounds.length + 4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5">
                          <Star className="w-6 h-6 text-slate-700" />
                        </div>
                        <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No teams registered yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              {evaluatedCount} of {teams.length} teams reviewed in Round {selectedRound}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </ReviewerLayout>
  );
}
