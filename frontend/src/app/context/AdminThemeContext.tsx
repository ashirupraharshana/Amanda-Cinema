"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AdminThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminTheme");
    if (stored !== null) setIsDark(stored === "dark");
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("adminTheme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <AdminThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}