import { useState, useRef, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { motion } from "framer-motion";
import { Camera, ShieldCheck, Loader2, CheckCircle } from "lucide-react";

interface FaceScannerProps {
    onComplete: (descriptors: number[][]) => void;
    label?: string;
}

export function FaceScanner({ onComplete, label = "Team Leader" }: FaceScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "success" | "error">("loading");
    const statusRef = useRef(status);
    useEffect(() => { statusRef.current = status; }, [status]);

    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Initializing models...");
    
    const descriptorsRef = useRef<Float32Array[]>([]);

    useEffect(() => {
        const loadModels = async () => {
            try {
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
                setMessage("Failed to load facial recognition models.");
            }
        };
        loadModels();

        return () => {
            stopVideo();
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus("ready");
                    setMessage("Position your face in the frame.");
                }
            })
            .catch((err) => {
                console.error("Webcam error:", err);
                setStatus("error");
                setMessage("Camera access denied.");
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
    };

    const handleStartCapture = async () => {
        if (!videoRef.current || status !== "ready") return;
        setStatus("capturing");
        
        let count = 0;
        const totalScans = 8;
        descriptorsRef.current = [];

        const captureInterval = setInterval(async () => {
            if (count >= totalScans || statusRef.current === "error") {
                clearInterval(captureInterval);
                if (count >= totalScans) {
                    const serializedDescriptors = descriptorsRef.current.map(d => Array.from(d));
                    setStatus("success");
                    onComplete(serializedDescriptors);
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
                    setMessage(`Scanning: ${count}/${totalScans}`);
                } else {
                    setMessage("No face detected.");
                }
            }
        }, 800);
    };

    return (
        <div className="space-y-4">
            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                />
                
                {(status === "loading" || status === "error") && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
                        {status === "loading" ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                        ) : (
                            <ShieldCheck className="w-8 h-8 text-red-500 mb-3" />
                        )}
                        <p className={`text-xs font-bold ${status === 'error' ? 'text-red-400' : 'text-primary'}`}>{message}</p>
                    </div>
                )}

                {status === "capturing" && (
                    <div className="absolute inset-0 border-4 border-primary/50 rounded-2xl animate-pulse pointer-events-none z-10 box-border">
                        <div className="absolute top-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-xl p-2 flex items-center justify-center gap-3">
                            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-primary"
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase">{progress}%</span>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Face ID Captured</span>
                    </div>
                )}
            </div>

            {status === "ready" && (
                <button 
                    type="button"
                    onClick={handleStartCapture}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                    <Camera className="w-4 h-4" /> Start Face Registration
                </button>
            )}
            
            {status === "capturing" && (
                <p className="text-center text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
}
