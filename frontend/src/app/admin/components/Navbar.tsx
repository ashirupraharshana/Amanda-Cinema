"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Get user info from localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    setUserInfo({
      name: storedName || "Admin",
      email: storedEmail || "",
    });
  }, []);

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/movies", label: "Movies" },
    { href: "/admin/theaters", label: "Theaters" },
    { href: "/admin/showtimes", label: "Showtimes" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <header className="border-b border-gray-800 bg-[#1a1a1a] sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#d4af37]">Amanda Cinema</h1>
          <span className="rounded-full bg-[#d4af37] px-3 py-1 text-xs font-bold text-[#0f0f0f]">
            ADMIN
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg transition text-sm ${
                pathname === link.href
                  ? "bg-[#d4af37] text-[#0f0f0f] font-semibold"
                  : "text-[#f5f5f5]/80 hover:text-[#d4af37] hover:bg-[#0f0f0f]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-[#d4af37]">
              {userInfo.name}
            </div>
            <div className="text-xs text-[#f5f5f5]/60">{userInfo.email}</div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-[#800020] px-4 py-2 text-sm font-semibold text-[#f5f5f5] hover:bg-[#600018] transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-800 px-4 py-3 overflow-x-auto">
        <nav className="flex items-center gap-2 min-w-max">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg transition text-xs whitespace-nowrap ${
                pathname === link.href
                  ? "bg-[#d4af37] text-[#0f0f0f] font-semibold"
                  : "text-[#f5f5f5]/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}