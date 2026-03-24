import { Outlet, ScrollRestoration } from "react-router";
import { MobileNav } from "./MobileNav";
import { PageTransition } from "./PageTransition";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router";

export function Shell() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-foreground antialiased font-inter scroll-smooth overflow-x-hidden">
            <ScrollRestoration />

            {/* Dynamic Page Transitions */}
            <AnimatePresence mode="wait" initial={false}>
                <PageTransition key={location.pathname}>
                    <div className="pb-32 md:pb-0">
                        <Outlet />
                    </div>
                </PageTransition>
            </AnimatePresence>

            {/* Floating App-like Navigation for Mobile */}
            <MobileNav />

            {/* Modern Background Gradient (Flutter High Fidelity Style) */}
            <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-700" />
            </div>
        </div>
    );
}
