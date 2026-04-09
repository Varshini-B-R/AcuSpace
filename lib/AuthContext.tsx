import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextType = {
  session: Session | null;
  userRole: 'patient' | 'therapist' | null; // NEW: Track the role
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'patient' | 'therapist' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserRole(session?.user?.id);
    });

    // 2. Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUserRole(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // NEW: Fetch the role from the profiles table
  const fetchUserRole = async (userId?: string) => {
    if (!userId) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || 'patient'); // Default to patient if missing
    } catch (error) {
      console.error('Error fetching role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);