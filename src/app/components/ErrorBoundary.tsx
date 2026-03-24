import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-red-500/10 blur-[150px] rounded-full -mr-40 -mt-40 pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card max-w-lg w-full p-12 text-center rounded-[3rem] border border-red-500/20 shadow-2xl relative z-10"
                    >
                        <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                            <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>

                        <h1 className="text-4xl font-black text-white mb-4 leading-tight">System Breach<br /><span className="text-red-500 italic">detected</span></h1>

                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            The application encountered an unexpected runtime exception. Our protocols have safely isolated the error.
                        </p>

                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 mb-8 text-left overflow-auto max-h-40">
                            <p className="text-red-400 font-mono text-xs break-all">
                                {this.state.error?.name}: {this.state.error?.message}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                <RefreshCw className="w-5 h-5" /> Reboot App
                            </button>
                            <a
                                href="/"
                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all"
                            >
                                <Home className="w-5 h-5" /> Surface Level
                            </a>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
