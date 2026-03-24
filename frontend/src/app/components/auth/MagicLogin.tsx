import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";
import { toast } from "sonner";


export function MagicLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get("token");
            if (!token) {
                setStatus("error");
                setError("Missing tactical access token.");
                return;
            }

            try {
                const data = await fetchApi("/auth/magic-login", {
                    method: "POST",
                    body: JSON.stringify({ token }),
                });

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setStatus("success");
                toast.success("UPLINK ESTABLISHED: Access authorized via secure link.");

                setTimeout(() => {
                    navigate("/reviewer/dashboard");
                }, 2000);
            } catch (err: any) {
                setStatus("error");
                setError(err.message || "Access link is invalid or has expired.");
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter text-white">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-12 rounded-[3rem] border border-white/5 text-center relative z-10 shadow-2xl"
            >
                {status === "verifying" && (
                    <div className="space-y-8">
                        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-primary/5">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Verifying Uplink</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Authenticating via secure token relay...</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8">
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/5">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Access Authorized</h2>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Decrypting mission dashboard...</p>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-8">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-red-500/5">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Uplink Failed</h2>
                            <p className="text-red-400 font-bold text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => navigate("/login/reviewer")}
                            className="w-full py-5 bg-slate-900 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                            Back to Manual Login
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
