import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import HealthRing from "@/components/HealthRing";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Timer, Leaf, Clock, TrendingUp, Sparkles, Activity, Droplets } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { fetchDashboardData, startWorkSession, endWorkSession, logBreak, getActiveSession, getRecentBreaks, WorkSession } from '@/lib/api';
import { generateWellnessSuggestion, WellnessSuggestion } from '@/lib/ai-suggestions';
import { toast } from "sonner";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { playVoiceAlert } from "@/lib/voice-alerts";

const tips = [
  "Stretch your shoulders and neck",
  "Look away from the screen for 20 seconds",
  "Take three deep breaths",
];

const DashboardSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6 mb-6">
    <GlassCard className="flex flex-col items-center justify-center py-8 md:col-span-1">
      <Skeleton className="w-[140px] h-[140px] rounded-full" />
      <Skeleton className="w-24 h-4 mt-4" />
    </GlassCard>
    <div className="md:col-span-2 grid grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <GlassCard key={i}>
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="w-20 h-3" />
          </div>
          <Skeleton className="w-16 h-6 mt-2" />
        </GlassCard>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ breaksToday: 0, dailyWorkHours: 0, waterBreaksToday: 0 });
  const [weeklyData, setWeeklyData] = useState<{day: string, hours: number}[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<WellnessSuggestion | null>(null);

  // Background Face Detection State
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null);
  const detachedRef = useRef<number>(0); // Timestamp when face was last seen
  const alertPlayedRef = useRef<boolean>(false);
  const checkIntervalRef = useRef<any>(null);
  const [faceStatus, setFaceStatus] = useState("Initializing Camera...");

  // Load MoveNet model once
  useEffect(() => {
    async function initModel() {
      try {
        await tf.ready();
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
        setModel(detector);
      } catch (err) {
        console.error("Failed to load MoveNet model for background detection", err);
      }
    }
    initModel();
  }, []);

  // Background face detection loop (runs only when a session is active)
  useEffect(() => {
    if (!activeSession || !model) {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    detachedRef.current = Date.now(); // Reset timer when session starts
    alertPlayedRef.current = false;

    const checkFace = async () => {
      if (!webcamRef.current || !webcamRef.current.video) {
        setFaceStatus("Camera not found");
        return;
      }
      const video = webcamRef.current.video;
      
      if (video.readyState !== 4) {
        setFaceStatus("Camera loading...");
        return;
      }

      try {
        const poses = await model.estimatePoses(video);
        let faceDetected = false;

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const nose = keypoints.find((k) => k.name === "nose");
          const leftEye = keypoints.find((k) => k.name === "left_eye");
          const rightEye = keypoints.find((k) => k.name === "right_eye");

          if ((nose?.score && nose.score > 0.3) && (leftEye?.score && leftEye.score > 0.3 || rightEye?.score && rightEye.score > 0.3)) {
             faceDetected = true;
          }
        }

        if (faceDetected) {
          detachedRef.current = Date.now(); // Reset the detach timer
          alertPlayedRef.current = false;
          setFaceStatus("Face Detected (Focused)");
        } else {
          const elapsed = Date.now() - detachedRef.current;
          setFaceStatus(`No Face Detected (${Math.floor(elapsed/1000)}s)`);

          // Check if detached for more than 15 seconds
          if (elapsed > 15000 && !alertPlayedRef.current) {
             alertPlayedRef.current = true;
             playVoiceAlert("Focus reminder. I cannot see you at the screen. Please return to your focus session.");
             toast.warning("Focus Interrupted", { description: "We couldn't detect your face. Don't lose your focus flow!" });
          }
        }
      } catch (e) {
        setFaceStatus("AI Error");
        console.warn("Background detection error", e);
      }
    };

    // Run extremely slowly to save performance (1 check every 2 seconds)
    checkIntervalRef.current = setInterval(checkFace, 2000);

    return () => clearInterval(checkIntervalRef.current);
  }, [activeSession, model]);

  const loadDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchDashboardData(user.id);
      setProfile(data.profile);
      setStats({
        breaksToday: data.breaksToday,
        dailyWorkHours: data.dailyWorkHours,
        waterBreaksToday: data.waterBreaksToday
      });
      setWeeklyData(data.weeklyActivity);
      const session = await getActiveSession(user.id);
      setActiveSession(session);

      // Generate AI Suggestion based on active session and history
      if (session) {
        const recentBreaks = await getRecentBreaks(user.id, 4); // breaks in last 4 hours
        const elapsedMinutes = (Date.now() - new Date(session.start_time).getTime()) / (1000 * 60);
        const suggestion = generateWellnessSuggestion(elapsedMinutes, recentBreaks);
        setAiSuggestion(suggestion);
      } else {
        setAiSuggestion(null);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error.message);
      toast.error('Failed to load your wellness data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStartSession = async () => {
    if (!user) return;
    try {
      const session = await startWorkSession(user.id);
      setActiveSession(session);
      toast.success('Focus session started!');
    } catch (e: any) {
      toast.error("Failed to start session: " + e.message);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession || !user) return;
    try {
      await endWorkSession(activeSession.id, user.id);
      setActiveSession(null);
      toast.success('Focus session completed. Great work!');
      loadDashboard();
    } catch (e: any) {
      toast.error("Failed to end session: " + e.message);
    }
  };

  const handleLogBreak = async (type: 'water' | 'stretch' | 'eye_rest' | 'breathe') => {
    if (!user || !activeSession) {
      toast.info('Start a focus session first to log breaks!');
      return;
    }
    try {
      await logBreak(user.id, activeSession.id, type);
      toast.success('Break logged! Well done.');
      loadDashboard();
    } catch (e: any) {
      toast.error("Failed to log break: " + e.message);
    }
  };

  const handleShowAiPopup = () => {
    if (aiSuggestion) {
      toast("AI Wellness Suggestion JSON", {
        description: (
          <pre className="mt-2 w-[300px] rounded-md bg-slate-950 p-4 text-xs text-white overflow-hidden text-wrap break-words">
            {JSON.stringify(aiSuggestion, null, 2)}
          </pre>
        ),
        duration: 10000,
        icon: <Sparkles className="text-yellow-500" />,
      });
    } else {
      toast.info("Start a session and wait a few minutes for a personalized AI suggestion.");
    }
  };

  return (
    <div className="gradient-radial-bg relative">
      <FloatingOrbs />
      <div className="relative z-10 container mx-auto py-6">
        <AppNav />

        {/* Small visible PIP camera during focus sessions */}
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 w-32 bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden z-50 flex flex-col"
          >
            <div className="bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider flex justify-between items-center">
               <span>Focus Cam</span>
               <div className={`w-2 h-2 rounded-full ${faceStatus.includes('Face Detected') ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
            </div>
            <Webcam
               ref={webcamRef}
               audio={false}
               className="w-full h-auto object-cover"
               videoConstraints={{ facingMode: "user", width: 160, height: 120 }} // ultra low res
               mirrored={true}
            />
            <div className="bg-slate-900 px-2 py-1.5 text-[10px] text-slate-400 text-center truncate">
               {faceStatus}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            {profile?.full_name ? `Good afternoon, ${profile.full_name}` : "Good afternoon"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's a quiet look at your day.</p>
        </motion.div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <GlassCard delay={0.2} className="flex flex-col items-center justify-center py-8 md:col-span-1">
              <HealthRing segments={5} filled={Math.min(5, Math.ceil((profile?.daily_health_score || 0) / 20))} size={140} />
              <p className="text-xs text-muted-foreground mt-4">Health Score: {profile?.daily_health_score || 0}</p>
            </GlassCard>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {[
                { icon: Timer, label: "Hours today", value: `${stats.dailyWorkHours}h`, color: "text-primary" },
                { icon: Clock, label: "Breaks taken", value: `${stats.breaksToday}`, color: "text-primary" },
                { icon: TrendingUp, label: "Status", value: activeSession ? "Working" : "Resting", color: activeSession ? "text-green-500" : "text-muted-foreground" },
                { icon: Leaf, label: "Wellness tip", value: tips[0], color: "text-muted-foreground", small: true },
              ].map((stat, i) => (
                <GlassCard key={stat.label} delay={0.3 + i * 0.1}>
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon size={18} className={stat.color} />
                    <span className="text-xs text-muted-foreground font-body">{stat.label}</span>
                  </div>
                  <p className={`font-display font-semibold text-foreground ${stat.small ? "text-xs font-normal" : "text-xl"}`}>
                    {stat.value}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Activity Chart */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6">
            <GlassCard>
              <h3 className="font-display font-semibold text-foreground mb-4">Weekly Activity</h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#818cf8', fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#818cf8' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.2)', 
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15)',
                        color: '#1e1b4b',
                        fontWeight: 600
                      }}
                      itemStyle={{ color: '#4f46e5' }}
                      formatter={(value: number) => [`${value} hrs`, 'Focused Time']}
                    />
                    <Bar 
                      dataKey="hours" 
                      radius={[6, 6, 6, 6]} 
                      animationDuration={1500} 
                      animationEasing="ease-out"
                    >
                      {weeklyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.hours > 0 ? "url(#barGradient)" : '#e0e7ff'} 
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Quick actions integrated with sessions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <GlassCard delay={0.6}>
            <h3 className="font-display font-semibold text-foreground mb-2">
              {activeSession ? "Active Session" : "Start a focus session"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeSession 
                ? "You're currently in a deep work session. Remember to take micro-breaks!" 
                : "25 minutes of deep work, then a gentle pause."}
            </p>
            {!activeSession ? (
              <button onClick={handleStartSession} className="btn-primary text-sm inline-block">
                Begin session
              </button>
            ) : (
              <button onClick={handleEndSession} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium">
                End Session
              </button>
            )}
          </GlassCard>

          <GlassCard delay={0.7}>
            <h3 className="font-display font-semibold text-foreground mb-2">Quick Log Break</h3>
            <p className="text-sm text-muted-foreground mb-4">Log a micro-activity instantly.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleLogBreak('water')} className="text-xs px-3 py-1.5 border rounded-full hover:bg-black/5 transition">
                💧 Water
              </button>
              <button onClick={() => handleLogBreak('eye_rest')} className="text-xs px-3 py-1.5 border rounded-full hover:bg-black/5 transition">
                👀 20-20-20
              </button>
              <button onClick={() => handleLogBreak('stretch')} className="text-xs px-3 py-1.5 border rounded-full hover:bg-black/5 transition">
                🧘 Stretch
              </button>
            </div>
          </GlassCard>

          {/* Hydration Tracker */}
          <GlassCard delay={0.75} className="sm:col-span-2 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="font-display font-semibold flex items-center gap-2 text-foreground">
                    <Droplets size={18} className="text-blue-500" /> Hydration Tracker
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Goal: 8 glasses a day</p>
               </div>
               <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
                 {stats.waterBreaksToday} <span className="text-sm font-normal text-muted-foreground">/ 8</span>
               </div>
            </div>
            
            <div className="flex justify-between items-end h-16 mt-2 relative z-10">
               {Array.from({ length: 8 }).map((_, i) => {
                 const isFilled = i < stats.waterBreaksToday;
                 return (
                   <motion.div 
                     key={i} 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 0.8 + i * 0.05 }}
                     onClick={() => handleLogBreak("water")}
                     className={`cursor-pointer group flex flex-col items-center justify-end w-8 h-full rounded-t-lg transition-all duration-300 ${isFilled ? 'bg-blue-100 hover:bg-blue-200' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'}`}
                   >
                     {isFilled && (
                       <motion.div 
                         initial={{ height: 0 }} 
                         animate={{ height: "100%" }} 
                         className="w-full bg-blue-500 rounded-t-lg rounded-b-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                       />
                     )}
                   </motion.div>
                 );
               })}
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">Click a glass to log water</p>
          </GlassCard>
        </div>

        {/* AI Suggestion Card */}
        {activeSession && aiSuggestion && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-4">
            <GlassCard className="border border-indigo-100/50 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/30">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
                    <h3 className="font-display font-semibold text-indigo-900 dark:text-indigo-100">AI Wellness Nudge</h3>
                  </div>
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{aiSuggestion.title}</p>
                  <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mb-2">{aiSuggestion.description}</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 italic flex items-center gap-1">
                    <Activity size={12}/> Reason: {aiSuggestion.reason}
                  </p>
                </div>
                <button 
                  onClick={handleShowAiPopup}
                  className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/80 transition rounded-md text-xs font-medium whitespace-nowrap"
                >
                  View JSON Popup
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
