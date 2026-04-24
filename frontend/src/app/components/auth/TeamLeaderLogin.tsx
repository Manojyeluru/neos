import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, Mail, Users, ArrowLeft, Loader2, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";


export function TeamLeaderLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful!");
      if (data.user.role === 'admin' || data.user.role === 'coordinator') {
        navigate("/admin/dashboard");
      } else if (data.user.role === 'reviewer') {
        navigate("/reviewer/dashboard");
      } else {
        navigate("/teamleader/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const data = await fetchApi("/auth/google-login", {
        method: "POST",
        body: JSON.stringify({ idToken, role: "teamleader" }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Google login successful!");
      
      if (data.user.role === 'admin' || data.user.role === 'coordinator') {
        navigate("/admin/dashboard");
      } else {
        navigate("/teamleader/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Google login failed.");
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="p-10 lg:p-12">
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 bg-white border border-primary/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5 overflow-hidden"
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
              Participant <span className="text-primary italic">Portal</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Participant & Leader Login</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold placeholder:text-slate-800 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" title="Recover Access" className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">
                  Lost Key?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-950 border border-white/5 focus:border-primary/50 rounded-2xl transition-all outline-none text-white font-bold placeholder:text-slate-800 shadow-inner"
                />
              </div>
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

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-slate-900/40 px-4 text-slate-600">Secure Alternate</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-5 bg-white/[0.03] border border-white/5 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-3 group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-slate-500 font-bold text-xs">
              Don't have an account?
              <Link to="/register" className="ml-2 text-primary hover:underline italic">Register Here</Link>
            </p>
          </motion.div>

          <footer className="mt-12 flex flex-col items-center gap-6">
            <div className="w-full h-px bg-white/5 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all"
            >
              <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-all">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
              Back to Home
            </button>
          </footer>
        </div>
      </motion.div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-4">
          <div className="w-1 h-1 rounded-full bg-slate-700" />
          Technical Symposium 2026 • Portal v4.0
          <div className="w-1 h-1 rounded-full bg-slate-700" />
        </p>
      </div>
    </div>
  );
}
