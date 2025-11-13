import React, { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import api from "@/shared/services/axios";

type User = {
  programId: number;
  userName: string;
  instituteName: string;
  logo: string;
  userImage: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on init
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hasUser = localStorage.getItem("user");

    if (token && !hasUser) {
      fetchUser();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
