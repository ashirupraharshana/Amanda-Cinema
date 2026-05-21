"use client";

import { useAuth } from "../../context/AuthContext";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard",  icon: "⊞" },
  { href: "/admin/movies",    label: "Movies",      icon: "🎬" },
  { href: "/admin/theaters",  label: "Theaters",    icon: "🏛" },
  { href: "/admin/showtimes", label: "Showtimes",   icon: "🕐" },
  { href: "/admin/bookings",  label: "Bookings",    icon: "🎟" },
  { href: "/admin/users",     label: "Users",       icon: "👥" },
];

export default function AdminNavbar() {
  const { logout }              = useAuth();
  const { isDark, toggleTheme } = useAdminTheme();
  const pathname                = usePathname();

  const [userInfo, setUserInfo]       = useState({ name: "", email: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // desktop expand/collapse

  useEffect(() => {
    setUserInfo({
      name:  localStorage.getItem("userName")  || "Admin",
      email: localStorage.getItem("userEmail") || "",
    });
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const t = {
    navBg:         isDark ? "#0d0d0d"              : "#ffffff",
    navBorder:     isDark ? "#1a1a1a"              : "#e8e4dc",
    sideBg:        isDark ? "#080808"              : "#faf8f4",
    sideBorder:    isDark ? "#1a1a1a"              : "#e8e4dc",
    gold:          "#c8a96e",
    pageText:      isDark ? "#f0ece4"              : "#1a1814",
    metaText:      isDark ? "rgba(240,236,228,0.45)": "#aaa090",
    linkDefault:   isDark ? "rgba(240,236,228,0.5)" : "#888070",
    linkHoverBg:   isDark ? "#141414"              : "#f0ece4",
    linkActiveBg:  "#c8a96e",
    linkActiveText:"#080808",
    toggleBg:      isDark ? "#1a1a1a"              : "#f0ece4",
    toggleBorder:  isDark ? "#2a2a2a"              : "#ddd8cc",
    logoutBorder:  isDark ? "#2a2a2a"              : "#ddd8cc",
    logoutText:    isDark ? "rgba(240,236,228,0.6)" : "#888070",
    overlay:       "rgba(0,0,0,0.65)",
    sans:          "'Helvetica Neue', Arial, sans-serif",
    serif:         "'Georgia', 'Times New Roman', serif",
    labelText:     isDark ? "#555" : "#bbb4a0",
  };

  const sideW     = sidebarExpanded ? 220 : 64;
  const topbarH   = 60;

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: topbarH,
          background: t.navBg,
          borderBottom: `1px solid ${t.navBorder}`,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px 0 0",
          fontFamily: t.sans,
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Left: hamburger + logo */}
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          {/* Sidebar toggle — desktop collapses, mobile opens overlay */}
          <button
            onClick={() => {
              if (window.innerWidth >= 1024) setSidebarExpanded((v) => !v);
              else setSidebarOpen((v) => !v);
            }}
            aria-label="Toggle sidebar"
            style={{
              width: 60,
              height: "100%",
              background: "none",
              border: "none",
              borderRight: `1px solid ${t.navBorder}`,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              flexShrink: 0,
              transition: "background 0.15s ease",
            }}
            className="hamburger-btn"
          >
            <span style={{ display: "block", width: 18, height: 1.5, background: t.linkDefault, borderRadius: 1 }} />
            <span style={{ display: "block", width: 18, height: 1.5, background: t.linkDefault, borderRadius: 1 }} />
            <span style={{ display: "block", width: 18, height: 1.5, background: t.linkDefault, borderRadius: 1 }} />
          </button>

          {/* Logo */}
          <Link href="/admin/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: t.gold, letterSpacing: "0.06em", fontFamily: t.sans, transition: "color 0.4s ease" }}>
              AMANDA CINEMA
            </span>
            <span style={{ padding: "2px 8px", background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.3)", color: t.gold, fontSize: 9, letterSpacing: "0.2em", fontFamily: t.sans, fontWeight: 700 }}>
              ADMIN
            </span>
          </Link>
        </div>

        {/* Right: theme toggle + user + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* User info — hidden on small */}
          <div className="admin-user-info" style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: t.gold, margin: 0, fontFamily: t.sans, lineHeight: 1.3 }}>{userInfo.name}</p>
            <p style={{ fontSize: 11, color: t.metaText, margin: 0, fontFamily: t.sans }}>{userInfo.email}</p>
          </div>

          {/* Dark/light toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: 44, height: 24,
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
            <span style={{ position: "absolute", left: 5, top: "50%", transform: "translateY(-50%)", fontSize: 10, opacity: isDark ? 0 : 1, transition: "opacity 0.3s ease", userSelect: "none" }}>☀</span>
            <span style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", fontSize: 10, opacity: isDark ? 1 : 0, transition: "opacity 0.3s ease", userSelect: "none" }}>☾</span>
            <span style={{ position: "absolute", top: 3, left: isDark ? "calc(100% - 19px)" : 3, width: 16, height: 16, borderRadius: "50%", background: t.gold, transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)", display: "block" }} />
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              padding: "7px 16px",
              border: `1px solid ${t.logoutBorder}`,
              background: "transparent",
              color: t.logoutText,
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: t.sans,
              borderRadius: 1,
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 149 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: topbarH,
          left: 0,
          bottom: 0,
          width: sideW,
          background: t.sideBg,
          borderRight: `1px solid ${t.sideBorder}`,
          zIndex: 150,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.4s ease, border-color 0.4s ease",
          // On mobile: slide in/out
        }}
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}
      >
        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                title={!sidebarExpanded ? link.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "11px 20px",
                  textDecoration: "none",
                  background: active ? "rgba(200,169,110,0.12)" : "transparent",
                  borderLeft: active ? `3px solid ${t.gold}` : "3px solid transparent",
                  transition: "background 0.15s ease, border-color 0.15s ease",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
                className="sidebar-link"
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{link.icon}</span>
                <span
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    fontWeight: active ? 600 : 400,
                    color: active ? t.gold : t.linkDefault,
                    fontFamily: t.sans,
                    textTransform: "uppercase",
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: expand/collapse toggle (desktop only) */}
        <div
          style={{
            borderTop: `1px solid ${t.sideBorder}`,
            padding: "12px 0",
            transition: "border-color 0.4s ease",
          }}
        >
          <button
            onClick={() => setSidebarExpanded((v) => !v)}
            className="sidebar-collapse-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 20px",
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 14, color: t.labelText, flexShrink: 0, width: 24, textAlign: "center", transition: "transform 0.3s ease", display: "inline-block", transform: sidebarExpanded ? "rotate(0deg)" : "rotate(180deg)" }}>
              ◂
            </span>
            <span style={{ fontSize: 11, color: t.labelText, fontFamily: t.sans, letterSpacing: "0.1em", opacity: sidebarExpanded ? 1 : 0, transition: "opacity 0.2s ease" }}>
              COLLAPSE
            </span>
          </button>
        </div>
      </aside>

      {/* ── SPACER — pushes page content right of sidebar and below topbar ── */}
      <div
        style={{ paddingTop: topbarH, paddingLeft: sideW, transition: "padding-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}
        id="admin-layout-spacer"
      />

      <style>{`
        .hamburger-btn:hover { background: ${t.linkHoverBg} !important; }
        .sidebar-link:hover  { background: ${t.linkHoverBg} !important; }
        .admin-logout-btn:hover { background: #800020 !important; border-color: #800020 !important; color: #f0ece4 !important; }
        .sidebar-collapse-btn:hover span { color: ${t.gold} !important; }

        /* Desktop: sidebar always visible */
        @media (min-width: 1024px) {
          .admin-sidebar { transform: translateX(0) !important; }
          .admin-user-info { display: block !important; }
        }

        /* Mobile: sidebar hidden by default, slides in */
        @media (max-width: 1023px) {
          .admin-sidebar {
            width: 220px !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease, background 0.4s ease !important;
          }
          .admin-sidebar--open {
            transform: translateX(0) !important;
          }
          #admin-layout-spacer {
            padding-left: 0 !important;
          }
          .admin-user-info { display: none !important; }
          .sidebar-collapse-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}