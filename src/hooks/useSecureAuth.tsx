import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        logger.debug('Auth state changed:', event);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setIsLoading(false);
    
    if (error) {
      logger.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    setIsLoading(false);
    
    if (error) {
      logger.error('Sign up error:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Logout error:', error.message);
    }
  };

  return {
    user,
    session,
    login,
    signUp,
    logout,
    isLoading,
    isAuthenticated: !!user
  };
};