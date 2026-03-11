import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const GlassCard = ({ children, className = "", delay = 0, hover = true }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} // smooth spring
    whileHover={hover ? { 
      y: -6, 
      scale: 1.02,
      boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.5)"
    } : undefined}
    className={`relative overflow-hidden glass-panel p-6 transition-all duration-300 border border-white/20 bg-white/40 backdrop-blur-xl rounded-2xl ${className}`}
  >
    {/* Subtle inner top highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-50 pointer-events-none" />
    
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

export default GlassCard;
