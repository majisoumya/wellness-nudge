import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import { Camera, AlertTriangle, CheckCircle, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function PostureReminder() {
  const { session } = useAuth();
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [postureStatus, setPostureStatus] = useState<"Good" | "Slouching" | "Not Detected">("Not Detected");
  const [badPostureConsecutiveFrames, setBadPostureConsecutiveFrames] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const requestRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);

  const BAD_POSTURE_THRESHOLD = 6; // About 3 seconds at 2fps

  // Initialize model
  useEffect(() => {
    async function initModel() {
      try {
        await tf.ready();
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        setModel(detector);
        console.log("MoveNet model loaded");
      } catch (err) {
        console.error("Failed to load MoveNet model", err);
        toast.error("Failed to load posture detection model.");
      }
    }
    initModel();
    return () => {
      cancelAnimationFrame(requestRef.current || 0);
    };
  }, []);

  const detectPose = useCallback(async () => {
    if (!model || !webcamRef.current || !webcamRef.current.video) return;
    const video = webcamRef.current.video;
    
    // Ensure video is ready
    if (video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Throttle to 2 FPS to dramatically reduce system lag
    const now = Date.now();
    if (now - lastDetectionRef.current < 500) { // 500ms = 2 FPS
      requestRef.current = requestAnimationFrame(detectPose);
      return;
    }
    lastDetectionRef.current = now;

    try {
      const poses = await model.estimatePoses(video);
      
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const nose = keypoints.find((k) => k.name === "nose");
        const leftShoulder = keypoints.find((k) => k.name === "left_shoulder");
        const rightShoulder = keypoints.find((k) => k.name === "right_shoulder");
        const leftEye = keypoints.find((k) => k.name === "left_eye");
        const rightEye = keypoints.find((k) => k.name === "right_eye");

        // Basic heuristic: check confidence
        if (
          nose?.score && nose.score > 0.3 && 
          leftShoulder?.score && leftShoulder.score > 0.3 && 
          rightShoulder?.score && rightShoulder.score > 0.3
        ) {
          // Check shoulder balance (y-coordinates should be roughly similar)
          const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
          
          // Check nose alignment relative to shoulders (should be roughly centered)
          const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
          const noseOffset = Math.abs(nose.x - midShoulderX);
          
          // Check head tilt based on eyes
          let headTilt = 0;
          if (leftEye?.score && rightEye?.score && leftEye.score > 0.3 && rightEye.score > 0.3) {
             headTilt = Math.abs(leftEye.y - rightEye.y);
          }

          // These thresholds need calibration depending on camera distance
          const isSlouching = shoulderDiff > 40 || noseOffset > 60 || headTilt > 25;

          if (isSlouching) {
            setPostureStatus("Slouching");
            setBadPostureConsecutiveFrames((prev) => {
              const next = prev + 1;
              if (next === BAD_POSTURE_THRESHOLD) {
                // Play sound or alert
                toast.warning("Posture Check!", { description: "Sit up straight and relax your shoulders." });
                if (soundEnabled) {
                  // Play a simple beep
                  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = ctx.createOscillator();
                  osc.type = "sine";
                  osc.frequency.setValueAtTime(440, ctx.currentTime);
                  osc.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.2);
                }
                return 0; // Reset after alert
              }
              return next;
            });
          } else {
            setPostureStatus("Good");
            setBadPostureConsecutiveFrames(0);
          }
        } else {
           setPostureStatus("Not Detected");
        }
      } else {
         setPostureStatus("Not Detected");
      }
    } catch (e) {
      console.warn("Pose detection error", e);
    }
    
    if (isDetecting) {
      requestRef.current = requestAnimationFrame(detectPose);
    }
  }, [model, isDetecting, soundEnabled]);

  useEffect(() => {
    if (isDetecting) {
      requestRef.current = requestAnimationFrame(detectPose);
    } else {
      cancelAnimationFrame(requestRef.current || 0);
    }
    return () => cancelAnimationFrame(requestRef.current || 0);
  }, [isDetecting, detectPose]);

  return (
    <div className="gradient-radial-bg min-h-screen relative flex flex-col">
      <FloatingOrbs />
      <div className="relative z-10 container mx-auto py-6 flex-1 flex flex-col">
        <AppNav />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">AI Posture Reminder</h1>
            <p className="text-sm text-muted-foreground mt-1">Keep an eye on your posture in real-time.</p>
          </div>
          <button 
             onClick={() => setSoundEnabled(!soundEnabled)}
             className="p-2 rounded-full bg-secondary text-primary hover:bg-primary/20 transition-colors"
          >
             {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Camera View */}
          <GlassCard className="flex flex-col overflow-hidden h-full">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-display font-semibold flex items-center gap-2">
                 <Camera size={18} className="text-primary"/> Camera Feed
               </h3>
               {model ? (
                 <button
                    onClick={() => setIsDetecting(!isDetecting)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isDetecting ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-primary text-white hover:bg-primary/90'}`}
                 >
                    {isDetecting ? 'Stop Tracking' : 'Start Tracking'}
                 </button>
               ) : (
                 <span className="text-xs text-muted-foreground animate-pulse">Loading AI Model...</span>
               )}
            </div>
            <div className="flex-1 bg-black/5 rounded-xl border border-border/50 overflow-hidden relative flex items-center justify-center">
               <Webcam
                 ref={webcamRef}
                 audio={false}
                 className="w-full h-full object-cover"
                 videoConstraints={{ facingMode: "user", width: 320, height: 240 }}
                 mirrored={true}
               />
               {!isDetecting && (
                 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-sm text-muted-foreground font-medium">Tracking is paused.</p>
                 </div>
               )}
            </div>
          </GlassCard>

          {/* Status View */}
          <GlassCard className="flex flex-col justify-center items-center text-center p-8 space-y-6">
             <div className="relative">
                <div className={`absolute inset-0 blur-2xl rounded-full opacity-50 ${postureStatus === 'Good' ? 'bg-green-500' : postureStatus === 'Slouching' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center bg-background/80 backdrop-blur-md ${postureStatus === 'Good' ? 'border-green-500 text-green-500' : postureStatus === 'Slouching' ? 'border-red-500 text-red-500' : 'border-slate-400 text-slate-500'}`}>
                  {postureStatus === 'Good' && <CheckCircle size={48} />}
                  {postureStatus === 'Slouching' && <AlertTriangle size={48} />}
                  {postureStatus === 'Not Detected' && <Camera size={48} />}
                </div>
             </div>
             
             <div>
               <h2 className="font-display text-3xl font-bold mb-2">
                 {postureStatus}
               </h2>
               <p className="text-muted-foreground">
                 {postureStatus === 'Good' && "Great job! Keep your shoulders relaxed and back straight."}
                 {postureStatus === 'Slouching' && "Tension detected. Roll your shoulders back and adjust your screen."}
                 {postureStatus === 'Not Detected' && "Position yourself clearly in the camera frame."}
               </p>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
