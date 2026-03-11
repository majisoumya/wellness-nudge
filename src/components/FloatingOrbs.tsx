import { motion } from "framer-motion";

const FloatingOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div
      className="absolute w-72 h-72 rounded-full opacity-30"
      style={{ background: "radial-gradient(circle, #E6E9F2, transparent 70%)", top: "10%", left: "5%" }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-96 h-96 rounded-full opacity-20"
      style={{ background: "radial-gradient(circle, #F5EEF8, transparent 70%)", top: "40%", right: "-5%" }}
      animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-64 h-64 rounded-full opacity-25"
      style={{ background: "radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)", bottom: "10%", left: "30%" }}
      animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default FloatingOrbs;
