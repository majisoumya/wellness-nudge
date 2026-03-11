import { motion } from "framer-motion";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import { Eye, Wind, Dumbbell, Coffee, Ear, Smile } from "lucide-react";

const suggestions = [
  {
    icon: Wind,
    title: "Box Breathing",
    duration: "2 min",
    desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat gently.",
    category: "Breathing",
  },
  {
    icon: Eye,
    title: "20-20-20 Rule",
    duration: "20 sec",
    desc: "Look at something 20 feet away for 20 seconds to rest your eyes.",
    category: "Eyes",
  },
  {
    icon: Dumbbell,
    title: "Desk Stretch",
    duration: "3 min",
    desc: "Roll your shoulders, stretch your neck side to side, extend your wrists.",
    category: "Movement",
  },
  {
    icon: Coffee,
    title: "Mindful Sip",
    duration: "1 min",
    desc: "Drink water slowly. Notice the temperature, the weight of the glass.",
    category: "Mindfulness",
  },
  {
    icon: Ear,
    title: "Ambient Listening",
    duration: "2 min",
    desc: "Close your eyes. Identify three sounds around you without labeling them.",
    category: "Mindfulness",
  },
  {
    icon: Smile,
    title: "Gratitude Moment",
    duration: "1 min",
    desc: "Think of one thing you appreciate right now. Let it be small.",
    category: "Emotional",
  },
];

const WellnessPage = () => (
  <div className="gradient-radial-bg relative">
    <FloatingOrbs />
    <div className="relative z-10 container mx-auto py-6">
      <AppNav />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Wellness Suggestions</h1>
        <p className="text-sm text-muted-foreground mt-1">Gentle activities for your next pause. No pressure.</p>
      </motion.div>

      <div className="space-y-6">
        {suggestions.map((s, i) => (
          <GlassCard key={s.title} delay={0.3 + i * 0.1}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <s.icon size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {s.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                <span className="text-xs text-primary/60 mt-2 inline-block">{s.category}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  </div>
);

export default WellnessPage;
