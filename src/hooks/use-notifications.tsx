import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from './use-auth'

export function useNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Subscribe to new rows inserted into the 'notifications' table
    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`, // Only listen to this user's notifications
        },
        (payload) => {
          const newNotification = payload.new
          // Display the notification using Sonner toast
          toast(newNotification.title, {
            description: newNotification.message,
            duration: 8000,
            icon: newNotification.type === 'alert' ? '🚨' : newNotification.type === 'suggestion' ? '💡' : '🔔',
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])
}
