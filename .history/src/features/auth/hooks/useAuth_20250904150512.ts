import { createContext, useContext } from "react";
import type { AuthContextType } from "../auth.types";

export const useAuth = () => {
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
