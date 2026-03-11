import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { getActiveSession } from '@/lib/api';
import { toast } from 'sonner';
import { playVoiceAlert } from '@/lib/voice-alerts';

export function useWellnessTracker() {
  const { user } = useAuth();
  
  // Use refs to avoid re-triggering the effect or duplicate toasts
  const hasTriggered25Min = useRef(false);
  const hasTriggered120Min = useRef(false);
  const currentSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // reset if logged out
      currentSessionId.current = null;
      hasTriggered25Min.current = false;
      hasTriggered120Min.current = false;
      return;
    }

    const checkSession = async () => {
      try {
        const session = await getActiveSession(user.id);
        
        if (!session) {
          // If no active session, reset flags
          currentSessionId.current = null;
          hasTriggered25Min.current = false;
          hasTriggered120Min.current = false;
          return;
        }

        // If it's a new session we haven't seen yet, reset flags
        if (session.id !== currentSessionId.current) {
          currentSessionId.current = session.id;
          hasTriggered25Min.current = false;
          hasTriggered120Min.current = false;
        }

        // Calculate elapsed time
        const start = new Date(session.start_time).getTime();
        const now = Date.now();
        const elapsedMinutes = (now - start) / (1000 * 60);

        // Rule 2: 2 Hours (Long screen time, big stretch)
        // Check this first so if they refresh after 2 hrs, we don't spam the 25 min one too
        if (elapsedMinutes >= 120 && !hasTriggered120Min.current) {
          hasTriggered120Min.current = true;
          hasTriggered25Min.current = true; // suppress the 25min one if it's already 2 hours
          
          playVoiceAlert("Long screen time alert. It's been two hours. Please take a 10 minute break to stretch your body and drink some water.");
          toast("Long screen time alert!", {
            description: "It's been 2 hours continuously. Take a proper 5-10 minute break to walk around and give your eyes a rest.",
            duration: 15000, // stay mostly visible
            icon: "🚶",
          });
        } 
        // Rule 1: 25 Minutes (Micro-break, 20-20-20 rule)
        else if (elapsedMinutes >= 25 && elapsedMinutes < 120 && !hasTriggered25Min.current) {
          hasTriggered25Min.current = true;
          
          playVoiceAlert("Focus time complete. Time for a quick micro-break. Look away from the screen, take a deep breath, or listen to a refreshing song.");
          toast("Time for a micro-break!", {
            description: "You've been focusing for 25 minutes. Look 20 feet away for 20 seconds, or do a quick neck stretch!",
            duration: 10000,
            icon: "💆",
          });
        }

      } catch (error) {
        console.error("Failed to check active session for wellness tracker:", error);
      }
    };

    // Check immediately, then every 1 minute
    checkSession();
    const interval = setInterval(checkSession, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
}
