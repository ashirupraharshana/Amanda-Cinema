"use client";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    setUserInfo({ name: storedName || "Guest", email: storedEmail || "" });
  }, []);

  const navLinks = [
    { href: "/customer/dashboard", label: "Dashboard" },
    { href: "/customer/movies", label: "Movies" },
    { href: "/customer/bookings", label: "My Bookings" },
    { href: "/customer/profile", label: "Profile" },
  ];

  // Theme tokens — navbar always uses its own tokens, never inherits from page
  const t = {
    bg: isDark ? "#111010" : "#ffffff",
    border: isDark ? "#1e1e1e" : "#e8e4dc",
    logo: "#c8a96e",
    linkDefault: isDark ? "rgba(240,236,228,0.6)" : "#888070",
    linkHoverBg: isDark ? "#1a1a1a" : "#f5f0e8",
    linkActiveBg: "#c8a96e",
    linkActiveText: isDark ? "#111010" : "#111010",
    userName: "#c8a96e",
    userEmail: isDark ? "rgba(240,236,228,0.4)" : "#aaa090",
    logoutBg: isDark ? "transparent" : "transparent",
    logoutBorder: isDark ? "#2a2a2a" : "#ddd8cc",
    logoutText: isDark ? "rgba(240,236,228,0.7)" : "#888070",
    logoutHoverBg: "#800020",
    logoutHoverText: "#f0ece4",
    toggleBg: isDark ? "#1a1a1a" : "#f0ece4",
    toggleBorder: isDark ? "#2a2a2a" : "#ddd8cc",
    mobileBg: isDark ? "#0d0d0d" : "#faf8f4",
    mobileBorder: isDark ? "#1e1e1e" : "#e8e4dc",
  };

  return (
    <>
      <header
        style={{
          background: t.bg,
          borderBottom: `1px solid ${t.border}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "background 0.4s ease, border-color 0.4s ease",
          // Force navbar font — never inherits from page
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link
            href="/customer/dashboard"
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: t.logo,
                letterSpacing: "0.04em",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.4s ease",
              }}
            >
              AMANDA CINEMA
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              // Hidden on mobile via inline media query workaround — use className below
            }}
            className="navbar-desktop-nav"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: 2,
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    background: active ? t.linkActiveBg : "transparent",
                    color: active ? t.linkActiveText : t.linkDefault,
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                  className={active ? "" : "nav-link-hover"}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: user info + theme toggle + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* User info — hidden on small screens */}
            <div className="navbar-user-info" style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.userName,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  transition: "color 0.4s ease",
                  lineHeight: 1.3,
                }}
              >
                {userInfo.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: t.userEmail,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  transition: "color 0.4s ease",
                }}
              >
                {userInfo.email}
              </div>
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: `1px solid ${t.toggleBorder}`,
                background: t.toggleBg,
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                transition: "background 0.4s ease, border-color 0.4s ease",
                padding: 0,
              }}
            >
              {/* Track icons */}
              <span
                style={{
                  position: "absolute",
                  left: 5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10,
                  opacity: isDark ? 0 : 1,
                  transition: "opacity 0.3s ease",
                  userSelect: "none",
                }}
              >
                ☀
              </span>
              <span
                style={{
                  position: "absolute",
                  right: 5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10,
                  opacity: isDark ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  userSelect: "none",
                }}
              >
                ☾
              </span>
              {/* Thumb */}
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isDark ? "calc(100% - 19px)" : 3,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#c8a96e",
                  transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  display: "block",
                }}
              />
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              style={{
                padding: "7px 16px",
                borderRadius: 2,
                border: `1px solid ${t.logoutBorder}`,
                background: t.logoutBg,
                color: t.logoutText,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              className="logout-btn"
            >
              Logout
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="navbar-hamburger"
              aria-label="Toggle menu"
              style={{
                background: "none",
                border: `1px solid ${t.toggleBorder}`,
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: 2,
                display: "none",
                flexDirection: "column",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <span style={{ display: "block", width: 18, height: 1, background: t.linkDefault }} />
              <span style={{ display: "block", width: 18, height: 1, background: t.linkDefault }} />
              <span style={{ display: "block", width: 18, height: 1, background: t.linkDefault }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          style={{
            maxHeight: menuOpen ? 300 : 0,
            overflow: "hidden",
            transition: "max-height 0.35s ease",
            background: t.mobileBg,
            borderTop: menuOpen ? `1px solid ${t.mobileBorder}` : "none",
          }}
        >
          <nav style={{ padding: "12px 24px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textDecoration: "none",
                    padding: "10px 14px",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                    background: active ? t.linkActiveBg : "transparent",
                    color: active ? t.linkActiveText : t.linkDefault,
                    borderRadius: 2,
                    transition: "background 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <style>{`
        .nav-link-hover:hover {
          background: ${t.linkHoverBg} !important;
          color: #c8a96e !important;
        }
        .logout-btn:hover {
          background: #800020 !important;
          border-color: #800020 !important;
          color: #f0ece4 !important;
        }

        /* Desktop: show nav, hide hamburger */
        @media (min-width: 768px) {
          .navbar-desktop-nav { display: flex !important; }
          .navbar-hamburger { display: none !important; }
          .navbar-user-info { display: block !important; }
        }

        /* Mobile: hide nav links, show hamburger */
        @media (max-width: 767px) {
          .navbar-desktop-nav { display: none !important; }
          .navbar-hamburger { display: flex !important; }
          .navbar-user-info { display: none !important; }
        }

        /* Tablet: hide user email only */
        @media (max-width: 1024px) and (min-width: 768px) {
          .navbar-user-info { display: none !important; }
        }
      `}</style>
    </>
  );
}