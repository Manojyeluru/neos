import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export const RouteError: React.FC = () => {
    const error = useRouteError();
    console.error('Route Error:', error);

    let errorMessage = 'An unexpected error occurred.';
    let errorTitle = 'System Breach';

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            errorTitle = 'Coordinate Lost';
            errorMessage = "The requested coordinates do not exist in the mainframe.";
        } else {
            errorMessage = error.statusText || error.data?.message || errorMessage;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-red-500/10 blur-[150px] rounded-full -mr-40 -mt-40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full -ml-40 -mb-40 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card max-w-lg w-full p-12 text-center rounded-[3rem] border border-red-500/20 shadow-2xl relative z-10"
            >
                <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-4xl font-black text-white mb-4 leading-tight">{errorTitle}<br /><span className="text-red-500 italic">detected</span></h1>

                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    {errorMessage}
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-primary text-white font-black text-xl rounded-2xl hover:bg-primary/90 transition-all shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
                    >
                        <RefreshCw className="w-5 h-5" /> REBOOT PROTOCOL
                    </button>
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-slate-900 border border-white/5 text-white font-black text-xl rounded-2xl hover:bg-slate-800 transition-all"
                    >
                        <Home className="w-5 h-5" /> RETURN TO HUB
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
