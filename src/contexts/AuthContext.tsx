import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/hooks/use-toast";

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  isDriver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface DecodedToken {
  email: string;
  role: string;
  exp?: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          if (decoded.email && decoded.role) {
            setUser({ email: decoded.email, role: decoded.role });
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (e) {
          localStorage.removeItem("authToken");
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const { access_token } = await res.json();
      const decoded: DecodedToken = jwtDecode(access_token);

      if (!decoded.email || !decoded.role) {
        throw new Error("Token missing required fields");
      }

      localStorage.setItem("authToken", access_token);
      setUser({ email: decoded.email, role: decoded.role });

      toast({ title: "Success", description: "Signed in successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Login failed",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("authToken");
    setUser(null);
    toast({ title: "Success", description: "Signed out successfully" });
  };

  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";
  const isDriver = user?.role === "DRIVER";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
        isVendor,
        isDriver,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
