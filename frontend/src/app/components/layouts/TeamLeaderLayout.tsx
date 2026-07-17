import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  FileText, LogOut,
  LayoutDashboard, Target, ShieldCheck,
  Menu, X, Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function TeamLeaderLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const menuItems = [
    { path: "/teamleader/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/teamleader/problems", label: "Problem Statements", icon: Target },
    { path: "/teamleader/my-team", label: "My Team", icon: ShieldCheck },
    { path: "/teamleader/project-upload", label: "Project Upload", icon: FileText },
  ];

  const bottomNavItems = [
    { path: "/teamleader/dashboard", label: "Dash", icon: LayoutDashboard },
    { path: "/teamleader/my-team", label: "Team", icon: ShieldCheck },
    { path: "/teamleader/problems", label: "Problems", icon: Target },
    { path: "/teamleader/project-upload", label: "Upload", icon: Upload },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const userInitials = user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "TL";

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 bg-[#0F172A] border-r border-white/5 z-50 flex flex-col lg:hidden"
            >
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white tracking-tight">Event Portal</h2>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Participant</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Navigation</p>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"}`} />
                      <span className="font-bold text-sm">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/50 border border-white/5 mb-3">
                  <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <span className="text-primary font-black text-xs">{userInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{user?.name || "User"}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">ID: {user?.uniqueId || "..."}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all w-full border border-transparent hover:border-rose-500/20 font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-72 bg-[#0F172A] flex-col border-r border-white/5 relative z-20 flex-shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-tight">Event Portal</h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Participant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
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
                  <motion.div layoutId="activeNavTL" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
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
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

        {/* Header */}
        <header className="h-14 lg:h-20 border-b border-white/5 bg-background/50 backdrop-blur-xl px-4 lg:px-10 flex items-center justify-between relative z-10 flex-shrink-0 gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden sm:block px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <span className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-widest leading-none">Access Level: Leader</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-white leading-tight">{user?.name || "User"}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">ID: {user?.uniqueId || "..."}</p>
            </div>
            <div className="w-9 h-9 lg:w-11 lg:h-11 bg-primary/20 rounded-xl lg:rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg relative flex-shrink-0">
              <span className="text-primary font-black text-xs">{userInitials}</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "circOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-1 py-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 px-3 py-2"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${isActive ? "bg-primary/15 border border-primary/30" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-500"}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-primary" : "text-slate-600"}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
