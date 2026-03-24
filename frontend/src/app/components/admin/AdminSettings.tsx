import { useState, useEffect } from "react";

import {
    Settings,
    Power,
    Users,
    CreditCard,
    QrCode,
    Save,
    Loader2,
    ShieldCheck,
    Banknote,
    Lock,
    Unlock,
    Target
} from "lucide-react";
import { fetchApi } from "../../utils/api";
import { motion } from "framer-motion";

export function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        eventStatus: 'Open',
        problemsReleased: false,
        totalRounds: 3,
        minMembers: 1,
        maxMembers: 5,
        isPaidEvent: false,
        registrationFee: 0,
        reviewersRequired: true,
        problemStatementsRequired: true,
        whatsappLink: '',
        paymentDetails: {
            upiId: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            qrCodeUrl: ''
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await fetchApi("/admin/settings");
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await fetchApi("/admin/settings", {
                method: "POST",
                body: JSON.stringify(settings)
            });
            alert("Settings updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update settings");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-2"
                >
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">General Settings</h2>
                        <p className="text-slate-400 text-sm">Configure event rules, team size, and payments.</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Event Lifecycle & Team Constraints */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-6 rounded-2xl space-y-4"
                        >
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Power className="w-5 h-5 text-accent" />
                                Event Lifecycle
                            </h3>

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <div>
                                    <p className="font-bold text-white italic tracking-tight">Problem Statements Visibility</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                        Status: {settings.problemsReleased ? 'VISIBLE' : 'HIDDEN'}
                                    </p>
                                </div>
                                <div
                                    onClick={() => setSettings({ ...settings, problemsReleased: !settings.problemsReleased })}
                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${settings.problemsReleased ? 'bg-amber-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.problemsReleased ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <div>
                                    <p className="font-bold text-white">Registration Status</p>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">
                                        Current: {settings.eventStatus}
                                    </p>
                                </div>
                                <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
                                    <button
                                        onClick={() => setSettings({ ...settings, eventStatus: 'Open' })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${settings.eventStatus === 'Open' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Unlock className="w-3 h-3" /> OPEN
                                    </button>
                                    <button
                                        onClick={() => setSettings({ ...settings, eventStatus: 'Closed' })}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${settings.eventStatus === 'Closed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        <Lock className="w-3 h-3" /> CLOSED
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <div>
                                    <p className="font-bold text-white italic tracking-tight">Reviewers Needed</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                        Status: {settings.reviewersRequired ? 'ENABLED' : 'DISABLED'}
                                    </p>
                                </div>
                                <div
                                    onClick={() => setSettings({ ...settings, reviewersRequired: !settings.reviewersRequired })}
                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${settings.reviewersRequired ? 'bg-primary' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.reviewersRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <div>
                                    <p className="font-bold text-white italic tracking-tight">Problem Statements Needed</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                        Status: {settings.problemStatementsRequired ? 'ENABLED' : 'DISABLED'}
                                    </p>
                                </div>
                                <div
                                    onClick={() => setSettings({ ...settings, problemStatementsRequired: !settings.problemStatementsRequired })}
                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${settings.problemStatementsRequired ? 'bg-accent' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.problemStatementsRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>



                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Users className="w-5 h-5 text-primary" />
                                    Team Constraints
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Minimum Members</label>
                                        <input
                                            type="number"
                                            value={settings.minMembers}
                                            onChange={(e) => setSettings({ ...settings, minMembers: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Maximum Members</label>
                                        <input
                                            type="number"
                                            value={settings.maxMembers}
                                            onChange={(e) => setSettings({ ...settings, maxMembers: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Target className="w-5 h-5 text-green-400" />
                                    Communication
                                </h3>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Group Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://chat.whatsapp.com/..."
                                        value={settings.whatsappLink || ''}
                                        onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-green-400/50"
                                    />
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 italic px-1">URL to be sent to registrants.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Payment Gateway Configurations */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-8 rounded-3xl space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-cyan-400" />
                                    Payment Gateway
                                </h3>
                                <div
                                    onClick={() => setSettings({ ...settings, isPaidEvent: !settings.isPaidEvent })}
                                    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${settings.isPaidEvent ? 'bg-cyan-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.isPaidEvent ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {settings.isPaidEvent ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Registration Fee (INR)</label>
                                        <input
                                            type="number"
                                            value={settings.registrationFee}
                                            onChange={(e) => setSettings({ ...settings, registrationFee: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 pt-4">
                                        <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <QrCode className="w-4 h-4 text-cyan-400" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">UPI Details</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter UPI ID (e.g., name@okaxis)"
                                                value={settings.paymentDetails.upiId}
                                                onChange={(e) => setSettings({ ...settings, paymentDetails: { ...settings.paymentDetails, upiId: e.target.value } })}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                            />
                                        </div>

                                        <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Banknote className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank Details</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    type="text" placeholder="Bank Name"
                                                    value={settings.paymentDetails.bankName}
                                                    onChange={(e) => setSettings({ ...settings, paymentDetails: { ...settings.paymentDetails, bankName: e.target.value } })}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                                />
                                                <input
                                                    type="text" placeholder="Account Number"
                                                    value={settings.paymentDetails.accountNumber}
                                                    onChange={(e) => setSettings({ ...settings, paymentDetails: { ...settings.paymentDetails, accountNumber: e.target.value } })}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                                />
                                                <input
                                                    type="text" placeholder="IFSC Code"
                                                    value={settings.paymentDetails.ifscCode}
                                                    onChange={(e) => setSettings({ ...settings, paymentDetails: { ...settings.paymentDetails, ifscCode: e.target.value } })}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                                    <ShieldCheck className="w-10 h-10 text-slate-700" />
                                    <p className="text-slate-500 font-medium italic">Event is currently set to Free Registration</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end pt-4"
                >
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="group flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Settings</span>
                    </button>
                </motion.div>
        </div>
        </div>
    );
}

export default AdminSettings;
