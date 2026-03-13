import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_CACHE_KEY = 'solcontrole_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(() => {
    // Restore role from sessionStorage to avoid flash of wrong role on navigation
    const cached = sessionStorage.getItem(ROLE_CACHE_KEY);
    return (cached as AppRole) ?? null;
  });
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string, skipCache = false): Promise<AppRole> => {
    const cached = sessionStorage.getItem(ROLE_CACHE_KEY) as AppRole | null;
    
    // Check cache first (only if not skipping)
    if (!skipCache && cached) {
      return cached;
    }

    try {
      // 8-second timeout safety
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: true }) 
        .limit(1)
        .maybeSingle();

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      if (!result || (result as any).error) {
        console.warn('fetchRole failed or timed out, defaulting to cached or client');
        return cached || 'client';
      }

      const data = (result as any).data;
      const resolvedRole = (data?.role as AppRole) ?? cached ?? 'client';
      sessionStorage.setItem(ROLE_CACHE_KEY, resolvedRole);
      return resolvedRole;
    } catch (err) {
      console.error('fetchRole error:', err);
      return cached || 'client';
    }
  };


  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        if (!mounted) return;
        
        if (user) {
          setUser(user);
          // Session is still needed for some internal context but getUser is the truth for 'user'
          const { data: { session: sess } } = await supabase.auth.getSession();
          setSession(sess);

          // Force a fresh check on init to prevent session storage spoofing
          const r = await fetchRole(user.id, true);
          if (mounted) setRole(r);
        } else {
          setUser(null);
          setSession(null);
          sessionStorage.removeItem(ROLE_CACHE_KEY);
        }
      } catch (err) {
        console.error('init auth error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        if (!mounted) return;
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          // Fresh check on every auth state change
          const r = await fetchRole(sess.user.id, true);
          if (mounted) {
            setRole(r);
            setLoading(false);
          }
        } else {
          // User signed out — clear everything
          sessionStorage.removeItem(ROLE_CACHE_KEY);
          if (mounted) {
            setRole(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Clear cached role before signing in as a different user
    sessionStorage.removeItem(ROLE_CACHE_KEY);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    sessionStorage.removeItem(ROLE_CACHE_KEY);
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
