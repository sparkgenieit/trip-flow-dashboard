
import React, { createContext, useContext, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock user and session for bypass
  const [user] = useState<User | null>({
    id: 'mock-user-id',
    email: 'admin@demo.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { role: 'admin' }
  } as User);
  
  const [session] = useState<Session | null>({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: user!
  } as Session);
  
  const [loading] = useState(false);
  const [isAdmin] = useState(true); // Set as admin for demo
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    toast({
      title: "Success",
      description: "Signed in successfully (demo mode)",
    });
  };

  const signUp = async (email: string, password: string, userData: any) => {
    toast({
      title: "Success",
      description: "Account created successfully (demo mode)",
    });
  };

  const signOut = async () => {
    toast({
      title: "Success",
      description: "Signed out successfully (demo mode)",
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
