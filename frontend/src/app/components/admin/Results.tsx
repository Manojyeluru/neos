import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  Trophy, Award, Medal, Download, Loader2, Users,
  Target, Shield, TrendingUp, ChevronDown,
  BarChart3, Zap, Globe, Cpu
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TeamResult {
  _id: string;
  teamId: string;
  teamName: string;
  rank: number;
  totalMarks: number;
  problemTitle: string;
  scoreBreakdown: { [key: string]: number };
}

export function Results() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [results, setResults] = useState<TeamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCriteria, setAvailableCriteria] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadResults();
  }, [selectedRound]);

  const loadInitialData = async () => {
    try {
      const roundsData = await fetchApi("/admin/rounds");
      setRounds(roundsData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadResults = async () => {
    setLoading(true);
    try {
      const teams = await fetchApi("/reviewer/teams");

      const processedResults = teams.map((team: any) => {
        let total = 0;
        const breakdown: { [key: string]: number } = {};

        const relevantScores = selectedRound === 'all'
          ? team.scores
          : team.scores?.filter((s: any) => s.roundNumber === selectedRound);

        relevantScores?.forEach((score: any) => {
          total += score.totalMarks || 0;
          score.criteriaScores?.forEach((cs: any) => {
            breakdown[cs.name] = (breakdown[cs.name] || 0) + cs.marks;
          });
        });

        return {
          _id: team._id,
          teamId: team.teamId,
          teamName: team.teamName,
          problemTitle: team.problemStatementId?.title || team.problemStatementId || "Not Selected",
          totalMarks: total,
          scoreBreakdown: breakdown,
          rank: 0
        };
      });

      processedResults.sort((a: TeamResult, b: TeamResult) => b.totalMarks - a.totalMarks);

      processedResults.forEach((res: TeamResult, index: number) => {
        res.rank = index + 1;
      });

      const criteriaNames = new Set<string>();
      processedResults.forEach((res: TeamResult) => {
        Object.keys(res.scoreBreakdown).forEach(name => criteriaNames.add(name));
      });

      setAvailableCriteria(Array.from(criteriaNames));
      setResults(processedResults);
    } catch (err) {
      console.error("Error loading results:", err);
      toast.error("Failed to retrieve results.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ["Rank", "Team ID", "Team Name", "Problem", ...availableCriteria, "Total Marks"];
    const rows = results.map(r => [
      r.rank,
      r.teamId,
      r.teamName,
      r.problemTitle,
      ...availableCriteria.map(c => r.scoreBreakdown[c] || 0),
      r.totalMarks
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `standings_phase_${selectedRound}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Standings exported successfully.");
  };

  const topThree = results.slice(0, 3);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/20";
      case 2: return "from-slate-300 via-slate-400 to-slate-500 shadow-slate-500/20";
      case 3: return "from-amber-600 via-amber-700 to-amber-800 shadow-amber-800/20";
      default: return "from-slate-800 to-slate-900 shadow-black/20";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12 font-inter">
        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Event <span className="text-primary italic">Standings</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl">
              View real-time rankings and scores for all teams.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-slate-900 border border-white/5 p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl">
              <button
                onClick={() => setSelectedRound('all')}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedRound === 'all' ? 'bg-primary text-white' : 'text-slate-500'}`}
              >
                Overall
              </button>
              {rounds.map(r => (
                <button
                  key={r._id}
                  onClick={() => setSelectedRound(r.roundNumber)}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedRound === r.roundNumber ? 'bg-primary text-white' : 'text-slate-500'}`}
                >
                  Round {r.roundNumber}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadCSV}
              className="px-8 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-3"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          </div>
        </div>

        {results.length > 0 ? (
          <>
            {/* Podium Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end pt-10 px-4">
              <div className="order-2 md:order-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`bg-gradient-to-br ${getRankColor(2)} rounded-[3rem] p-1 shadow-2xl group`}
                >
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-[2.9rem] p-10 h-full flex flex-col items-center">
                    <Medal className="w-16 h-16 text-slate-400 mb-6 group-hover:scale-110 transition-transform" />
                    <span className="text-5xl font-black text-white/50 mb-2">#02</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter text-center line-clamp-1 mb-2">{topThree[1].teamName}</h4>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">{topThree[1].teamId}</span>
                    <div className="w-full bg-slate-950 border border-white/5 rounded-3xl py-6 px-4 text-center">
                      <p className="text-5xl font-black text-primary leading-none tracking-tighter">{topThree[1].totalMarks}</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Total Marks</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="order-1 md:order-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gradient-to-br ${getRankColor(1)} rounded-[3.5rem] p-1.5 shadow-[0_40px_80px_rgba(59,130,246,0.3)] relative z-10 group`}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.5)] border-4 border-yellow-200">
                      <Trophy className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                  <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[3.4rem] p-12 flex flex-col items-center pt-16">
                    <span className="text-7xl font-black text-yellow-500/50 mb-4">#01</span>
                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter text-center mb-2">{topThree[0].teamName}</h4>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">{topThree[0].teamId}</span>
                    <div className="w-full bg-slate-900 border border-white/5 rounded-[2.5rem] py-10 px-6 text-center shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                      <p className="text-7xl font-black text-yellow-500 leading-none tracking-tighter">{topThree[0].totalMarks}</p>
                      <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mt-3">Top Score</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="order-3 md:order-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`bg-gradient-to-br ${getRankColor(3)} rounded-[3rem] p-1 shadow-2xl group`}
                >
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-[2.9rem] p-10 h-full flex flex-col items-center">
                    <Award className="w-16 h-16 text-amber-700 mb-6 group-hover:scale-110 transition-transform" />
                    <span className="text-5xl font-black text-white/50 mb-2">#03</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter text-center line-clamp-1 mb-2">{topThree[2].teamName}</h4>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">{topThree[2].teamId}</span>
                    <div className="w-full bg-slate-950 border border-white/5 rounded-3xl py-6 px-4 text-center">
                      <p className="text-5xl font-black text-emerald-500 leading-none tracking-tighter">{topThree[2].totalMarks}</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Total Marks</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Complete Data Table */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Scoreboard</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">All team scores and rankings</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-full">
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Auto-sync active
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01] border-b border-white/5 font-black uppercase tracking-[0.2em] text-[10px] text-slate-500">
                      <th className="px-10 py-8 text-center">Pos</th>
                      <th className="px-10 py-8">Team</th>
                      <th className="px-10 py-8">Problem Statement</th>
                      {availableCriteria.map(name => (
                        <th key={name} className="px-6 py-8 text-center">{name}</th>
                      ))}
                      <th className="px-10 py-8 text-center">Total Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((result) => (
                      <tr key={result._id} className="group hover:bg-white/[0.03] transition-colors">
                        <td className="px-10 py-8 text-center">
                          <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center font-black text-[10px] border ${result.rank === 1 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                            result.rank === 2 ? "bg-slate-400/10 border-slate-400/30 text-slate-400" :
                              result.rank === 3 ? "bg-amber-800/10 border-amber-800/30 text-amber-700" :
                                "bg-slate-900 border-white/5 text-slate-600"
                            }`}>
                            {result.rank.toString().padStart(2, '0')}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-white leading-tight uppercase group-hover:text-primary transition-colors">{result.teamName}</span>
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest mt-1 uppercase">{result.teamId}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-slate-700" />
                            <p className="text-sm font-bold text-slate-400 uppercase line-clamp-1">{result.problemTitle}</p>
                          </div>
                        </td>
                        {availableCriteria.map(name => (
                          <td key={name} className="px-6 py-8 text-center font-black text-white/40">
                            {result.scoreBreakdown[name] || 0}
                          </td>
                        ))}
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex items-center justify-center px-8 py-2.5 bg-slate-950 border border-white/5 rounded-2xl">
                            <span className="text-xl font-black text-primary tracking-tighter">{result.totalMarks}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-40 space-y-8">
            <div className="w-32 h-32 bg-slate-900 border border-white/5 rounded-[3rem] flex items-center justify-center shadow-inner animate-pulse">
              <Shield className="w-12 h-12 text-slate-800" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-slate-600 uppercase tracking-widest italic leading-none">No Results Available</p>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Please wait for teams to be evaluated.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
