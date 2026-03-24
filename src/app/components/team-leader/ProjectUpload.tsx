import { useState, useEffect } from "react";
import { TeamLeaderLayout } from "../layouts/TeamLeaderLayout";
import { fetchApi } from "../../utils/api";
import { toast } from "sonner";
import { Video, Edit3, Send, CheckCircle } from "lucide-react";

export function ProjectUpload() {
    const [settings, setSettings] = useState<any>({});
    const [teamInfo, setTeamInfo] = useState<any>(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const [settingsData, teamData] = await Promise.all([
                fetchApi("/team/settings"),
                fetchApi(`/team/info/${user.uniqueId}`)
            ]);
            setSettings(settingsData);
            setTeamInfo(teamData);
            
            if (teamData?.project) {
                setVideoUrl(teamData.project.videoUrl || "");
                setDescription(teamData.project.description || "");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to load project details");
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await fetchApi("/team/upload-project", {
                method: "POST",
                body: JSON.stringify({
                    teamId: user.uniqueId,
                    videoUrl,
                    description
                })
            });
            toast.success("Project submitted successfully!");
            loadData();
        } catch (err: any) {
            toast.error(err.message || "Failed to upload project");
        } finally {
            setLoading(false);
        }
    };

    if (checking) return null;

    return (
        <TeamLeaderLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                        Project <span className="text-primary italic">Submission</span>
                    </h2>
                    <p className="text-slate-400 font-medium text-sm">
                        Submit your project video and description for public voting.
                    </p>
                </div>

                {!settings.isProjectUploadOpen ? (
                    <div className="glass-card p-12 rounded-3xl text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">
                            Uploads Closed
                        </h3>
                        <p className="text-slate-500 font-medium">
                            The administrative portal has not opened the project upload window yet. Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                        {teamInfo?.project?.isUploaded && (
                            <div className="absolute top-0 right-0 p-4">
                                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                    <CheckCircle className="w-4 h-4" /> Submitted
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Project Video Link
                                </label>
                                <div className="relative">
                                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <input
                                        type="url"
                                        required
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=... or Google Drive link"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/5 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 ml-1">Accepts YouTube, Google Drive, or direct video URL.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Project Description
                                </label>
                                <div className="relative">
                                    <Edit3 className="absolute left-4 top-4 w-4 h-4 text-primary" />
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Explain your technical stack, architecture, and the problem you are solving..."
                                        rows={8}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-white/5 rounded-xl text-white outline-none focus:border-primary/50 transition-all text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="formal-btn w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-xl py-5 flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {loading ? 'Submitting...' : (teamInfo?.project?.isUploaded ? 'Update Submission' : 'Submit Project')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </TeamLeaderLayout>
    );
}
