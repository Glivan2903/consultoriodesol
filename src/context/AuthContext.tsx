import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserPermissions {
  dashboard: boolean;
  products: boolean;
  categories: boolean;
  incoming: boolean;
  outgoing: boolean;
  clients: boolean;
  companies: boolean;
  movements: boolean;
  reports: boolean;
  settings: boolean;
}

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  hasPermission: (key: keyof UserPermissions) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(uid: string) {
    const { data, error } = await supabase
      .from('inventory_profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (data) {
      console.log('[Auth] Profile loaded:', data);
      setProfile(data);
    } else {
      console.warn(`[Auth] Profile fetch failed for UID: ${uid}`);
      if (error) console.error('[Auth] Fetch Error:', error);
    }
    return data;
  }

  useEffect(() => {
    console.log('[Auth] Initializing AuthProvider...');
    
    // Safety timeout to prevent white screen (Adjusted for slow connections)
    const timer = setTimeout(() => {
      console.warn('[Auth] Initialization taking too long, forcing active state.');
      setLoading(false);
    }, 10000);

    // In Supabase v2, onAuthStateChange immediately fires an INITIAL_SESSION event
    // so we don't need to manually call getSession() and risk race conditions/locks.

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log('[Auth] onAuthStateChange event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Do NOT await database queries inside this callback to avoid deadlocks.
      if (!session?.user) {
        setProfile(null);
      }
      
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Fetch profile in a separate effect when the session changes
  useEffect(() => {
    if (session?.user) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id]);

  const hasPermission = (_key: keyof UserPermissions) => {
    return !!session; // Se está logado, tem permissão para tudo
  };

  const signOut = async () => {
    supabase.auth.signOut(); // Dispara mas não espera (resolve o problema da internet lenta)
    setSession(null);
    setUser(null);
    setProfile(null);
    console.log('[Auth] Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, hasPermission, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
