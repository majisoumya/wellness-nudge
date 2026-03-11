import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import FloatingOrbs from "@/components/FloatingOrbs";
import Orb3D from "@/components/Orb3D";
import GlassCard from "@/components/GlassCard";
import { Timer, Heart, BarChart3, Bell } from "lucide-react";

const features = [
  { icon: Timer, title: "Focus Sessions", desc: "Structured work sessions with gentle break reminders" },
  { icon: Heart, title: "Wellness Pauses", desc: "Guided breathing exercises between focus blocks" },
  { icon: BarChart3, title: "Daily Reflection", desc: "A simple ring showing your pauses — not a score" },
  { icon: Bell, title: "Quiet Nudges", desc: "Subtle reminders that never interrupt your flow" },
];

const Landing = () => (
  <div className="gradient-radial-bg relative overflow-hidden">
    <FloatingOrbs />

    {/* Nav */}
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="relative z-10 container mx-auto flex items-center justify-between py-6"
    >
      <span className="font-display font-semibold text-xl tracking-tight text-foreground">
        Wellness Nudge
      </span>
      <div className="flex gap-3">
        <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
        <Link to="/login" className="btn-primary text-sm">Get Started</Link>
      </div>
    </motion.header>

    {/* Hero */}
    <section className="relative z-10 container mx-auto pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
            Work deeply.
            <br />
            <span className="text-gradient">Pause gently.</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed max-w-md" style={{ color: "var(--text-subtle)" }}>
            A calm companion for your workday that reminds you to breathe, stretch, and restore — without adding to
            the noise.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="btn-primary text-base">
              Start for free
            </Link>
            <Link to="/dashboard" className="btn-ghost text-base">
              Explore demo
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Orb3D />
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="relative z-10 container mx-auto pb-24">
      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <GlassCard key={f.title} delay={0.6 + i * 0.15} className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <f.icon size={22} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 container mx-auto pb-8 text-center">
      <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
        Designed by Stillpoint. Built to help you pause.
      </p>
    </footer>
  </div>
);

export default Landing;
