"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  login: (emailOrPhone: string, password: string) => Promise<void>;
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
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      console.log("Auth check response:", res);
      if (res.ok) {
        const data = await res.json();
        console.log("Auth check data:", data);
        // API returns data directly, not wrapped in user field
        const userData = data.data || data.user;
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
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
  }, [checkAuth]);  const login = useCallback(async (emailOrPhone: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailOrPhone, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      const data = await res.json();
      const userData = data.data?.user || data.user;
      
      if (userData) {
        setUser(userData);
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
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Đăng ký thất bại");
        }

        // After registration, user needs to login
        await login(email, password);
      } catch (error) {
        throw error;
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
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
