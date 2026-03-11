import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";

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

const WorkTimer = ({ workMinutes = 25, breakMinutes = 5 }: WorkTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = 1 - timeLeft / totalTime;
  const circumference = 2 * Math.PI * 110;

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        if (!isBreak) {
          setIsBreak(true);
          setTimeLeft(breakMinutes * 60);
          setSessionsCompleted((p) => p + 1);
        } else {
          setIsBreak(false);
          setTimeLeft(workMinutes * 60);
          setIsRunning(false);
        }
      }
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, breakMinutes, workMinutes]);

  const handleToggle = useCallback(() => setIsRunning((r) => !r), []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  }, [workMinutes]);

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
              Follow the circle. No numbers needed.
            </p>
            <BreathCircle />
            <p className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>
              Break ends in {formatTime(timeLeft)}
            </p>
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
                {isRunning ? "Pause" : "Start Session"}
              </button>
              {isRunning && (
                <button onClick={handleReset} className="btn-ghost">
                  Reset
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

export default WorkTimer;
