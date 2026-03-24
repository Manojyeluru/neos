import { useState, useEffect } from "react";
import { TeamLeaderLayout } from "../layouts/TeamLeaderLayout";
import { Check, Lock, FileText, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

interface Problem {
  _id: string;
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export function ProblemSelection() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      loadInitialData(user.uniqueId);
    }
  }, []);

  const loadInitialData = async (teamId: string) => {
    try {
      const [problemsData, teamData, settingsData] = await Promise.all([
        fetchApi("/team/problem-statements"),
        fetchApi(`/team/info/${teamId}`),
        fetchApi("/team/settings")
      ]);
      setProblems(problemsData);
      setTeamInfo(teamData);
      setSettings(settingsData);

      if (teamData.problemStatementId) {
        setSelectedId(teamData.problemStatementId._id || teamData.problemStatementId);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = async (problemInternalId: string) => {
    if (!teamInfo) return;

    const confirmSelection = window.confirm(
      "Are you sure? Once selected, you cannot change your problem statement."
    );

    if (!confirmSelection) return;

    setSubmitting(true);
    try {
      await fetchApi("/team/select-problem", {
        method: "POST",
        body: JSON.stringify({
          teamId: teamInfo.teamId,
          problemStatementId: problemInternalId
        })
      });
      setSelectedId(problemInternalId);
      const updatedTeam = await fetchApi(`/team/info/${teamInfo.teamId}`);
      setTeamInfo(updatedTeam);
    } catch (err: any) {
      alert(err.message || "Failed to select problem");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": case "Basic":
        return "bg-green-100 text-green-700 border-green-300";
      case "Medium": case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Hard": case "Advanced":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading) {
    return (
      <TeamLeaderLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Synchronizing with registry...</p>
        </div>
      </TeamLeaderLayout>
    );
  }

  if (settings && !settings.problemsReleased) {
    return (
      <TeamLeaderLayout>
        <div className="max-w-4xl mx-auto py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-16 shadow-2xl border border-amber-100 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-amber-100">
              <ShieldAlert className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Objectives <span className="text-amber-500 italic">Encrypted</span></h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
                The tactical problem statements are currently locked. The administrator will release them once the operation commences.
              </p>
            </div>
            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-600 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Awaiting Administrative Protocol
              </div>
            </div>
          </motion.div>
        </div>
      </TeamLeaderLayout>
    );
  }

  const isLocked = teamInfo?.locked || selectedId !== null;

  return (
    <TeamLeaderLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Problem Statement
          </h2>
          <p className="text-gray-600">
            Choose one problem statement for your team to work on. Once selected, your choice will be locked.
          </p>
        </div>

        {isLocked && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-indigo-900">Selection Locked</p>
              <p className="text-sm text-indigo-700">
                You have already finalized your problem statement.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => {
            const isSelected = selectedId === problem._id || selectedId === problem.id;
            const isDisabled = isLocked && !isSelected;

            return (
              <div
                key={problem._id}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden flex flex-col ${isSelected
                  ? "border-indigo-500 shadow-indigo-200 scale-[1.02]"
                  : isDisabled
                    ? "border-gray-200 opacity-50 grayscale-[0.5]"
                    : "border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02]"
                  }`}
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? "bg-indigo-100" : "bg-gray-100"
                        }`}>
                        <FileText className={`w-5 h-5 ${isSelected ? "text-indigo-600" : "text-gray-600"
                          }`} />
                      </div>
                      <span className="text-sm font-mono font-semibold text-gray-600">
                        {problem.id}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {isDisabled && (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {problem.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    {problem.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => !isSelected && !isDisabled && handleSelectProblem(problem._id)}
                    disabled={isDisabled || submitting || isSelected}
                    className={`mt-6 w-full py-4 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
                      ? "bg-green-500 text-white cursor-default"
                      : isDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:from-indigo-700 hover:to-cyan-600 shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isSelected ? (
                      <>
                        <Check className="w-5 h-5" />
                        Selected & Locked
                      </>
                    ) : isDisabled ? (
                      <>
                        <Lock className="w-5 h-5" />
                        Unavailable
                      </>
                    ) : (
                      <>
                        Select Problem
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {problems.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No Problems Available</h3>
            <p className="text-gray-600">The administrator hasn't uploaded any problem statements yet.</p>
          </div>
        )}
      </div>
    </TeamLeaderLayout>
  );
}
