import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Settings, ShieldCheck, Trophy, ArrowLeft } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password, role: "admin" }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-foreground relative overflow-hidden font-inter">
      {/* Structural Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Left side - Branding (Formal) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 bg-white backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-10 border border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden"
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">
              Event <br />
              <span className="text-primary text-6xl">Administration</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
              Official gateway for managing participants and evaluating events.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 space-y-6 text-left w-full max-w-xs mx-auto"
          >
            {[
              "Event Configuration",
              "Real-Time Result Management",
              "User Access Control"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form (Formal) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md glass-card rounded-[3rem] px-10 py-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5"
        >
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 border border-white/10 rounded-3xl mb-4 shadow-inner">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
              Admin Login
            </h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Administrator Login
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="username" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-white/5 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                placeholder="Admin username"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-white/5 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                  placeholder="••••••••••••"
                  required
                />
                <ShieldCheck className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 px-6 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <footer className="mt-12 text-center space-y-6">
            <div className="h-[1px] bg-white/5 w-1/2 mx-auto" />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mx-auto font-black text-[10px] uppercase tracking-widest group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Base
            </button>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Symposium System v4.0 • Secure Session
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
