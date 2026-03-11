import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FloatingOrbs from "@/components/FloatingOrbs";
import AppNav from "@/components/AppNav";
import GlassCard from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface LeaderboardUser {
  id: string;
  full_name: string;
  avatar_url: string;
  daily_health_score: number;
}

const LeaderboardSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <GlassCard key={i} className="flex items-center gap-4 py-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-20 h-3" />
        </div>
        <Skeleton className="w-16 h-8 rounded-full" />
      </GlassCard>
    ))}
  </div>
);

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const data = await fetchLeaderboard();
        setUsers(data);
      } catch (err: any) {
        console.error("Failed to load leaderboard", err);
        toast.error("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={24} />;
    if (index === 1) return <Medal className="text-slate-400" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="font-display font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="gradient-radial-bg min-h-screen relative flex flex-col">
      <FloatingOrbs />
      <div className="relative z-10 container mx-auto py-6 flex-1 flex flex-col max-w-3xl">
        <AppNav />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-500 rounded-full mb-4">
             <Trophy size={32} />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Community Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-2">See who's building the healthiest habits today.</p>
        </motion.div>

        {loading ? (
          <LeaderboardSkeleton />
        ) : (
          <motion.div 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: 0.3 }}
             className="space-y-3"
          >
            {users.map((u, index) => {
              const isCurrentUser = u.id === user?.id;
              return (
                <GlassCard 
                  key={u.id} 
                  delay={0.1 * index}
                  className={`flex items-center gap-4 py-4 px-6 transition-all duration-300 hover:scale-[1.01] ${isCurrentUser ? 'border-indigo-500/50 bg-indigo-50/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''}`}
                >
                  <div className="w-8 flex justify-center items-center shrink-0">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shrink-0">
                     {u.avatar_url ? (
                       <img src={u.avatar_url} alt={u.full_name || 'User'} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-lg leading-none">
                         {u.full_name ? u.full_name.charAt(0).toUpperCase() : '?'}
                       </div>
                     )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate flex items-center gap-2">
                      {u.full_name || 'Anonymous User'}
                      {isCurrentUser && <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded-full">You</span>}
                    </h3>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end font-display font-bold text-xl text-primary">
                      {u.daily_health_score} <Star size={16} fill="currentColor" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Score</p>
                  </div>
                </GlassCard>
              );
            })}
            
            {users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="mx-auto mb-4 opacity-50" size={48} />
                <p>No activity yet today. Be the first on the board!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
