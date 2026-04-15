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
  Bell,
  Search,
  ChevronDown,
  List,
  Camera
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await fetchApi("/admin/events");
      setEvents(data);
      // If none selected, pick the first one
      if (!selectedEventId && data.length > 0) {
        handleEventChange(data[0].eventId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadSettings();
    }
  }, [selectedEventId]);

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/admin/settings");
      setSettings(data);
    } catch (err) {
      console.error(err);
      setSettings(null); // Clear settings if no event selected or failed
    }
  };

  const handleEventChange = (eventId: string) => {
    localStorage.setItem('selectedEventId', eventId);
    setSelectedEventId(eventId);
    // Reload page to refresh all data context if needed, 
    // but React state update + re-fetching in components should be enough.
    // However, some components might not be watching localStorage.
    // A quick window.location.reload() is the safest way to reset all stores/states.
    window.location.reload();
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/admin/events", label: "Manage Events", icon: List },
    { path: "/admin/rounds", label: "Evaluation Rounds", icon: Calendar },
    { path: "/admin/criteria", label: "Scoring Criteria", icon: Award },
    { path: "/admin/voting", label: "Voting Control", icon: TerminalIcon },
    { path: "/admin/attendance", label: "Attendance Monitor", icon: Camera },
    { path: "/admin/problems", label: "Challenges", icon: FileText, show: settings?.problemStatementsRequired !== false },
    { path: "/admin/reviewers", label: "Reviewers", icon: Users, show: settings?.reviewersRequired !== false },
    { path: "/admin/teams", label: "Teams List", icon: UsersRound },
    { path: "/admin/results", label: "Final Results", icon: Trophy },
  ].filter(item => item.show !== false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] flex flex-col border-r border-white/5 relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">KARE Event</h2>
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Administration</p>
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"} transition-colors`} />
                <span className="font-bold text-xs tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
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
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Global Header */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative group max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search global records..."
                className="w-full bg-slate-900/50 border border-white/5 py-2.5 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-medium text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Event Selector */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-white/5 shadow-inner">
              <Calendar className="w-4 h-4 text-primary" />
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-300 outline-none cursor-pointer hover:text-white transition-colors min-w-[150px]"
              >
                {events.map((e) => (
                  <option key={e.eventId} value={e.eventId} className="bg-slate-950 text-white">
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900 group-hover:scale-125 transition-transform" />
            </button>

            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${showTerminal
                ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                : "bg-slate-900 border-white/5 text-slate-400 hover:border-primary/30 hover:text-white"
                }`}
            >
              <TerminalIcon className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Terminal</span>
            </button>

            <div className="h-8 w-[1px] bg-white/5 mx-2" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-tight">
                  {JSON.parse(localStorage.getItem('user') || '{}').name || 'Admin'}
                </p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  {JSON.parse(localStorage.getItem('user') || '{}').role || 'Administrator'}
                </p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg relative cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white font-black text-sm uppercase">
                  {(JSON.parse(localStorage.getItem('user') || '{}').name || 'AD')[0]}
                  {(JSON.parse(localStorage.getItem('user') || '{}').name || 'AD').split(' ')[1]?.[0] || (JSON.parse(localStorage.getItem('user') || '{}').name || 'AD')[1]}
                </span>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content with Entrance Animation */}
        <main className="flex-1 overflow-auto p-6 relative">
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
          {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}
        </main>
      </div>
    </div>
  );
}
