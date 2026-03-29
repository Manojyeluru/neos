import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Lock, School, Building, Home,
    ArrowRight, ArrowLeft, CheckCircle2, Loader2,
    Users, CreditCard, QrCode, ShieldAlert,
    Banknote, Info, ExternalLink, RefreshCw, Trophy
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { fetchApi } from "../../utils/api";

const RegisterTeam: React.FC = () => {
    const [step, setStep] = useState(1); // Start directly at step 1 — mode is set by admin
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [formData, setFormData] = useState({
        teamName: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        regNo: '',
        year: '1',
        department: '',
        collegeType: 'KARE', // Default
        collegeName: 'KARE', // Default if KARE
        residenceType: 'Dayscholor',
        hostelNumber: '',
        paymentReference: '',
    });

    const [members, setMembers] = useState<any[]>([]);
    const [participationMode, setParticipationMode] = useState<'solo' | 'team'>('team');

    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get("eventId") || localStorage.getItem("selectedEventId");
        if (eventId) {
            localStorage.setItem("selectedEventId", eventId);
            loadSettings(eventId);
        } else {
            loadSettings();
        }
    }, []);

    const loadSettings = async (eventId?: string) => {
        setInitialLoading(true);
        try {
            const data = await fetchApi(`/auth/event-settings${eventId ? `?eventId=${eventId}` : ''}`);
            if (data) {
                setSettings(data);

                // Admin controls the mode — participant never chooses
                if (data.registrationType === 'Single') {
                    setParticipationMode('solo');
                    setMembers([]); // No additional members for solo
                } else {
                    setParticipationMode('team');
                    // Pre-fill minimum required members (excluding leader)
                    const min = data.minMembers || 1;
                    const initialMembers = Array(Math.max(0, min - 1)).fill(0).map(() => ({
                        name: '',
                        regNo: '',
                        email: '',
                        collegeType: 'KARE',
                        collegeName: 'KARE',
                        residenceType: 'Dayscholor',
                        hostelNumber: '',
                        department: '',
                        year: '1'
                    }));
                    setMembers(initialMembers);
                }

                // Always start at step 1 — skip the selection screen
                setStep(1);
            }
        } catch (err) {
            console.error("Failed to load settings", err);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMemberChange = (index: number, field: string, value: string) => {
        const updatedMembers = [...members];
        updatedMembers[index][field] = value;
        setMembers(updatedMembers);
    };

    const addMember = () => {
        if (members.length + 1 < settings.maxMembers) {
            setMembers([...members, {
                name: '',
                regNo: '',
                email: '',
                collegeType: 'KARE',
                collegeName: 'KARE',
                residenceType: 'Dayscholor',
                hostelNumber: '',
                department: '',
                year: '1'
            }]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length + 1 > settings.minMembers) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                teamName: participationMode === 'solo' ? `${formData.name}'s Registration` : formData.teamName,
                eventId: settings?.eventId,
                members: participationMode === 'solo' ? [] : members // Ensure no members for solo
            };

            const response = await fetchApi('/auth/register/team-leader', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response) {
                setStep(4); // Success step
            }
        } catch (err: any) {
            alert(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase text-xs">Loading...</p>
            </div>
        );
    }


    if (!settings) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-lg w-full p-12 text-center rounded-[2.5rem] border border-red-500/20"
                >
                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">Connection Failed</h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        Unable to establish a connection with the event server. Please verify your network and retry.
                    </p>
                    <button onClick={() => loadSettings()} className="inline-flex items-center gap-2 px-8 py-4 bg-primary rounded-2xl text-white font-bold hover:bg-primary/90 transition-all">
                        <RefreshCw className="w-5 h-5" /> Reconnect
                    </button>
                </motion.div>
            </div>
        );
    }

    if (settings.eventStatus === 'Closed' || settings.eventStatus === 'Completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-lg w-full p-12 text-center rounded-[2.5rem] border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
                >
                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4">{settings.eventStatus === 'Completed' ? 'Mission Accomplished' : 'Registration Locked'}</h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        {settings.eventStatus === 'Completed' ? 'This event has concluded. Registrations are no longer accepted.' : 'Registration for this event is currently closed. Please contact the organizers for more information.'}
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white font-bold hover:bg-slate-800 transition-all">
                        <ArrowLeft className="w-5 h-5" /> Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                    {/* Left Panel - Progress & Info */}
                    <div className="lg:col-span-4 bg-primary/20 backdrop-blur-3xl p-8 border-r border-white/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 overflow-hidden border-2 border-primary/20">
                                {settings.clubLogo ? (
                                    <img src={settings.clubLogo} alt="Club Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Trophy className="w-8 h-8 text-primary" />
                                )}
                            </div>
                            <h1 className="text-2xl font-black text-white mb-2 leading-tight uppercase tracking-tighter">
                                {settings.name || 'Event'}<br />
                                <span className="text-primary italic">Registration</span>
                            </h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{settings.description || 'Join the symposium mission.'}</p>
 
                            {settings.eventPoster && (
                                <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                    <img src={settings.eventPoster} alt="Event Poster" className="w-full h-auto" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 relative z-10">
                            {(participationMode === 'solo' ? [1, 2] : [1, 2, 3]).map((s) => (
                                <div key={s} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === s ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.5)]" :
                                        step > s ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                                        }`}>
                                        {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                    </div>
                                    <div className={`text-sm font-bold uppercase tracking-widest ${step === s ? "text-white" : "text-slate-600"}`}>
                                        {s === 1 ? "Participant Info" : s === 2 ? "College Details" : "Team Members"}
                                    </div>
                                </div>
                            ))}
                            {settings?.isPaidEvent && (
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === settings.step ? "bg-primary text-white" : "bg-slate-800 text-slate-500"
                                        }`}>
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="text-xs font-black text-slate-600 uppercase tracking-widest">Payment Gateway</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Form Fields */}
                    <div className="lg:col-span-8 p-8 bg-white/[0.01]">
                        <form onSubmit={handleRegister} className="h-full flex flex-col justify-between">
                            <AnimatePresence mode="wait">
                                {/* Step 0 removed — registration type is set by the admin, not chosen by participants */}

                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                                <User className="w-5 h-5 text-primary" />
                                                {participationMode === 'solo' ? 'Participant Details' : 'Team Details'}
                                            </h2>
                                            <p className="text-slate-500 text-xs">Fill in your basic information below.</p>
                                        </div>

                                        {participationMode !== 'solo' && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Team Name</label>
                                                <input
                                                    type="text" name="teamName" required placeholder="Team Name Here"
                                                    value={formData.teamName} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{participationMode === 'solo' ? 'Full Name' : 'Team Leader Name'}</label>
                                                <input
                                                    type="text" name="name" required placeholder="Full Name"
                                                    value={formData.name} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Reg. Number</label>
                                                <input
                                                    type="text" name="regNo" required placeholder="E.G. 2112345"
                                                    value={formData.regNo} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                                <input
                                                    type="email" name="email" required placeholder="email@example.com"
                                                    value={formData.email} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                                <input
                                                    type="text" name="phone" required placeholder="E.G. 9876543210"
                                                    value={formData.phone} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                                <input
                                                    type="password" name="password" required placeholder="••••••••"
                                                    value={formData.password} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                                                <input
                                                    type="password" name="confirmPassword" required placeholder="••••••••"
                                                    value={formData.confirmPassword} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(0)}
                                                className="px-8 py-4 rounded-xl border border-white/5 text-slate-500 font-bold hover:text-white transition-all"
                                            >
                                                BACK
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex-1 group bg-primary py-4 rounded-xl text-white font-black text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                                <Building className="w-6 h-6 text-primary" />
                                                College Details
                                            </h2>
                                            <p className="text-slate-500 text-sm">Where are you currently studying?</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">College Type</label>
                                                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
                                                    {['KARE', 'Other'].map(type => (
                                                        <button
                                                            key={type} type="button"
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                collegeType: type,
                                                                collegeName: type === 'KARE' ? 'KARE' : ''
                                                            })}
                                                            className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.collegeType === type ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Year of Study</label>
                                                <select
                                                    name="year" value={formData.year} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none"
                                                >
                                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>YEAR 0{y}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {formData.collegeType === 'Other' && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">College Name</label>
                                                <input
                                                    type="text" name="collegeName" required placeholder="ENTER COLLEGE NAME"
                                                    value={formData.collegeName} onChange={handleInputChange}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none"
                                                />
                                            </div>
                                        )}

                                        {formData.collegeType === 'KARE' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Residence Status</label>
                                                    <select
                                                        name="residenceType" value={formData.residenceType} onChange={handleInputChange}
                                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none"
                                                    >
                                                        <option value="Dayscholor">Day Scholar</option>
                                                        <option value="Hostler">Hostler</option>
                                                    </select>
                                                </div>
                                                {formData.residenceType === 'Hostler' && (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Hostel Number</label>
                                                        <select
                                                            name="hostelNumber" value={formData.hostelNumber} onChange={handleInputChange}
                                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none"
                                                        >
                                                            <option value="">Select Hostel</option>
                                                            {['MH1', 'MH2', 'MH3', 'MH4', 'MH5', 'MH6', 'MH7', 'MH8', 'LH1', 'LH2', 'LH3', 'LH4', 'LH5'].map(h => (
                                                                <option key={h} value={h}>{h}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                            <input
                                                type="text" name="department" required placeholder="E.G. CSE / Mechanical"
                                                value={formData.department} onChange={handleInputChange}
                                                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-12">
                                            <button type="button" onClick={() => setStep(1)} className="px-8 py-5 rounded-2xl border border-white/5 text-slate-500 font-bold hover:text-white transition-all">BACK</button>
                                            <button
                                                type="button" onClick={() => {
                                                    if (participationMode === 'solo') {
                                                        settings.isPaidEvent ? setStep(3.5) : handleRegister({ preventDefault: () => {} } as any);
                                                    } else {
                                                        setStep(3);
                                                    }
                                                }}
                                                className="flex-1 bg-primary text-white font-black text-lg rounded-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                            >
                                                {participationMode === 'solo' ? (settings.isPaidEvent ? 'PROCEED TO PAYMENT' : 'REGISTER NOW') : 'CONTINUE'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                                    <Users className="w-6 h-6 text-primary" />
                                                    Team Members
                                                </h2>
                                                <p className="text-slate-500 text-sm">Enter the details of your team members.</p>
                                            </div>
                                            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                                                <span className="text-primary text-xs font-black uppercase tracking-widest">
                                                    Limit: {settings?.maxMembers || '...'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 max-h-[400px] overflow-auto pr-2 scrollbar-hide">
                                            {/* Leader is always member 0 in backend, but visually we show other members here */}
                                            <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg">TL</div>
                                                        <div>
                                                            <span className="text-white font-black block">{formData.name}</span>
                                                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Team Leader</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-mono text-primary/70 block uppercase tracking-tighter">Reg. No.: {formData.regNo}</span>
                                                        <span className="text-[10px] font-mono text-primary/70 block uppercase tracking-tighter">{formData.department} - Y{formData.year}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-primary/10 grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-primary/50">
                                                    <div>College: {formData.collegeName}</div>
                                                    <div className="text-right">Residence: {formData.residenceType} {formData.hostelNumber && `(${formData.hostelNumber})`}</div>
                                                </div>
                                            </div>

                                            {members.map((m, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    key={idx}
                                                    className="p-6 bg-slate-900/50 border border-white/5 rounded-[2rem] space-y-4 relative group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">MEMBER {idx + 2}</span>
                                                        <button
                                                            type="button" onClick={() => removeMember(idx)}
                                                            className="text-red-500/50 hover:text-red-500 text-xs font-bold"
                                                        >
                                                            REMOVE
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text" placeholder="NAME" value={m.name}
                                                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                                        />
                                                        <input
                                                            type="text" placeholder="REGISTRATION NUMBER" value={m.regNo}
                                                            onChange={(e) => handleMemberChange(idx, 'regNo', e.target.value)}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input
                                                            type="email" placeholder="EMAIL" value={m.email}
                                                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                                        />
                                                        <select
                                                            value={m.year}
                                                            onChange={(e) => handleMemberChange(idx, 'year', e.target.value)}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none"
                                                        >
                                                            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text" placeholder="DEPARTMENT" value={m.department}
                                                            onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 uppercase"
                                                        />
                                                        <select
                                                            value={m.collegeType}
                                                            onChange={(e) => {
                                                                handleMemberChange(idx, 'collegeType', e.target.value);
                                                                if (e.target.value === 'KARE') handleMemberChange(idx, 'collegeName', 'KARE');
                                                                else handleMemberChange(idx, 'collegeName', '');
                                                            }}
                                                            className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none"
                                                        >
                                                            <option value="KARE">KARE</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>

                                                    {m.collegeType === 'Other' && (
                                                        <input
                                                            type="text" placeholder="COLLEGE NAME" value={m.collegeName}
                                                            onChange={(e) => handleMemberChange(idx, 'collegeName', e.target.value)}
                                                            className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                                                        />
                                                    )}

                                                    {m.collegeType === 'KARE' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <select
                                                                value={m.residenceType}
                                                                onChange={(e) => handleMemberChange(idx, 'residenceType', e.target.value)}
                                                                className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none"
                                                            >
                                                                <option value="Dayscholor">Day Scholar</option>
                                                                <option value="Hostler">Hostler</option>
                                                            </select>
                                                            {m.residenceType === 'Hostler' && (
                                                                <select
                                                                    value={m.hostelNumber}
                                                                    onChange={(e) => handleMemberChange(idx, 'hostelNumber', e.target.value)}
                                                                    className="bg-slate-950 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                                                >
                                                                    <option value="">Select Hostel</option>
                                                                    {['MH1', 'MH2', 'MH3', 'MH4', 'MH5', 'MH6', 'MH7', 'MH8', 'LH1', 'LH2', 'LH3', 'LH4', 'LH5'].map(h => (
                                                                        <option key={h} value={h}>{h}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}

                                            {settings?.maxMembers && members.length + 1 < settings.maxMembers && (
                                                <button
                                                    type="button" onClick={addMember}
                                                    className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-white hover:border-primary/50 transition-all font-bold text-sm flex items-center justify-center gap-2"
                                                >
                                                    + ADD MEMBER
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-4 pt-8">
                                            <button type="button" onClick={() => setStep(2)} className="px-8 py-5 rounded-2xl border border-white/5 text-slate-500 font-bold hover:text-white transition-all">BACK</button>
                                            <button
                                                type={"button"}
                                                onClick={() => settings.isPaidEvent ? setStep(3.5) : handleRegister({ preventDefault: () => { } } as any)}
                                                className="flex-1 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1"
                                            >
                                                {settings.isPaidEvent ? "PROCEED TO PAYMENT" : "REGISTER NOW"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3.5 && (
                                    <motion.div
                                        key="stepPayment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-2">
                                                <Banknote className="w-4 h-4 text-yellow-500" />
                                                <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">Payment Required</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-white">Payment Details</h2>
                                            <p className="text-slate-500 font-bold text-2xl mt-2 tracking-tighter">Amount: <span className="text-white">₹{settings.registrationFee}</span></p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 border-dashed">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <QrCode className="w-5 h-5 text-primary" />
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Payment Info</h3>
                                                </div>
                                                <div className="p-4 bg-white/[0.03] rounded-2xl space-y-2 border border-white/5">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UPI ID</p>
                                                    <p className="font-bold text-white text-lg tracking-wider">{settings.paymentDetails?.upiId || "EVENT@UPI"}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <ExternalLink className="w-5 h-5 text-accent" />
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Instructions</h3>
                                                </div>
                                                <ul className="text-[11px] text-slate-400 space-y-2 font-medium list-disc ml-4">
                                                    <li>Transfer amount via any UPI app</li>
                                                    <li>Capture screenshot of success</li>
                                                    <li>Paste Transaction ID below</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Transaction ID (TXN ID)</label>
                                            <input
                                                type="text" required placeholder="TXN-123456789"
                                                value={formData.paymentReference}
                                                onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                                                className="w-full bg-slate-900 border-2 border-primary/20 rounded-2xl py-5 px-6 text-white font-black text-xl text-center focus:outline-none focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setStep(3)} className="px-8 py-5 rounded-2xl border border-white/5 text-slate-500 font-bold hover:text-white transition-all">BACK</button>
                                            <button
                                                onClick={handleRegister} disabled={loading || !formData.paymentReference}
                                                className="flex-1 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all"
                                            >
                                                {loading ? <Loader2 className="animate-spin h-6 w-6 mx-auto" /> : "SUBMIT"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-12 space-y-8 h-full flex flex-col items-center justify-center"
                                    >
                                        <div className="relative">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1.2, opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute inset-0 bg-emerald-500 rounded-full"
                                            />
                                            <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center relative z-10 border border-emerald-500/30">
                                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black text-white">Registration Successful</h2>
                                            <p className="text-slate-400 text-lg max-w-sm mx-auto">You have successfully registered for the symposium.</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/login/team-leader')}
                                                className="px-12 py-5 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl transition-all shadow-xl"
                                            >
                                                Access Dashboard
                                            </button>
                                            {settings?.whatsappLink && (
                                                <a
                                                    href={settings.whatsappLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-12 py-5 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xl rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3"
                                                >
                                                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                    Join WhatsApp Group
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterTeam;
