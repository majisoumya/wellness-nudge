import { motion } from "framer-motion";

const Orb3D = () => (
  <div className="relative" style={{ perspective: "800px" }}>
    <motion.div
      className="w-56 h-56 md:w-72 md:h-72 rounded-full mx-auto relative"
      style={{
        background: "radial-gradient(circle at 35% 35%, rgba(124,58,237,0.25), rgba(79,70,229,0.15) 50%, transparent 70%)",
        boxShadow: "0 0 80px rgba(79,70,229,0.15), inset 0 0 40px rgba(255,255,255,0.2)",
      }}
      animate={{
        rotateX: [0, 8, -5, 0],
        rotateY: [0, -10, 8, 0],
        scale: [1, 1.03, 0.98, 1],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Inner ring */}
      <motion.div
        className="absolute inset-6 rounded-full"
        style={{
          border: "1px solid rgba(79,70,229,0.2)",
          background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.3), transparent 60%)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      {/* Highlight */}
      <div
        className="absolute w-16 h-8 rounded-full"
        style={{
          background: "rgba(255,255,255,0.4)",
          filter: "blur(8px)",
          top: "20%",
          left: "25%",
          transform: "rotate(-30deg)",
        }}
      />
    </motion.div>
  </div>
);

export default Orb3D;
