import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  Award,
  FileText,
  Users,
  UsersRound,
  Trophy,
  LogOut,
  Terminal as TerminalIcon,
  Search,
  List,
  Camera,
  Menu,
  X,
} from "lucide-react";
import { Terminal } from "../admin/Terminal";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "../../utils/api";
import { useEffect } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTerminal, setShowTerminal] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(localStorage.getItem('selectedEventId') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await fetchApi("/admin/events");
      setEvents(data);
      if (!selectedEventId && data.length > 0) {
        handleEventChange(data[0].eventId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedEventId) loadSettings();
  }, [selectedEventId]);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/admin/settings");
      setSettings(data);
    } catch (err) {
      setSettings(null);
    }
  };

  const handleEventChange = (eventId: string) => {
    localStorage.setItem('selectedEventId', eventId);
    setSelectedEventId(eventId);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/admin/events", label: "Manage Events", icon: List },
    { path: "/admin/rounds", label: "Evaluation Rounds", icon: Calendar },
    { path: "/admin/criteria", label: "Scoring Criteria", icon: Award },
    { path: "/admin/voting", label: "Voting Control", icon: TerminalIcon },
    { path: "/admin/attendance", label: "Attendance", icon: Camera },
    { path: "/admin/problems", label: "Challenges", icon: FileText, show: settings?.problemStatementsRequired !== false },
    { path: "/admin/reviewers", label: "Reviewers", icon: Users, show: settings?.reviewersRequired !== false },
    { path: "/admin/teams", label: "Teams List", icon: UsersRound },
    { path: "/admin/results", label: "Final Results", icon: Trophy },
  ].filter(item => item.show !== false);

  const bottomNavItems = [
    { path: "/admin/dashboard", label: "Dash", icon: LayoutDashboard },
    { path: "/admin/teams", label: "Teams", icon: UsersRound },
    { path: "/admin/problems", label: "Problems", icon: FileText },
    { path: "/admin/attendance", label: "Attend", icon: Camera },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitials = (user.name || 'AD').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      <div className={`p-5 lg:p-6 ${onClose ? 'flex items-center justify-between border-b border-white/5' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black text-white tracking-tight">KARE Event</h2>
            <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Administration</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {events.length > 0 && (
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Event</p>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer flex-1 min-w-0 truncate"
            >
              {events.map((e) => (
                <option key={e.eventId} value={e.eventId} className="bg-slate-950 text-white">{e.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 lg:px-4 pt-4 space-y-1 overflow-y-auto">
        <p className="px-3 lg:px-4 text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 lg:py-2.5 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"} transition-colors`} />
              <span className="font-bold text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 lg:p-6 mt-auto border-t border-white/5">
        {onClose && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/50 border border-white/5 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">{user.role || 'Administrator'}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all w-full border border-transparent hover:border-rose-500/20 group font-bold text-sm"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

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
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] flex-col border-r border-white/5 relative z-20 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Header */}
        <header className="h-14 lg:h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl px-3 lg:px-6 flex items-center justify-between relative z-10 flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Search */}
            <div className="relative group hidden sm:block flex-1 max-w-xs lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-900/50 border border-white/5 py-2 pl-9 pr-4 rounded-xl text-xs focus:outline-none focus:border-primary/50 transition-all font-medium text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            {/* Terminal toggle (desktop) */}
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl transition-all border text-[10px] ${showTerminal
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span className="font-black uppercase tracking-widest">CLI</span>
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-white leading-tight">{user.name || 'Admin'}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.role || 'Admin'}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center border border-white/10 shadow-lg relative flex-shrink-0">
                <span className="text-white font-black text-xs">{userInitials}</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}
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
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${isActive ? "bg-primary/15 border border-primary/30" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-500"}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-primary" : "text-slate-600"}`}>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-2xl">
            <Menu className="w-5 h-5 text-slate-500" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">More</span>
        </button>
      </nav>

    </div>
  );
}
