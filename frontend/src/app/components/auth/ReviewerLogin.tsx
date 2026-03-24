import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, ClipboardCheck, ArrowRight, Shield, Zap, Globe, Cpu, Target } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";
import { toast } from "sonner";


export function ReviewerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"standard" | "id">("standard");

  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");
    if (eventId) {
      localStorage.setItem("selectedEventId", eventId);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = loginMode === "standard" ? "/auth/login" : "/auth/reviewer-login";
      const body = loginMode === "standard"
        ? { username: username.trim(), password, role: "reviewer" }
        : { email: username.trim(), uniqueId: password.trim() }; // Use password field for uniqueId in standard UI or separate

      const data = await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful!");
      navigate("/reviewer/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Tactical Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative z-10"
      >
        {/* Left Side: Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-slate-950 to-slate-900 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Review Portal</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase">
                Reviewer<br />
                <span className="text-primary italic">Dashboard</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-sm leading-relaxed">
                Evaluate team performance and assign scores based on the specified criteria.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Accurate Scoring", icon: Target },
                { label: "Immediate Feedback", icon: Zap },
                { label: "Team Analytics", icon: Cpu },
                { label: "Secure Login", icon: Shield }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-white/5">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active evaluators in the system</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 lg:p-20 flex flex-col justify-center relative">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-primary/20 rounded-[1.5rem] mb-6 shadow-xl shadow-primary/5 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Reviewer <span className="text-primary italic">Login</span></h2>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Enter your credentials to access the evaluation system</p>
          </div>

          {/* Mode Selector */}
          <div className="flex p-1.5 bg-slate-950 border border-white/5 rounded-2xl mb-8 gap-1">
            <button
              onClick={() => setLoginMode("standard")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'standard' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
            >
              Standard Access
            </button>
            <button
              onClick={() => setLoginMode("id")}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'id' ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
            >
              ID-Based Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                {loginMode === 'standard' ? 'Username or Email' : 'Email Address'}
              </label>
              <div className="relative group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold placeholder:text-slate-800 shadow-inner"
                  placeholder={loginMode === 'standard' ? "USERNAME / EMAIL" : "e.g. validator@domain.com"}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {loginMode === 'standard' ? 'Password' : 'Reviewer ID'}
                </label>
              </div>
              <div className="relative group">
                {loginMode === 'standard' ? (
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                ) : (
                  <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                )}
                <input
                  type={loginMode === 'standard' ? "password" : "text"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold placeholder:text-slate-800 shadow-inner uppercase font-mono tracking-widest"
                  placeholder={loginMode === 'standard' ? "••••••••••••" : "REV-XXXX"}
                  required
                />
              </div>
              {loginMode === 'id' && (
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
                  Use the unique Reviewer ID provided by the administration.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="w-full h-px bg-white/5 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all"
            >
              <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-all">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </div>
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-4">
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          Technical Symposium 2026 • Review Core v4.0.2
          <div className="w-1 h-1 rounded-full bg-slate-700" />
        </p>
      </div>
    </div>
  );
}
