"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import AxiosInstance from "../Utils/AxiosInstance";
import { VERIFY_TOKEN } from "../Utils/Constants/Auth";

interface User {
  userId: string;
  email: string;
  role: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

  const login = (userData: User) => {
    setUser(userData);
  };

  const checkLogin = async () => {
    try {
      const response = await AxiosInstance.post(VERIFY_TOKEN);
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider value={{ user, login, isLoading }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
