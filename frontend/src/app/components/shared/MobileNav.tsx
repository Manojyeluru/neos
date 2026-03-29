import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Users, User, Settings, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Only show for logged in users on mobile
    if (!user.role) return null;

    const getLinks = () => {
        switch (user.role) {
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Dash', path: '/admin/dashboard' },
                    { icon: Users, label: 'Teams', path: '/admin/teams' },
                    { icon: FolderKanban, label: 'Problems', path: '/admin/problems' },
                    { icon: Settings, label: 'Setup', path: '/admin/settings' },
                ];
            case 'teamleader':
                return [
                    { icon: LayoutDashboard, label: 'Dash', path: '/teamleader/dashboard' },
                    { icon: FolderKanban, label: 'Problems', path: '/teamleader/problems' },
                    { icon: User, label: 'My Team', path: '/teamleader/my-team' },
                ];
            case 'reviewer':
                return [
                    { icon: LayoutDashboard, label: 'Dash', path: '/reviewer/dashboard' },
                ];
            default:
                return [];
        }
    };

    const links = getLinks();
    if (links.length === 0) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-6 pb-6">
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] py-4 px-6 shadow-2xl flex justify-around items-center"
            >
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className="relative flex flex-col items-center gap-1 group"
                        >
                            <div
                                className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                                {link.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </motion.div>
        </div>
    );
}
