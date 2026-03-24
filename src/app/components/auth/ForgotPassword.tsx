import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (response.ok) setSent(true);
            else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-8 text-center bg-primary/20">
                    <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                    <p className="text-slate-400 mt-2">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                <div className="p-8">
                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>

                            <Link to="/login/team-leader" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </form>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-accent" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Email Sent!</h2>
                                <p className="text-slate-400 text-sm">Please check your inbox (and spam folder) for the reset link.</p>
                            </div>
                            <button
                                onClick={() => navigate('/login/team-leader')}
                                className="w-full border border-slate-700 hover:border-slate-500 text-white font-bold py-2.5 rounded-lg"
                            >
                                Back to Login
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
