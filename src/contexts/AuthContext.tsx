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
  email?: string;
  role: string;
  name?: string;
  phone?: string;
  age?: number;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // identifier can be email or mobile number
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  isDriver: boolean;
  isRider: boolean;
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
  email?: string;
  phone?: string;
  role: string;
  vendorId?: number;
  riderId?: number;
  driverId?: number;
  name?: string;
  exp?: number; // seconds
}

const isTokenExpired = (token: string) => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (!decoded?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return decoded.exp < nowSec;
  } catch {
    return true;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Restore session
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("vendorId");
          localStorage.removeItem("riderId");
          localStorage.removeItem("driverId");
        } else {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            if (decoded.role) {
              setUser({
                email: decoded.email,
                phone: decoded.phone,
                role: decoded.role,
                name: decoded.name,
              });
            } else {
              localStorage.removeItem("authToken");
            }
          } catch {
            localStorage.removeItem("authToken");
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      setLoading(true);

      const looksLikeEmail = identifier.includes("@");
      // Send both a generic identifier and a specific key to be compatible with your backend
      const body = {
        identifier,
        email: looksLikeEmail ? identifier : undefined,
        phone: !looksLikeEmail ? identifier : undefined,
        password,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        let msg = "Invalid credentials";
        try {
          const j = await res.json();
          if (j?.message) msg = Array.isArray(j.message) ? j.message.join(", ") : j.message;
        } catch {}
        throw new Error(msg);
      }

      const { access_token } = await res.json();
      const decoded: DecodedToken = jwtDecode(access_token);

      if (!decoded?.role) {
        throw new Error("Token missing required fields");
      }

      // Persist
      localStorage.setItem("authToken", access_token);
      if (decoded.email) localStorage.setItem("userEmail", decoded.email);
      localStorage.setItem("userRole", decoded.role);
      if (decoded.vendorId) localStorage.setItem("vendorId", String(decoded.vendorId));
      if (decoded.riderId) localStorage.setItem("riderId", String(decoded.riderId));
      if (decoded.driverId) localStorage.setItem("driverId", String(decoded.driverId));

      setUser({
        email: decoded.email,
        phone: decoded.phone,
        role: decoded.role,
        name: decoded.name,
      });

      toast({ title: "Success", description: "Signed in successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Login failed",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("vendorId");
    localStorage.removeItem("riderId");
    localStorage.removeItem("driverId");
    setUser(null);
    toast({ title: "Success", description: "Signed out successfully" });
  };

  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";
  const isDriver = user?.role === "DRIVER";
  const isRider = user?.role === "RIDER";

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
        isRider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
