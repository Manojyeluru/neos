import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { fetchApi } from "../../utils/api";
import { toast } from "sonner";
import { Power, Settings2, Video, Vote, Users } from "lucide-react";
import { motion } from "framer-motion";

export function AdminVoting() {
    const [settings, setSettings] = useState<any>({});
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
        loadResults();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await fetchApi("/admin/settings");
            setSettings(data);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load settings');
        }
    };

    const loadResults = async () => {
        try {
            const data = await fetchApi("/admin/voting-results");
            setResults(data);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load voting results');
        }
    };

    const togglePhase = async (field: string, value: boolean) => {
        setLoading(true);
        try {
            const body = field === 'project' 
                ? { isProjectUploadOpen: value } 
                : { isVotingOpen: value };
                
            const res = await fetchApi('/admin/toggle-phases', {
                method: 'POST',
                body: JSON.stringify(body)
            });
            setSettings(res.settings);
            toast.success(`Successfully ${value ? 'enabled' : 'disabled'} the phase.`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update phase');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                        Voting & <span className="text-primary italic">Projects</span>
                    </h2>
                    <p className="text-slate-400 font-medium text-sm">
                        Manage project upload phases and public voting system access.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Upload Phase */}
                    <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Video className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Project Uploads</h3>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 max-w-[250px]">
                            Enable this to allow teams to submit their project description and demonstration video link.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => togglePhase('project', !settings.isProjectUploadOpen)}
                                disabled={loading}
                                className={`formal-btn font-black uppercase tracking-widest text-[10px] rounded-xl px-8 py-4 flex items-center gap-3 transition-all ${
                                    settings.isProjectUploadOpen 
                                        ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                                        : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                                }`}
                            >
                                <Power className="w-4 h-4" />
                                {settings.isProjectUploadOpen ? 'CLOSE UPLOADS' : 'ENABLE UPLOADS'}
                            </button>
                        </div>
                        
                        <div className={`mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${settings.isProjectUploadOpen ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                            <div className={`w-2 h-2 rounded-full ${settings.isProjectUploadOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${settings.isProjectUploadOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
                                STATUS: {settings.isProjectUploadOpen ? 'OPEN' : 'CLOSED'}
                            </span>
                        </div>
                    </div>

                    {/* Public Voting Phase */}
                    <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/20 group-hover:scale-110 transition-transform">
                            <Vote className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Public Voting</h3>
                        <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 max-w-[250px]">
                            Allow University students and faculty (KLU emails) to view projects and cast their 3 votes.
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => togglePhase('voting', !settings.isVotingOpen)}
                                disabled={loading || settings.isProjectUploadOpen} // usually you don't vote while uploads are open
                                className={`formal-btn font-black uppercase tracking-widest text-[10px] rounded-xl px-8 py-4 flex items-center gap-3 transition-all ${
                                    settings.isProjectUploadOpen ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' :
                                    settings.isVotingOpen 
                                        ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                                        : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                                }`}
                                title={settings.isProjectUploadOpen ? "Please close project uploads first" : "Click to toggle"}
                            >
                                <Power className="w-4 h-4" />
                                {settings.isVotingOpen ? 'CLOSE VOTING' : 'OPEN VOTING'}
                            </button>
                        </div>

                        <div className={`mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${settings.isVotingOpen ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                            <div className={`w-2 h-2 rounded-full ${settings.isVotingOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${settings.isVotingOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
                                STATUS: {settings.isVotingOpen ? 'LIVE' : 'OFFLINE'}
                            </span>
                        </div>
                    </div>
                </div>

                {results && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 space-y-6"
                    >
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Voting Dashboard</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl flex items-center justify-between group">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Points</p>
                                    <p className="text-3xl font-black text-white">{results.totalVotes}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Vote className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl flex items-center justify-between group">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Students Voted</p>
                                    <p className="text-3xl font-black text-white">{results.studentsVoted}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-xl flex items-center justify-between group">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Faculties Voted</p>
                                    <p className="text-3xl font-black text-white">{results.facultiesVoted}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border border-white/5 shadow-2xl">
                            <h4 className="flex items-center gap-3 text-lg font-black text-white uppercase tracking-tighter mb-6">
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">🏆</span>
                                Leaderboard
                            </h4>
                            
                            {results.teams && results.teams.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {results.teams.map((team: any, index: number) => (
                                        <div key={team._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                                    index === 0 ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                                                    index === 1 ? 'bg-slate-300 text-slate-800 shadow-[0_0_10px_rgba(203,213,225,0.4)]' :
                                                    index === 2 ? 'bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.4)]' : 
                                                    'bg-white/10 text-slate-400'
                                                }`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="font-bold text-white text-lg">{team.teamName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                                                <span className="text-primary font-black text-xl">{team.votes}</span>
                                                <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Points</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 font-medium">No votes cast yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}
