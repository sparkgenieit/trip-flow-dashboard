
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: { email: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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

// Hardcoded credentials for testing
const VALID_CREDENTIALS = [
  { email: 'admin@tripflow.com', password: 'admin123' },
  { email: 'test@example.com', password: 'test123' },
  { email: 'user@demo.com', password: 'demo123' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if auth token exists in localStorage
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
      setUser({ email: userEmail });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check against hardcoded credentials
      const validCredential = VALID_CREDENTIALS.find(
        cred => cred.email === email && cred.password === password
      );

      if (!validCredential) {
        throw new Error('Invalid credentials');
      }

      // Simulate API response with mock token
      const mockToken = `mock_token_${Date.now()}`;
      
      // Store the token and user email in localStorage
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userEmail', email);
      
      setUser({ email });

      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Remove token and user data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      
      setUser(null);
      
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'admin@tripflow.com';

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
