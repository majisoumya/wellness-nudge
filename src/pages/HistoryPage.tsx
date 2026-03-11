import { motion } from "framer-motion";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import { Timer, Coffee, CheckCircle2 } from "lucide-react";

const history = [
  { date: "Today", items: [
    { type: "work", label: "Focus session", duration: "25 min", time: "2:30 PM", icon: Timer },
    { type: "break", label: "Box breathing", duration: "2 min", time: "2:55 PM", icon: Coffee },
    { type: "work", label: "Focus session", duration: "25 min", time: "11:00 AM", icon: Timer },
    { type: "break", label: "Desk stretch", duration: "3 min", time: "11:25 AM", icon: Coffee },
    { type: "work", label: "Focus session", duration: "25 min", time: "9:15 AM", icon: Timer },
  ]},
  { date: "Yesterday", items: [
    { type: "work", label: "Focus session", duration: "25 min", time: "3:00 PM", icon: Timer },
    { type: "break", label: "20-20-20 rule", duration: "20 sec", time: "3:25 PM", icon: Coffee },
    { type: "work", label: "Focus session", duration: "25 min", time: "1:00 PM", icon: Timer },
    { type: "complete", label: "Daily pauses complete", duration: "5 of 5", time: "4:00 PM", icon: CheckCircle2 },
  ]},
];

const HistoryPage = () => (
  <div className="gradient-radial-bg relative">
    <FloatingOrbs />
    <div className="relative z-10 container mx-auto py-6">
      <AppNav />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Activity History</h1>
        <p className="text-sm text-muted-foreground mt-1">A quiet record of your pauses and focus.</p>
      </motion.div>

      {history.map((group, gi) => (
        <div key={group.date} className="mb-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + gi * 0.1 }}
            className="font-display font-semibold text-lg text-foreground mb-4"
          >
            {group.date}
          </motion.h2>

          <div className="space-y-3">
            {group.items.map((item, i) => (
              <GlassCard key={`${group.date}-${i}`} delay={0.4 + gi * 0.1 + i * 0.08} className="py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      item.type === "complete"
                        ? "bg-green-100 text-green-600"
                        : item.type === "break"
                        ? "bg-accent text-primary"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.duration}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HistoryPage;
