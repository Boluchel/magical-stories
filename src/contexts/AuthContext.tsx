import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to clear auth state
  const clearAuthState = () => {
    setUser(null);
    setSession(null);
  };

  // Helper function to set auth state
  const setAuthState = (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting initial session:', error.message);
          clearAuthState();
        } else if (mounted) {
          setAuthState(session);
        }
      } catch (error) {
        console.warn('Error getting initial session:', error);
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.email);

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          setAuthState(session);
          break;
        case 'SIGNED_OUT':
          clearAuthState();
          break;
        case 'USER_UPDATED':
          setAuthState(session);
          break;
        default:
          // For any other events, update the state
          setAuthState(session);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Email sign-in error:', error);
        return { error };
      }

      // The auth state will be updated via the onAuthStateChange listener
      return { error: null };
    } catch (error) {
      console.error('Email sign-in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Email sign-up error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Email sign-up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately for better UX
      clearAuthState();
      
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only sign out locally to avoid server-side session issues
      });
      
      if (error) {
        // Check if it's a session-related error that we can safely ignore
        const isSessionError = error.message?.toLowerCase().includes('session') ||
                              error.message?.toLowerCase().includes('jwt') ||
                              error.message?.toLowerCase().includes('token');
        
        if (isSessionError) {
          // User is effectively signed out, so we don't need to throw
          console.warn('Session already invalid during sign out:', error.message);
          return;
        }
        
        // For other errors, log but don't throw since user state is already cleared
        console.error('Sign out error (non-critical):', error);
      }
    } catch (error) {
      // Log the error but don't throw it since we've already cleared the local state
      console.error('Sign out error:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        // If refresh fails, clear the session
        clearAuthState();
        throw error;
      }
      
      setAuthState(session);
    } catch (error) {
      console.error('Session refresh error:', error);
      clearAuthState();
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};