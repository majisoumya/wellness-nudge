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
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    whileHover={hover ? { y: -4, boxShadow: "0 16px 40px rgba(79, 70, 229, 0.12)" } : undefined}
    className={`glass-panel p-6 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
