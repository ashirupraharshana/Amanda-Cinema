"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  isLoading: boolean;
  checkAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  isLoading: true,
  checkAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");

      if (!token) {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      try {
        const response = await fetch("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserRole(role);
          
          // Update localStorage with latest data from backend
          if (data.userId) localStorage.setItem("userId", data.userId.toString());
          if (data.name) localStorage.setItem("userName", data.name);
          if (data.email) localStorage.setItem("userEmail", data.email);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (fetchError) {
        // Network error or backend not available
        console.warn("Backend not reachable, using cached credentials:", fetchError);
        // If we have a token and role, assume authenticated (offline mode)
        if (token && role) {
          setIsAuthenticated(true);
          setUserRole(role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Don't clear storage on error, might just be network issue
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");
      if (token && role) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    setIsAuthenticated(false);
    setUserRole(null);
    router.push("/login");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect logic based on authentication state
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/login", "/register", "/callback"];
    const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path));

    if (!isAuthenticated && !isPublicPath) {
      // Not authenticated and trying to access protected route
      router.push("/login");
    } else if (isAuthenticated && isPublicPath) {
      // Already authenticated and on public page, redirect to dashboard
      if (userRole === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, pathname, userRole, router]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, isLoading, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);