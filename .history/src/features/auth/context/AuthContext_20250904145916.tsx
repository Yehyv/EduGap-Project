import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LoginFormValues } from "../auth.types";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (payload: LoginFormValues) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [initializing, setInitializing] = useState(true);

  // Sync localStorage whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Hydrate user data when token exists
  useEffect(() => {
    const hydrate = async () => {
      try {
        if (token) {
          // Example: fetch current user
          const res = await fetch("https://api.example.com/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // token invalid
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    hydrate();
  }, [token]);

  const login = async (payload: LoginFormValues) => {
    // Example: call login endpoint
    const res = await fetch("https://api.example.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    setToken(data.token); // save token
    setUser(data.user); // save user
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, initializing, login, logout }),
    [user, token, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
