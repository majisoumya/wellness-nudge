import { motion } from "framer-motion";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import HealthRing from "@/components/HealthRing";
import { Link } from "react-router-dom";
import { Timer, Leaf, Clock, TrendingUp } from "lucide-react";

const tips = [
  "Stretch your shoulders and neck",
  "Look away from the screen for 20 seconds",
  "Take three deep breaths",
];

const Dashboard = () => (
  <div className="gradient-radial-bg relative">
    <FloatingOrbs />
    <div className="relative z-10 container mx-auto py-6">
      <AppNav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">Good afternoon</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's a quiet look at your day.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Health Ring */}
        <GlassCard delay={0.2} className="flex flex-col items-center justify-center py-8 md:col-span-1">
          <HealthRing segments={5} filled={3} size={140} />
          <p className="text-xs text-muted-foreground mt-4">Your daily pauses</p>
        </GlassCard>

        {/* Quick stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { icon: Timer, label: "Focus time", value: "1h 42m", color: "text-primary" },
            { icon: Clock, label: "Breaks taken", value: "3", color: "text-primary" },
            { icon: TrendingUp, label: "Streak", value: "4 days", color: "text-primary" },
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

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <GlassCard delay={0.6}>
          <h3 className="font-display font-semibold text-foreground mb-2">Start a focus session</h3>
          <p className="text-sm text-muted-foreground mb-4">25 minutes of deep work, then a gentle pause.</p>
          <Link to="/timer" className="btn-primary text-sm inline-block">
            Begin session
          </Link>
        </GlassCard>
        <GlassCard delay={0.7}>
          <h3 className="font-display font-semibold text-foreground mb-2">Wellness suggestions</h3>
          <p className="text-sm text-muted-foreground mb-4">Curated micro-activities for your next break.</p>
          <Link to="/wellness" className="btn-ghost text-sm inline-block">
            Explore
          </Link>
        </GlassCard>
      </div>
    </div>
  </div>
);

export default Dashboard;
