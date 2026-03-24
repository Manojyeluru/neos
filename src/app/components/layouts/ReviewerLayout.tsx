import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, LogOut, ShieldCheck,
  Bell, ChevronDown, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function ReviewerLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuItems = [
    { path: "/reviewer/dashboard", label: "Dashboard", icon: UserCheck },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground selection:bg-primary selection:text-white">
      {/* Sidebar (Formal) */}
      <aside className="w-72 bg-[#0F172A] flex flex-col border-r border-white/5 relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight uppercase">Reviewer</h2>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Reviewer Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Navigation</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"} transition-colors`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="activeNavRV" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all w-full border border-transparent hover:border-rose-500/20 group font-bold text-sm"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Header */}
        <header className="h-24 border-b border-white/5 bg-background/50 backdrop-blur-xl px-10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Logged In</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors group">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border border-slate-900" />
            </button>

            <div className="h-8 w-[1px] bg-white/5 mx-2" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-tight">{user?.name || "Official Reviewer"}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  {user?.uniqueId || "REV-CORE"} • {user?.department || "General Panel"}
                </p>
              </div>
              <div className="w-11 h-11 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg relative cursor-pointer hover:scale-105 transition-transform group">
                <span className="text-primary font-black text-sm group-hover:scale-110 transition-transform">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "RV"}
                </span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
