"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  hasPassword: boolean;
}

type ActiveSection = "profile" | "password";

export default function ProfilePage() {
  const router   = useRouter();
  const { isDark }  = useTheme();
  const { logout }  = useAuth();

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const t = {
    pageBg:        isDark ? "#080808" : "#faf8f4",
    pageText:      isDark ? "#f0ece4" : "#1a1814",
    gold:          "#c8a96e",
    goldMuted:     isDark ? "#9e8a6e" : "#a08a5a",
    sansFont:      "'Helvetica Neue', Arial, sans-serif",
    serifFont:     "'Georgia', 'Times New Roman', serif",
    divider:       isDark ? "#1e1e1e" : "#e0dbd0",
    labelText:     isDark ? "#555"    : "#bbb4a0",
    metaText:      isDark ? "#a09880" : "#7a6e5a",
    cardBg:        isDark ? "#0f0f0f" : "#ffffff",
    cardBorder:    isDark ? "#1a1a1a" : "#eae6de",
    inputBg:       isDark ? "#111"    : "#fff",
    inputBorder:   isDark ? "#2a2a2a" : "#d8d2c4",
    inputText:     isDark ? "#f0ece4" : "#1a1814",
    inputFocus:    "#c8a96e",
    successBg:     isDark ? "#0a2a0a" : "#f0fff4",
    successBorder: isDark ? "#1a5a1a" : "#b2dfdb",
    errorBg:       isDark ? "#2a0a0a" : "#fff0f0",
    errorBorder:   isDark ? "#5a1a1a" : "#ffcccc",
    tabActive:     "#c8a96e",
    tabInactive:   isDark ? "#2a2a2a" : "#ddd8cc",
    dangerText:    "#e57373",
    dangerBorder:  isDark ? "#5a1a1a" : "#ffcccc",
  };

  // ── State ───────────────────────────────────────────────────────────────────
  const [profile, setProfile]               = useState<UserProfile | null>(null);
  const [loading, setLoading]               = useState(true);
  const [activeSection, setActiveSection]   = useState<ActiveSection>("profile");

  // Profile edit
  const [editName, setEditName]             = useState("");
  const [savingProfile, setSavingProfile]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError]     = useState<string | null>(null);

  // Password change
  const [currentPw, setCurrentPw]           = useState("");
  const [newPw, setNewPw]                   = useState("");
  const [confirmPw, setConfirmPw]           = useState("");
  const [showCurrentPw, setShowCurrentPw]   = useState(false);
  const [showNewPw, setShowNewPw]           = useState(false);
  const [savingPw, setSavingPw]             = useState(false);
  const [pwSuccess, setPwSuccess]           = useState<string | null>(null);
  const [pwError, setPwError]               = useState<string | null>(null);

  // ── Fetch profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    fetch(`http://localhost:8080/api/users/${userId}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load profile");
        setProfile(data);
        setEditName(data.name);
      })
      .catch((err) => {
        console.error(err);
        setProfileError("Unable to load profile. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile name ───────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile) return;
    if (!editName.trim()) { setProfileError("Name cannot be empty."); return; }

    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      const res = await fetch(`http://localhost:8080/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setProfile(data);
      setEditName(data.name);
      localStorage.setItem("userName", data.name);
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!profile) return;

    setPwError(null);
    setPwSuccess(null);

    if (newPw.length < 6)    { setPwError("New password must be at least 6 characters."); return; }
if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
if (profile.hasPassword) {
  if (!currentPw)          { setPwError("Please enter your current password."); return; }
  if (newPw === currentPw) { setPwError("New password must be different from current password."); return; }
}

    setSavingPw(true);

    try {
      const res = await fetch(`http://localhost:8080/api/users/${profile.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Password change failed");

      setPwSuccess(profile.hasPassword ? "Password changed successfully." : "Password set successfully.");
setProfile({ ...profile, hasPassword: true });
setCurrentPw("");
setNewPw("");
setConfirmPw("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed.");
    } finally {
      setSavingPw(false);
    }
  };

  // ── Password strength ────────────────────────────────────────────────────────
  const pwStrength = (() => {
    if (!newPw) return null;
    if (newPw.length < 6)  return { label: "Too short",  color: "#e57373", width: "20%" };
    if (newPw.length < 8)  return { label: "Weak",       color: "#e57373", width: "35%" };
    const hasUpper  = /[A-Z]/.test(newPw);
    const hasNumber = /[0-9]/.test(newPw);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPw);
    const score     = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    if (score === 0) return { label: "Fair",      color: t.gold,      width: "55%" };
    if (score === 1) return { label: "Good",      color: "#81c784",   width: "75%" };
    return              { label: "Strong",     color: "#6fcf97",   width: "100%" };
  })();

  // ── Input style helper ───────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    color: t.inputText,
    outline: "none",
    fontFamily: t.sansFont,
    fontSize: 14,
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: t.labelText,
    marginBottom: 8,
    fontFamily: t.sansFont,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        color: t.pageText,
        fontFamily: t.serifFont,
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "clamp(40px,6vw,64px) clamp(20px,4vw,48px) 96px",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: t.goldMuted,
              textTransform: "uppercase",
              marginBottom: 14,
              fontFamily: t.sansFont,
              transition: "color 0.4s ease",
            }}
          >
            Account
          </p>
          <h1
            style={{
              fontSize: "clamp(32px,5vw,52px)",
              fontWeight: 400,
              color: t.pageText,
              margin: "0 0 20px",
              letterSpacing: "-0.02em",
              transition: "color 0.4s ease",
            }}
          >
            My Profile
          </h1>
          <div style={{ width: 48, height: 2, background: t.gold }} />
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "80px 0" }}>
            <div style={{ width: 1, height: 40, background: t.gold }} />
            <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>
              Loading profile...
            </p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Avatar + name summary */}
            <div
              style={{
                background: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                padding: "28px",
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
                transition: "background 0.4s ease, border-color 0.4s ease",
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(200,169,110,0.12)",
                  border: `1px solid rgba(200,169,110,0.3)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: t.gold,
                    fontFamily: t.serifFont,
                    lineHeight: 1,
                  }}
                >
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </span>
              </div>

              <div>
                <p style={{ fontSize: 20, color: t.pageText, margin: "0 0 4px", fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
                  {profile.name}
                </p>
                <p style={{ fontSize: 13, color: t.metaText, margin: "0 0 6px", fontFamily: t.sansFont }}>
                  {profile.email}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    border: `1px solid rgba(200,169,110,0.4)`,
                    color: t.gold,
                    fontSize: 9,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontFamily: t.sansFont,
                    fontWeight: 600,
                  }}
                >
                  {profile.role || "Customer"}
                </span>
              </div>
            </div>

            {/* Tab selector */}
            <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              {([
                { key: "profile",  label: "Edit Profile"    },
                { key: "password", label: profile.hasPassword ? "Change Password" : "Set Password" },
              ] as { key: ActiveSection; label: string }[]).map(({ key, label }) => {
                const active = activeSection === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveSection(key);
                      setProfileError(null);
                      setProfileSuccess(null);
                      setPwError(null);
                      setPwSuccess(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "13px 16px",
                      background: active ? t.gold : t.cardBg,
                      border: `1px solid ${active ? t.gold : t.cardBorder}`,
                      color: active ? "#080808" : t.metaText,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: t.sansFont,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* ── Edit Profile section ── */}
            {activeSection === "profile" && (
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  padding: "28px",
                  transition: "background 0.4s ease, border-color 0.4s ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Name field */}
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your full name"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = t.inputFocus)}
                      onBlur={(e)  => (e.target.style.borderColor = t.inputBorder)}
                    />
                  </div>

                  {/* Email — read only */}
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <div style={{ position: "relative" }}>
                      <input
                        value={profile.email}
                        readOnly
                        style={{
                          ...inputStyle,
                          color: t.metaText,
                          cursor: "not-allowed",
                          background: isDark ? "#0a0a0a" : "#f5f2ec",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          color: t.labelText,
                          fontFamily: t.sansFont,
                          textTransform: "uppercase",
                        }}
                      >
                        Read only
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: t.labelText, fontFamily: t.sansFont, margin: "6px 0 0" }}>
                      Email address cannot be changed.
                    </p>
                  </div>

                  {/* Success / error */}
                  {profileSuccess && (
                    <div style={{ background: t.successBg, border: `1px solid ${t.successBorder}`, padding: "13px 16px" }}>
                      <p style={{ color: "#6fcf97", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{profileSuccess}</p>
                    </div>
                  )}
                  {profileError && (
                    <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, padding: "13px 16px" }}>
                      <p style={{ color: "#e57373", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{profileError}</p>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || editName.trim() === profile.name}
                    style={{
                      padding: "14px",
                      background: (savingProfile || editName.trim() === profile.name) ? "transparent" : t.gold,
                      border: `1px solid ${(savingProfile || editName.trim() === profile.name) ? t.cardBorder : t.gold}`,
                      color: (savingProfile || editName.trim() === profile.name) ? t.labelText : "#080808",
                      cursor: (savingProfile || editName.trim() === profile.name) ? "not-allowed" : "pointer",
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      fontFamily: t.sansFont,
                      transition: "all 0.2s ease",
                      opacity: savingProfile ? 0.7 : 1,
                    }}
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Change Password section ── */}
            {activeSection === "password" && (
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  padding: "28px",
                  transition: "background 0.4s ease, border-color 0.4s ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {profile.hasPassword && (
  <div>
    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        placeholder="Enter current password"
                        style={{ ...inputStyle, paddingRight: 52 }}
                        onFocus={(e) => (e.target.style.borderColor = t.inputFocus)}
                        onBlur={(e)  => (e.target.style.borderColor = t.inputBorder)}
                      />
                      <button
                        onClick={() => setShowCurrentPw((v) => !v)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: t.labelText, cursor: "pointer", fontSize: 12, fontFamily: t.sansFont, padding: 0 }}
                      >
                        {showCurrentPw ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>
                )}

                  {/* New password */}
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="Min. 6 characters"
                        style={{ ...inputStyle, paddingRight: 52 }}
                        onFocus={(e) => (e.target.style.borderColor = t.inputFocus)}
                        onBlur={(e)  => (e.target.style.borderColor = t.inputBorder)}
                      />
                      <button
                        onClick={() => setShowNewPw((v) => !v)}
                        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: t.labelText, cursor: "pointer", fontSize: 12, fontFamily: t.sansFont, padding: 0 }}
                      >
                        {showNewPw ? "HIDE" : "SHOW"}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {pwStrength && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 2, background: t.divider, borderRadius: 1, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: pwStrength.width, background: pwStrength.color, transition: "width 0.3s ease, background 0.3s ease" }} />
                        </div>
                        <p style={{ fontSize: 10, color: pwStrength.color, fontFamily: t.sansFont, margin: "4px 0 0", letterSpacing: "0.1em" }}>
                          {pwStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm new password */}
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      style={{
                        ...inputStyle,
                        borderColor: confirmPw && newPw !== confirmPw ? "#e57373" : t.inputBorder,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = confirmPw && newPw !== confirmPw ? "#e57373" : t.inputFocus)}
                      onBlur={(e)  => (e.target.style.borderColor = confirmPw && newPw !== confirmPw ? "#e57373" : t.inputBorder)}
                    />
                    {confirmPw && newPw !== confirmPw && (
                      <p style={{ fontSize: 11, color: "#e57373", fontFamily: t.sansFont, margin: "6px 0 0" }}>
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Success / error */}
                  {pwSuccess && (
                    <div style={{ background: t.successBg, border: `1px solid ${t.successBorder}`, padding: "13px 16px" }}>
                      <p style={{ color: "#6fcf97", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{pwSuccess}</p>
                    </div>
                  )}
                  {pwError && (
                    <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, padding: "13px 16px" }}>
                      <p style={{ color: "#e57373", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{pwError}</p>
                    </div>
                  )}

                  {/* Change password button */}
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPw}
                    style={{
                      padding: "14px",
                      background: t.gold,
                      border: `1px solid ${t.gold}`,
                      color: "#080808",
                      cursor: savingPw ? "wait" : "pointer",
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      fontFamily: t.sansFont,
                      transition: "all 0.2s ease",
                      opacity: savingPw ? 0.7 : 1,
                    }}
                  >
                    {savingPw ? "Updating..." : profile.hasPassword ? "Change Password" : "Set Password"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Danger zone ── */}
            <div
              style={{
                marginTop: 32,
                background: t.cardBg,
                border: `1px solid ${t.dangerBorder}`,
                padding: "24px 28px",
                transition: "background 0.4s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 13, color: t.dangerText, fontFamily: t.sansFont, fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.05em" }}>
                    Sign Out
                  </p>
                  <p style={{ fontSize: 12, color: t.metaText, fontFamily: t.sansFont, margin: 0 }}>
                    You will be returned to the login page.
                  </p>
                </div>
                <button
                  onClick={logout}
                  style={{
                    padding: "10px 24px",
                    background: "transparent",
                    border: `1px solid ${t.dangerBorder}`,
                    color: t.dangerText,
                    cursor: "pointer",
                    fontSize: 11,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    fontFamily: t.sansFont,
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                  className="logout-danger-btn"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .logout-danger-btn:hover {
          background: #e57373 !important;
          border-color: #e57373 !important;
          color: #fff !important;
        }
      `}</style>
    </main>
  );
}