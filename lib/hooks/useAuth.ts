"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../api-client";

interface User {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  role: "customer" | "admin" | "seller";
  status: "active" | "blocked" | "pending";
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  avatar?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ( email: string, phone: string, password: string ) => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  revalidateAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user data from API
  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.getCurrentUser();
      console.log("Auth check response:", response);
      // API returns data directly, not wrapped in user field
      const userData = response.data;
      if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
        setUser(userData as User);
        localStorage.setItem('wasLoggedIn', 'true');
      } else {
        setUser(null);
        localStorage.removeItem('wasLoggedIn');
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem('wasLoggedIn');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    // Only check auth if user was previously logged in
    const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';
    if (wasLoggedIn) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [checkAuth]);

  // Listen for auth changes from other tabs/windows or components
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom auth change event
    window.addEventListener("authChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleStorageChange);
    };
  }, [checkAuth]);

  const login = useCallback(async ( email: string, phone: string, password: string ) => {
    try {
      const response = await apiClient.login({ email, password });

      const userData = response.data;
      
      if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
        setUser(userData as User);
        // Mark as logged in
        localStorage.setItem('wasLoggedIn', 'true');
      }
      
      // Dispatch custom event to trigger re-check in other instances
      window.dispatchEvent(new Event("authChanged"));
      
      // Force re-validate to ensure state is in sync
      await checkAuth();
    } catch (error) {
      throw error;
    }
  }, [checkAuth]);

  const register = useCallback(
    async (fullName: string, email: string, phone: string, password: string) => {
      try {
        await apiClient.register({ username: fullName, email, phone, password });

        // After registration, user needs to login
        await login(email, phone, password);
      } catch (error) {
        throw error;
      }
    },
    [login]

  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
      // Clear login flag
      localStorage.removeItem('wasLoggedIn');
      // Dispatch event
      window.dispatchEvent(new Event("authChanged"));
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    revalidateAuth: checkAuth,
  };
}
