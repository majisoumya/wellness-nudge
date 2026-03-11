import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";
import { useAuth } from "@/hooks/use-auth";
import { startWorkSession, endWorkSession, logBreak, WorkSession } from "@/lib/api";
import { toast } from "sonner";

const BreathCircle = () => (
  <motion.div className="flex items-center justify-center h-64">
    <motion.div
      className="rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, rgba(124,58,237,0.1) 60%, transparent 70%)",
        width: 160,
        height: 160,
      }}
      animate={{
        scale: [1, 1.35, 1.35, 1],
        opacity: [0.6, 1, 1, 0.6],
      }}
      transition={{
        duration: 11,
        repeat: Infinity,
        times: [0, 0.36, 0.45, 1],
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface WorkTimerProps {
  workMinutes?: number;
  breakMinutes?: number;
}

const WorkTimerWidget = ({ workMinutes = 25, breakMinutes = 5 }: WorkTimerProps) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Track the actual Supabase session
  const [dbSession, setDbSession] = useState<WorkSession | null>(null);
  
  // Track elapsed time carefully for the 25-minute trigger
  const elapsedRef = useRef(0);

  const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 110;

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        if (!isBreak) {
          // Transition from Work to Break
          setIsBreak(true);
          setTimeLeft(breakMinutes * 60);
          setSessionsCompleted((p) => p + 1);
          elapsedRef.current = 0; // reset elapsed

          // The global useWellnessTracker hook will handle the actual alert notification
          // but we still do the UI transition locally here for the Break Screen.

        } else {
          // Transition from Break to Work (End of break)
          setIsBreak(false);
          setTimeLeft(workMinutes * 60);
          setIsRunning(false);
          
          // If we want to automatically close the supabase session after the break, we could do it here,
          // but usually users want to manually end their whole block of working.
          if (user && dbSession) {
             // Let's log that they successfully finished a break.
             logBreak(user.id, dbSession.id, 'other', breakMinutes * 60).catch(console.error);
             toast.success("Break completed. Ready to focus again?");
          }
        }
      }
      return;
    }
    
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
      if (!isBreak) elapsedRef.current += 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, breakMinutes, workMinutes, dbSession, user]);

  const handleToggle = async () => {
    if (!user) {
      toast.error("You must be logged in to track sessions.");
      return;
    }

    // Start
    if (!isRunning) {
      setIsRunning(true);
      if (!isBreak && !dbSession) {
         try {
           const newSession = await startWorkSession(user.id);
           setDbSession(newSession);
           toast.success("Work session started!");
         } catch(e: any) {
           console.error(e);
           toast.error("Failed to sync session to database.");
         }
      }
    } else {
      // Pause
      setIsRunning(false);
    }
  };

  const handleEndSession = async () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    elapsedRef.current = 0;

    if (dbSession) {
      try {
        await endWorkSession(dbSession.id);
        setDbSession(null);
        toast.success("Work session ended and saved.");
      } catch (e: any) {
        console.error(e);
        toast.error("Failed to end session in database.");
      }
    }
  };

  return (
    <GlassCard className="max-w-md mx-auto text-center" hover={false}>
      <AnimatePresence mode="wait">
        {isBreak ? (
          <motion.div
            key="breath"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-display text-lg font-medium mb-2 text-foreground">Time to breathe</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-subtle)" }}>
              Follow the circle. Stretch your neck and rest your eyes.
            </p>
            <BreathCircle />
            <p className="text-xs mt-2 font-display text-3xl font-light text-foreground tracking-wider mb-6">
              {formatTime(timeLeft)}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsRunning(!isRunning)} className="btn-primary px-8">
                {isRunning ? "Pause Break" : "Resume Break"}
              </button>
              <button onClick={handleEndSession} className="btn-ghost text-red-600 hover:bg-red-50">
                End Session
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="work"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-display text-lg font-medium mb-6 text-foreground">
              {isRunning ? "Deep in focus" : "Ready to focus?"}
            </h3>

            <div className="relative inline-flex items-center justify-center mb-6" style={{ perspective: "600px" }}>
              <motion.svg
                width="240"
                height="240"
                className="transform -rotate-90"
                animate={{ rotateY: isRunning ? [0, 2, -2, 0] : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(79,70,229,0.1)" strokeWidth="6" />
                <motion.circle
                  cx="120"
                  cy="120"
                  r="110"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  initial={false}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: 0.5 }}
                />
              </motion.svg>
              <span className="absolute font-display text-4xl font-light tracking-wider text-foreground">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={handleToggle} className="btn-primary px-8">
                {isRunning ? "Pause" : (dbSession ? "Resume" : "Start")}
              </button>
              {dbSession && (
                <button onClick={handleEndSession} className="btn-ghost text-red-600 hover:bg-red-50">
                  End
                </button>
              )}
            </div>
            <p className="text-xs mt-4" style={{ color: "var(--text-subtle)" }}>
              Sessions completed today: {sessionsCompleted}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default WorkTimerWidget;
