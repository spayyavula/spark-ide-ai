import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceUser {
  user_id: string;
  user_name: string;
  cursor_position?: { x: number; y: number };
  last_seen: string;
  is_active: boolean;
}

export const useProjectPresence = (projectId: string | null, currentUser: { id: string; name: string } | null) => {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId || !currentUser) return;

    let channel: any;
    let presenceInterval: NodeJS.Timeout;

    const setupPresence = async () => {
      // Create realtime channel for the project
      channel = supabase.channel(`project_${projectId}`)
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users = Object.keys(newState).map(userId => ({
            user_id: userId,
            ...newState[userId][0]
          }));
          setPresenceUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            
            // Track current user presence
            const presenceData = {
              user_id: currentUser.id,
              user_name: currentUser.name,
              online_at: new Date().toISOString(),
              is_active: true
            };
            
            await channel.track(presenceData);
            
            // Update presence in database
            await supabase
              .from('project_presence')
              .upsert({
                project_id: projectId,
                user_id: currentUser.id,
                user_name: currentUser.name,
                last_seen: new Date().toISOString(),
                is_active: true
              });
          }
        });

      // Update presence every 30 seconds to keep user active
      presenceInterval = setInterval(async () => {
        if (channel && isConnected) {
          await supabase
            .from('project_presence')
            .upsert({
              project_id: projectId,
              user_id: currentUser.id,
              user_name: currentUser.name,
              last_seen: new Date().toISOString(),
              is_active: true
            });
        }
      }, 30000);
    };

    setupPresence();

    // Cleanup function
    return () => {
      if (presenceInterval) {
        clearInterval(presenceInterval);
      }
      
      if (channel) {
        // Mark user as inactive before leaving
        supabase
          .from('project_presence')
          .upsert({
            project_id: projectId,
            user_id: currentUser.id,
            user_name: currentUser.name,
            last_seen: new Date().toISOString(),
            is_active: false
          });
        
        supabase.removeChannel(channel);
      }
      
      setIsConnected(false);
    };
  }, [projectId, currentUser]);

  const updateCursorPosition = async (x: number, y: number) => {
    if (!projectId || !currentUser) return;
    
    await supabase
      .from('project_presence')
      .upsert({
        project_id: projectId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        cursor_position: { x, y },
        last_seen: new Date().toISOString(),
        is_active: true
      });
  };

  return {
    presenceUsers,
    isConnected,
    updateCursorPosition
  };
};
