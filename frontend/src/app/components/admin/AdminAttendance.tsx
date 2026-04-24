import { useState, useRef, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, Clock, Search, List, ShieldCheck, X } from "lucide-react";
import { fetchApi } from "../../utils/api";

type FaceProfile = {
    label: string;
    name: string;
    regNo: string;
    descriptors: number[][]; // float32 arrays sent as json
};

export function AdminAttendance() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [status, setStatus] = useState<"idle" | "loading" | "active" | "error">("idle");
    const [duration, setDuration] = useState(60); // minutes
    const [message, setMessage] = useState("");
    const [profiles, setProfiles] = useState<FaceProfile[]>([]);
    const faceMatcher = useRef<faceapi.FaceMatcher | null>(null);

    const [stats, setStats] = useState({ present: [] as any[], absent: [] as any[] });
    const intervalRef = useRef<any>(null);

    const [manualRegNo, setManualRegNo] = useState("");

    useEffect(() => {
        refreshStats();
    }, []);

    const refreshStats = async () => {
        try {
            const data = await fetchApi('/attendance/list');
            setStats(data);
        } catch (err) { }
    };

    const loadModelsAndFaces = async () => {
        setStatus("loading");
        setMessage("Downloading Face-API models and profiles...");
        try {
            const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);

            const faces: FaceProfile[] = await fetchApi('/attendance/faces');
            setProfiles(faces);

            if (faces.length > 0) {
                const labeledDescriptors = faces.map(f => {
                    const descriptors = f.descriptors.map(d => new Float32Array(d));
                    return new faceapi.LabeledFaceDescriptors(f.label, descriptors);
                });
                faceMatcher.current = new faceapi.FaceMatcher(labeledDescriptors, 0.5);
            }

            setStatus("idle");
            setMessage("Systems ready.");
        } catch (err: any) {
            console.error(err);
            setStatus("error");
            setMessage("Failed to load models or faces.");
        }
    };

    const toggleWindow = async (action: 'start' | 'stop') => {
        if (action === 'start' && profiles.length === 0) {
            await loadModelsAndFaces();
        }

        try {
            await fetchApi('/attendance/toggle-window', {
                method: "POST",
                body: JSON.stringify({ action, durationMinutes: duration })
            });

            if (action === "start") {
                startVideo();
            } else {
                stopStream();
                refreshStats();
            }
        } catch (err: any) {
            setMessage(err.message);
        }
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus("active");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Could not access camera for monitoring.");
            });
    };

    const stopStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        clearInterval(intervalRef.current);
        setStatus("idle");
        setMessage("Attendance window closed.");
    };

    const handleVideoPlay = () => {
        if (status !== 'active' || !faceMatcher.current || !videoRef.current || !canvasRef.current) return;

        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        intervalRef.current = setInterval(async () => {
            if (videoRef.current && canvasRef.current && status === 'active') {
                const detections = await faceapi.detectAllFaces(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

                const detectedEmails: string[] = [];

                const results = resizedDetections.map(d => {
                    const bestMatch = faceMatcher.current!.findBestMatch(d.descriptor);
                    if (bestMatch.label !== 'unknown') {
                        detectedEmails.push(bestMatch.label);
                    }
                    return bestMatch;
                });

                results.forEach((result, i) => {
                    const box = resizedDetections[i].detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, { label: result.label === 'unknown' ? 'Unrecognized' : 'Match Found' });
                    drawBox.draw(canvasRef.current!);
                });

                if (detectedEmails.length > 0) {
                    // Sync up with backend silently
                    fetchApi('/attendance/bulk-face-checkin', {
                        method: 'POST',
                        body: JSON.stringify({ emails: detectedEmails })
                    }).then(() => refreshStats()).catch(() => {});
                }
            }
        }, 3000); // Check every 3 seconds to save CPU
    };

    const runManualScan = async () => {
        if (!faceMatcher.current || !videoRef.current || !canvasRef.current) return;
        
        setMessage("Scanning face patterns...");
        const detections = await faceapi.detectAllFaces(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        const detectedEmails: string[] = [];
        resizedDetections.forEach(d => {
            const bestMatch = faceMatcher.current!.findBestMatch(d.descriptor);
            if (bestMatch.label !== 'unknown') {
                detectedEmails.push(bestMatch.label);
                const box = d.detection.box;
                new faceapi.draw.DrawBox(box, { label: 'MATCH: ' + bestMatch.label }).draw(canvasRef.current!);
            }
        });

        if (detectedEmails.length > 0) {
            await fetchApi('/attendance/bulk-face-checkin', {
                method: 'POST',
                body: JSON.stringify({ emails: detectedEmails })
            });
            refreshStats();
            setMessage(`${detectedEmails.length} participants identified!`);
        } else {
            setMessage("No recognized faces found in frame.");
        }
    };

    const handleManualCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchApi('/attendance/manual-toggle-status', {
                method: "POST",
                body: JSON.stringify({ regNo: manualRegNo, status: true })
            });
            setManualRegNo("");
            refreshStats();
            setMessage("Manually verified: " + manualRegNo);
        } catch (err: any) {
            alert(err.message || "Manual check-in failed.");
        }
    };

    const toggleStatus = async (regNo: string, currentStatus: boolean) => {
        try {
            await fetchApi('/attendance/manual-toggle-status', {
                method: "POST",
                body: JSON.stringify({ regNo, status: !currentStatus })
            });
            refreshStats();
        } catch (err: any) {
            alert(err.message || "Failed to update status.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-inner">
                <div>
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                        Systems Operation
                    </h2>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                        Attendance Monitor
                    </h1>
                </div>
                <div className="flex gap-4 items-center">
                    {status !== 'active' && (
                        <div className="flex items-center gap-3">
                            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Window (Mins)</label>
                            <input 
                                type="number" 
                                value={duration} 
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-20 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                            />
                            <button 
                                onClick={() => toggleWindow('start')}
                                disabled={status === 'loading'}
                                className="formal-btn bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 font-black uppercase tracking-widest text-[10px] rounded-xl px-6 flex items-center gap-2"
                            >
                                {status === 'loading' ? 'Loading AI...' : 'START STREAM'} <Camera className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {status === 'active' && (
                        <button 
                            onClick={() => toggleWindow('stop')}
                            className="formal-btn bg-red-500/20 text-red-500 hover:bg-red-500/30 font-black uppercase tracking-widest text-[10px] rounded-xl px-6 flex items-center gap-2"
                        >
                            STOP STREAM <X className="w-3 h-3" />
                        </button>
                    )}
                    {status === 'active' && (
                        <button 
                            onClick={runManualScan}
                            className="formal-btn bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-xl px-6 flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            SCAN NOW <Camera className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-primary" /> Live Feed Interface
                        </span>
                        <span className="text-xs font-mono text-slate-400">FPS: 30 / DL: SSD_MOBILENET</span>
                    </div>

                    <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-white/5 shadow-inner relative flex items-center justify-center">
                        {status === 'active' ? (
                            <>
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    onPlay={handleVideoPlay}
                                    width={720} 
                                    height={405}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <canvas 
                                    ref={canvasRef} 
                                    className="absolute inset-0 w-full h-full pointer-events-none" 
                                />
                            </>
                        ) : (
                            <div className="text-slate-600 flex flex-col items-center">
                                <Camera className="w-12 h-12 mb-3 opacity-50" />
                                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Stream Inactive</span>
                                <span className="text-xs font-bold mt-2 opacity-60 max-w-xs text-center">{message || "Deploy window to begin facial geometry tracking."}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Search className="w-3 h-3 text-yellow-500" /> Manual Override
                        </h3>
                        <form onSubmit={handleManualCheckIn} className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="Enter Reg. Number"
                                value={manualRegNo}
                                onChange={(e) => setManualRegNo(e.target.value)}
                                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:border-yellow-500/50 outline-none"
                            />
                            <button 
                                type="submit"
                                className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 font-black uppercase tracking-widest text-[9px] px-4 rounded-xl transition-colors"
                            >
                                Verify
                            </button>
                        </form>
                    </div>

                    <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                Network Check-In ({stats.present.length})
                            </h3>
                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                MIA ({stats.absent.length})
                            </h3>
                        </div>

                        <div className="overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
                            {stats.present.map((p, i) => (
                                <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex justify-between items-center group">
                                    <div>
                                        <p className="text-emerald-400 font-bold text-xs">{p.name}</p>
                                        <p className="text-emerald-500/60 font-mono text-[9px]">{p.regNo}</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleStatus(p.regNo, true)}
                                        title="Mark as Absent"
                                        className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-red-500 hover:text-white transition-all shadow-inner"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {stats.absent.map((p, i) => (
                                <div key={i} className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex justify-between items-center group opacity-80">
                                    <div>
                                        <p className="text-red-400 font-bold text-xs">{p.name}</p>
                                        <p className="text-red-500/60 font-mono text-[9px]">{p.regNo}</p>
                                    </div>
                                    <button 
                                        onClick={() => toggleStatus(p.regNo, false)}
                                        title="Mark as Present"
                                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-emerald-500 hover:text-white transition-all shadow-inner"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {stats.present.length === 0 && stats.absent.length === 0 && (
                                <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic py-4">No profiles found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
