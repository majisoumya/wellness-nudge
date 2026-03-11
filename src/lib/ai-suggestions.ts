import { BreakLog } from './api';

export type SuggestionType = 'water' | 'stretch' | 'eye_rest' | 'breathe';

export interface WellnessSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  durationSeconds: number;
  reason: string;
}

/**
 * Heuristic "AI" engine to determine the best micro-break activity.
 * 
 * @param workDurationMinutes Time user has been consecutively working
 * @param recentBreaks Array of breaks taken in the current session or recently
 * @returns A JSON suggestion object
 */
export function generateWellnessSuggestion(
  workDurationMinutes: number, 
  recentBreaks: BreakLog[]
): WellnessSuggestion {
  
  // 1. Check Hydration (Every 2 hours approx)
  const hasDrankWater = recentBreaks.some(b => b.break_type === 'water');
  if (workDurationMinutes >= 120 && !hasDrankWater) {
    return {
      type: 'water',
      title: 'Hydration Check',
      description: 'You\'ve been working hard. Go grab a fresh glass of water to stay sharp!',
      durationSeconds: 60,
      reason: 'No water break logged in the last 2 hours.'
    };
  }

  // 2. Check Screen Fatigue / Eye Rest (20-20-20 rule)
  // If working for > 20 mins and haven't rested eyes
  const hasRestedEyes = recentBreaks.some(b => b.break_type === 'eye_rest');
  if (workDurationMinutes >= 20 && !hasRestedEyes) {
    return {
      type: 'eye_rest',
      title: '20-20-20 Rule',
      description: 'Look at something 20 feet away for 20 seconds. It prevents digital eye strain.',
      durationSeconds: 20,
      reason: 'Over 20 minutes of continuous screen time detected.'
    };
  }

  // 3. Check Physical Stiffness (Every 60 mins)
  const hasStretched = recentBreaks.some(b => b.break_type === 'stretch');
  if (workDurationMinutes >= 60 && !hasStretched) {
    return {
      type: 'stretch',
      title: 'Time to Stretch',
      description: 'Stand up, reach for the ceiling, and do a quick torso twist. Your back will thank you.',
      durationSeconds: 60,
      reason: 'Over an hour of sitting detected.'
    };
  }

  // 4. Default / Stress Relief (Breathing)
  // If they have done everything else, but are still working a long time
  if (workDurationMinutes > 90) {
    return {
      type: 'breathe',
      title: 'Box Breathing',
      description: 'Breathe in for 4s, hold 4s, out 4s, hold 4s. Resets your nervous system.',
      durationSeconds: 60,
      reason: 'Long focus block. Breathing helps maintain stamina.'
    };
  }

  // 5. Fallback Default
  return {
    type: 'stretch',
    title: 'Quick Posture Check',
    description: 'Roll your shoulders back and sit up straight. A quick win for your posture.',
    durationSeconds: 30,
    reason: 'Regular posture maintenance.'
  };
}
