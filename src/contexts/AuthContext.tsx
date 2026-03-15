import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'moderator' | 'client';

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
  const [fetchLock, setFetchLock] = useState(false);

  const fetchRole = async (userId: string, skipCache = false, userEmail?: string): Promise<AppRole> => {
    // 1. MASTER ADMIN BYPASS (Immediate priority)
    const emailToCheck = userEmail || user?.email;
    if (emailToCheck === 'daivid.evangelista@edu.mt.gov.br') {
      console.log('[Auth] Master admin detected via email priority.');
      sessionStorage.setItem(ROLE_CACHE_KEY, 'admin');
      return 'admin';
    }

    const cached = sessionStorage.getItem(ROLE_CACHE_KEY) as AppRole | null;
    
    // 2. CACHE CHECK
    if (!skipCache && cached) {
      return cached;
    }

    // 3. CONCURRENCY LOCK
    if (fetchLock) return cached || 'client';
    setFetchLock(true);

    try {
      console.log(`[Auth] Fetching role from DB for user ${userId}...`);
      
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role', { ascending: true });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      setFetchLock(false);
      
      if (!result) {
        console.warn('[Auth] fetchRole timed out, using fallback');
        return cached || 'client';
      }

      const { data, error } = result as any;
      
      if (error) {
        console.error('[Auth] fetchRole query error:', error);
        // If "Lock broken" happens, the cached role is much safer than 'client'
        return cached || 'client';
      }

      const resolvedRole = (data?.[0]?.role as AppRole) ?? cached ?? 'client';
      console.log(`[Auth] Resolved role: ${resolvedRole}`);
      sessionStorage.setItem(ROLE_CACHE_KEY, resolvedRole);
      return resolvedRole;
    } catch (err) {
      setFetchLock(false);
      console.error('[Auth] fetchRole exception:', err);
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
          const r = await fetchRole(user.id, true, user.email);
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
          const r = await fetchRole(sess.user.id, true, sess.user.email);
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
