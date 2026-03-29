import { useState, useEffect } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import {
    Plus,
    Calendar,
    Settings,
    Users,
    Trash2,
    Edit,
    Save,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Power,
    Target,
    CreditCard,
    Banknote,
    QrCode,
    ShieldCheck,
    Unlock,
    Lock
} from "lucide-react";
import { fetchApi, API_BASE_URL } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

export function EventsManagement() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        eventId: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        venue: '',
        settings: {
            eventStatus: 'Open',
            registrationType: 'Team',
            minMembers: 1,
            maxMembers: 5,
            isPaidEvent: false,
            registrationFee: 0,
            reviewersRequired: true,
            problemStatementsRequired: true,
            problemsReleased: false,
            whatsappLink: '',
            maxTeams: 100,
            maxParticipants: 500,
            paymentDetails: {
                upiId: '',
                bankName: '',
                accountNumber: '',
                ifscCode: '',
                qrCodeUrl: ''
            }
        }
    });
    const [clubLogo, setClubLogo] = useState<File | null>(null);
    const [eventPoster, setEventPoster] = useState<File | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await fetchApi("/admin/events");
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('eventId', formData.eventId);
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('venue', formData.venue);
            data.append('settings', JSON.stringify(formData.settings));

            if (clubLogo) data.append('clubLogo', clubLogo);
            if (eventPoster) data.append('eventPoster', eventPoster);

            const response = await fetch(`${API_BASE_URL}/admin/events`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-event-id': localStorage.getItem('selectedEventId') || ''
                },
                body: data
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server error: ${response.status}`);
            }

            setShowModal(false);
            setClubLogo(null);
            setEventPoster(null);
            loadEvents();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save event: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const quickUpdateSettings = async (event: any, key: string, value: any) => {
        try {
            const data = new FormData();
            data.append('eventId', event.eventId);
            data.append('name', event.name);
            data.append('description', event.description || '');
            data.append('venue', event.venue || '');
            const updatedSettings = { ...event.settings, [key]: value };
            data.append('settings', JSON.stringify(updatedSettings));

            const response = await fetch(`${API_BASE_URL}/admin/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-event-id': localStorage.getItem('selectedEventId') || ''
                },
                body: data
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to update setting');
            }
            loadEvents();
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this event and ALL its associated data (teams, users, scores)? This action CANNOT be undone.")) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to delete event');
            }
            if (localStorage.getItem('selectedEventId') === eventId) {
                localStorage.removeItem('selectedEventId');
                window.location.reload();
            }
            loadEvents();
        } catch (err: any) {
            console.error(err);
            alert(`Error deleting event: ${err.message}`);
        }
    };

    const openCreateModal = () => {
        setEditingEvent(null);
        setFormData({
            eventId: '',
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            venue: '',
            settings: {
                eventStatus: 'Open',
                registrationType: 'Team',
                minMembers: 1,
                maxMembers: 5,
                maxTeams: 100,
                maxParticipants: 500,
                isPaidEvent: false,
                registrationFee: 0,
                reviewersRequired: true,
                problemStatementsRequired: true,
                problemsReleased: false,
                whatsappLink: '',
                paymentDetails: {
                    upiId: '',
                    bankName: '',
                    accountNumber: '',
                    ifscCode: '',
                    qrCodeUrl: ''
                }
            }
        });
        setClubLogo(null);
        setEventPoster(null);
        setShowModal(true);
    };

    const openEditModal = (event: any) => {
        setEditingEvent(event);
        setFormData({
            eventId: event.eventId,
            name: event.name,
            description: event.description || '',
            startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
            endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
            venue: event.venue || '',
            settings: {
                paymentDetails: {
                    upiId: '', bankName: '', accountNumber: '', ifscCode: '', qrCodeUrl: ''
                },
                whatsappLink: '',
                problemsReleased: false,
                ...event.settings
            }
        });
        setShowModal(true);
    };

    const activeEvents = events.filter(e => e.settings?.eventStatus !== 'Completed');
    const pastEvents = events.filter(e => e.settings?.eventStatus === 'Completed');

    const EventCard = ({ event }: { event: any }) => (
        <motion.div
            key={event.eventId}
            layoutId={event.eventId}
            className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 hover:border-primary/30 transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    {event.clubLogo ? (
                        <img src={event.clubLogo} alt="Club Logo" className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                    ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-black text-white uppercase">{event.name}</h3>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID: {event.eventId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            localStorage.setItem('selectedEventId', event.eventId);
                            window.location.reload();
                        }}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg border transition-all ${localStorage.getItem('selectedEventId') === event.eventId
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-slate-800 text-slate-400 border-white/5 hover:text-white'
                            }`}
                    >
                        {localStorage.getItem('selectedEventId') === event.eventId ? 'ACTIVE DASHBOARD' : 'ACTIVATE DASHBOARD'}
                    </button>
                    <button
                        onClick={() => openEditModal(event)}
                        className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteEvent(event.eventId)}
                        className="p-2 bg-slate-800 rounded-lg text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        title="Delete Event"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {event.settings?.eventStatus !== 'Completed' && (
                        <button
                            onClick={() => quickUpdateSettings(event, 'eventStatus', 'Completed')}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                            EVENT COMPLETED
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm text-slate-400 line-clamp-2">{event.description || "No description provided."}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">VENUE: {event.venue || 'NOT SET'}</span>
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">TYPE: {event.settings?.registrationType || 'TEAM'}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 flex flex-col justify-between">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                    <select
                        value={event.settings?.eventStatus || 'Open'}
                        onChange={(e) => quickUpdateSettings(event, 'eventStatus', e.target.value)}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-md outline-none cursor-pointer appearance-none ${event.settings?.eventStatus === 'Open' ? 'bg-emerald-500/10 text-emerald-500' : event.settings?.eventStatus === 'Completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}
                    >
                        <option value="Open" className="bg-slate-900 text-emerald-500">OPEN</option>
                        <option value="Closed" className="bg-slate-900 text-red-500">CLOSED</option>
                        <option value="Completed" className="bg-slate-900 text-blue-500">COMPLETED</option>
                    </select>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Teams Limits</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-black text-white">{event.teamsCount || 0}</span>
                        <span className="text-slate-500 text-xs">/</span>
                        <input
                            type="number"
                            defaultValue={event.settings?.maxTeams || 100}
                            onBlur={(e) => quickUpdateSettings(event, 'maxTeams', parseInt(e.target.value, 10))}
                            className="bg-transparent text-sm font-black text-primary w-12 text-center outline-none border-b border-white/10 focus:border-primary px-0"
                            title="Max Teams"
                        />
                    </div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 text-center flex flex-col justify-between">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Person Limits</p>
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-black text-white">{event.participantsCount || 0}</span>
                        <span className="text-slate-500 text-xs">/</span>
                        <input
                            type="number"
                            defaultValue={event.settings?.maxParticipants || 500}
                            onBlur={(e) => quickUpdateSettings(event, 'maxParticipants', parseInt(e.target.value, 10))}
                            className="bg-transparent text-sm font-black text-primary w-12 text-center outline-none border-b border-white/10 focus:border-primary px-0"
                            title="Max Participants"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 space-y-3 border-t border-white/5">
                <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Registration Link</p>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                        <input
                            readOnly
                            value={`${window.location.origin}/register?eventId=${event.eventId}`}
                            className="bg-transparent text-[10px] text-primary flex-1 outline-none font-mono"
                        />
                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?eventId=${event.eventId}`); alert('Copied!') }} className="text-[8px] font-black text-white hover:text-primary transition-colors">COPY</button>
                    </div>
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Reviewer Link</p>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                        <input
                            readOnly
                            value={`${window.location.origin}/login/reviewer?eventId=${event.eventId}`}
                            className="bg-transparent text-[10px] text-blue-400 flex-1 outline-none font-mono"
                        />
                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/login/reviewer?eventId=${event.eventId}`); alert('Copied!') }} className="text-[8px] font-black text-white hover:text-blue-400 transition-colors">COPY</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Platform Management</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Manage multiple symposium events and their platform settings.</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                        <motion.div
                            key="events"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5 mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Events Portfolio</h3>
                                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Manage and orchestrate individual events</p>
                                </div>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black transition-all shadow-lg"
                                >
                                    <Plus className="w-5 h-5" /> CREATE NEW EVENT
                                </button>
                            </div>

                            <h3 className="text-xl font-black text-white/50 uppercase tracking-widest">Active Events</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeEvents.map((event) => <EventCard key={event.eventId} event={event} />)}
                            {activeEvents.length === 0 && (
                                <div className="md:col-span-2 py-10 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl text-slate-500">
                                    <AlertCircle className="w-8 h-8 opacity-20" />
                                    <h3 className="text-sm font-black text-white/40 uppercase">No Active Events</h3>
                                </div>
                            )}
                        </div>

                        {pastEvents.length > 0 && (
                            <div className="space-y-6 pt-12 border-t border-white/5">
                                <h3 className="text-xl font-black text-white/50 uppercase tracking-widest">Past Events</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {pastEvents.map((event) => <EventCard key={event.eventId} event={event} />)}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-card w-full max-w-2xl rounded-[2.5rem] p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <h3 className="text-2xl font-black text-white uppercase">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event ID (Unique)</label>
                                            <input
                                                type="text" required
                                                value={formData.eventId}
                                                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                                disabled={!!editingEvent}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 outline-none disabled:opacity-50"
                                                placeholder="e.g. hackathon-2026"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Name</label>
                                            <input
                                                type="text" required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 outline-none"
                                                placeholder="e.g. Global Tech Symposium"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venue</label>
                                            <input
                                                type="text"
                                                value={formData.venue}
                                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 outline-none"
                                                placeholder="e.g. Auditorium 1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registration Status</label>
                                            <select
                                                value={formData.settings.eventStatus}
                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, eventStatus: e.target.value } })}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold"
                                            >
                                                <option value="Open">OPEN</option>
                                                <option value="Closed">CLOSED</option>
                                                <option value="Completed">COMPLETED</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-primary/50 outline-none min-h-[80px]"
                                            placeholder="Event summary..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Club Logo</label>
                                            <input
                                                type="file" accept="image/*"
                                                onChange={(e) => setClubLogo(e.target.files?.[0] || null)}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-[10px]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Poster</label>
                                            <input
                                                type="file" accept="image/*"
                                                onChange={(e) => setEventPoster(e.target.files?.[0] || null)}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-[10px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                                        <div className={`space-y-2 ${formData.settings.registrationType === 'Single' ? 'opacity-50' : ''}`}>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Member Limits</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number" placeholder="Min"
                                                    value={formData.settings.registrationType === 'Single' ? 1 : formData.settings.minMembers}
                                                    disabled={formData.settings.registrationType === 'Single'}
                                                    onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, minMembers: parseInt(e.target.value) } })}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-primary/50 disabled:cursor-not-allowed"
                                                />
                                                <input
                                                    type="number" placeholder="Max"
                                                    value={formData.settings.registrationType === 'Single' ? 1 : formData.settings.maxMembers}
                                                    disabled={formData.settings.registrationType === 'Single'}
                                                    onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, maxMembers: parseInt(e.target.value) } })}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-primary/50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Limits</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number" placeholder="Max Teams"
                                                    value={formData.settings.registrationType === 'Single' ? '' : formData.settings.maxTeams}
                                                    disabled={formData.settings.registrationType === 'Single'}
                                                    onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, maxTeams: parseInt(e.target.value) } })}
                                                    title={formData.settings.registrationType === 'Single' ? "Not applicable for Single Registration" : "Max Teams"}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-primary/50 disabled:opacity-20 disabled:cursor-not-allowed"
                                                />
                                                <input
                                                    type="number" placeholder="Max Participants"
                                                    value={formData.settings.maxParticipants}
                                                    onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, maxParticipants: parseInt(e.target.value) } })}
                                                    title="Max Participants"
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-primary/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration Type</label>
                                            <select
                                                value={formData.settings.registrationType}
                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, registrationType: e.target.value } })}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-bold"
                                            >
                                                <option value="Team">TEAM REGISTRATION</option>
                                                <option value="Single">SINGLE REGISTRATION</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Power className="w-5 h-5 text-accent" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Event Lifecycle</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                <div>
                                                    <p className="font-bold text-white text-sm">Problem Statements Visibility</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Status: {formData.settings.problemsReleased ? 'VISIBLE' : 'HIDDEN'}</p>
                                                </div>
                                                <div
                                                    onClick={() => setFormData({ ...formData, settings: { ...formData.settings, problemsReleased: !formData.settings.problemsReleased } })}
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${formData.settings.problemsReleased ? 'bg-amber-500' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.settings.problemsReleased ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                <div>
                                                    <p className="font-bold text-white text-sm">Reviewers Needed</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Status: {formData.settings.reviewersRequired ? 'ENABLED' : 'DISABLED'}</p>
                                                </div>
                                                <div
                                                    onClick={() => setFormData({ ...formData, settings: { ...formData.settings, reviewersRequired: !formData.settings.reviewersRequired } })}
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${formData.settings.reviewersRequired ? 'bg-primary' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.settings.reviewersRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                                <div>
                                                    <p className="font-bold text-white text-sm">Problem Statements Needed</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Status: {formData.settings.problemStatementsRequired ? 'ENABLED' : 'DISABLED'}</p>
                                                </div>
                                                <div
                                                    onClick={() => setFormData({ ...formData, settings: { ...formData.settings, problemStatementsRequired: !formData.settings.problemStatementsRequired } })}
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${formData.settings.problemStatementsRequired ? 'bg-accent' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.settings.problemStatementsRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Target className="w-5 h-5 text-green-400" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Communication</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Group Link</label>
                                            <input
                                                type="url"
                                                placeholder="https://chat.whatsapp.com/..."
                                                value={formData.settings.whatsappLink || ''}
                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, whatsappLink: e.target.value } })}
                                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-green-400/50 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="w-5 h-5 text-cyan-400" />
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Payment Gateway</h3>
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-slate-500 font-bold max-w-sm pl-8">
                                                    If enabled, participants must upload payment proof after filling in their details. Following successful registration, they will see the WhatsApp Group link to join.
                                                </p>
                                            </div>
                                            <div
                                                onClick={() => setFormData({ ...formData, settings: { ...formData.settings, isPaidEvent: !formData.settings.isPaidEvent } })}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${formData.settings.isPaidEvent ? 'bg-cyan-500' : 'bg-slate-800'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.settings.isPaidEvent ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>

                                        {formData.settings.isPaidEvent ? (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration Fee (INR)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.settings.registrationFee}
                                                        onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, registrationFee: parseInt(e.target.value) } })}
                                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white font-black focus:border-cyan-500/50 outline-none"
                                                        placeholder="500"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <QrCode className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPI Details</span>
                                                        </div>
                                                        <input
                                                            type="text" placeholder="Enter UPI ID (e.g., name@okaxis)"
                                                            value={formData.settings.paymentDetails?.upiId || ''}
                                                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, paymentDetails: { ...formData.settings.paymentDetails, upiId: e.target.value } as any } })}
                                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500/50 outline-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Banknote className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Details</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <input
                                                                type="text" placeholder="Bank Name"
                                                                value={formData.settings.paymentDetails?.bankName || ''}
                                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, paymentDetails: { ...formData.settings.paymentDetails, bankName: e.target.value } as any } })}
                                                                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                                            />
                                                            <input
                                                                type="text" placeholder="Account Number"
                                                                value={formData.settings.paymentDetails?.accountNumber || ''}
                                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, paymentDetails: { ...formData.settings.paymentDetails, accountNumber: e.target.value } as any } })}
                                                                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                                            />
                                                            <input
                                                                type="text" placeholder="IFSC Code"
                                                                value={formData.settings.paymentDetails?.ifscCode || ''}
                                                                onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, paymentDetails: { ...formData.settings.paymentDetails, ifscCode: e.target.value } as any } })}
                                                                className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
                                                <ShieldCheck className="w-6 h-6 text-slate-700" />
                                                <p className="text-slate-500 text-xs font-medium italic">Event is currently set to Free Registration</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button" onClick={() => setShowModal(false)}
                                            className="px-8 py-4 rounded-xl border border-white/5 text-slate-500 font-black hover:text-white"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit" disabled={submitting}
                                            className="flex-1 bg-primary text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {editingEvent ? 'UPDATE EVENT' : 'CREATE EVENT'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
