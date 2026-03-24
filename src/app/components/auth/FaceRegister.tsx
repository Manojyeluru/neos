import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import * as faceapi from 'face-api.js';
import { motion } from "framer-motion";
import { Camera, CheckCircle, ShieldCheck, Loader2 } from "lucide-react";
import { fetchApi } from "../../utils/api";

export function FaceRegister() {
    const [searchParams] = useSearchParams();
    const teamId = searchParams.get('teamId') || '';
    const email = searchParams.get('email') || '';

    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "success" | "error">("loading");
    const statusRef = useRef(status);
    useEffect(() => { statusRef.current = status; }, [status]);

    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Initializing models...");
    
    // Store captured descriptors
    const descriptorsRef = useRef<Float32Array[]>([]);

    useEffect(() => {
        if (!teamId || !email) {
            setStatus("error");
            setMessage("Invalid registration link. Missing team or email parameters.");
            return;
        }

        const loadModels = async () => {
            try {
                // Load from a reliable CDN
                const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                startVideo();
            } catch (err) {
                console.error("Model load error", err);
                setStatus("error");
                setMessage("Failed to load facial recognition models. Please try again.");
            }
        };
        loadModels();
    }, [teamId, email]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus("ready");
                    setMessage("Position your face in the frame and click Start Capture.");
                }
            })
            .catch((err) => {
                console.error("Webcam error:", err);
                setStatus("error");
                setMessage("Camera access denied or device not found.");
            });
    };

    const handleStartCapture = async () => {
        if (!videoRef.current || status !== "ready") return;
        setStatus("capturing");
        setMessage("Taking 8 scans. Please move your head slightly...");
        
        let count = 0;
        const totalScans = 8;
        descriptorsRef.current = [];

        const captureInterval = setInterval(async () => {
            if (count >= totalScans || statusRef.current === "error") {
                clearInterval(captureInterval);
                if (count >= totalScans) {
                    finalizeRegistration();
                }
                return;
            }

            if (videoRef.current) {
                const detection = await faceapi.detectSingleFace(videoRef.current)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    descriptorsRef.current.push(detection.descriptor);
                    count++;
                    setProgress(Math.round((count / totalScans) * 100));
                    setMessage(`Scan ${count} of ${totalScans} captured...`);
                } else {
                    setMessage("No face detected. Please face the camera.");
                }
            }
        }, 1000); // Capture every 1 second
    };

    const finalizeRegistration = async () => {
        setStatus("loading");
        setMessage("Uploading Face ID to secure vault...");
        try {
            // Convert Float32Array to standard array for JSON transport
            const serializedDescriptors = descriptorsRef.current.map(d => Array.from(d));

            await fetchApi("/attendance/register-face", {
                method: "POST",
                body: JSON.stringify({
                    teamId,
                    email,
                    descriptors: serializedDescriptors
                })
            });

            // Stop webcam
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }

            setStatus("success");
            setMessage("Face ID securely registered! You are ready for the event.");
        } catch (err: any) {
            console.error("Registration error:", err);
            setStatus("error");
            setMessage(err.message || "Failed to upload Face ID. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-primary selection:text-white pb-32">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="text-center space-y-2 mb-8 relative z-10">
                    <div className="mx-auto w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4 border border-primary/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Face ID <span className="text-primary">Scanner</span></h1>
                    <p className="text-slate-400 text-xs font-bold w-3/4 mx-auto leading-relaxed">
                        Securely register your biometric identity for instant attendance at the technical symposium.
                    </p>
                </div>

                {status !== "success" && (
                     <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                         <video 
                             ref={videoRef} 
                             autoPlay 
                             muted 
                             playsInline 
                             className="w-full h-full object-cover mirror"
                             style={{ transform: "scaleX(-1)" }} // mirror video
                         />
                         
                         {(status === "loading" || status === "error") && (
                             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
                                 {status === "loading" ? (
                                     <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                                 ) : (
                                     <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-3">
                                         <ShieldCheck className="w-5 h-5" />
                                     </div>
                                 )}
                                 <p className={`text-sm font-bold ${status === 'error' ? 'text-red-400' : 'text-primary'}`}>{message}</p>
                             </div>
                         )}

                         {status === "capturing" && (
                             <div className="absolute inset-0 border-4 border-primary/50 rounded-2xl animate-pulse pointer-events-none z-10 box-border">
                                 <div className="absolute top-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-xl p-2 flex items-center justify-center gap-3">
                                     <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                         <motion.div 
                                             className="h-full bg-primary"
                                             animate={{ width: `${progress}%` }}
                                             transition={{ duration: 0.3 }}
                                         />
                                     </div>
                                     <span className="text-xs font-black text-primary uppercase">{progress}%</span>
                                 </div>
                             </div>
                         )}
                     </div>
                )}

                {status === "success" && (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-10"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-black text-emerald-500 uppercase tracking-widest mb-2">Registration Complete</h2>
                        <p className="text-center text-emerald-400/80 text-sm font-bold w-4/5">
                            {message}
                        </p>
                    </motion.div>
                )}

                {status === "ready" && (
                    <div className="mt-8">
                        <p className="text-center text-slate-400 text-xs font-bold mb-4 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                            {message}
                        </p>
                        <button 
                            onClick={handleStartCapture}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" /> Start 8-Point Capture
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
