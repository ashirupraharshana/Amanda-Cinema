"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "../components/Navbar";

const API_BASE = "http://localhost:8080";

interface Booking {
  id: number;
  bookingCode: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  totalSeats: number;
  seatNumbers: string;
  bookingTime: string;
  movieTitle: string;
  customerName: string;
  customerEmail: string;
  showDate: string;
  startTime: string;
}

type FilterStatus = "ALL" | "CONFIRMED" | "PENDING" | "CANCELLED";
type FilterPayment = "ALL" | "PAID" | "PENDING" | "FAILED";

const sans = "'Helvetica Neue', Arial, sans-serif";
const serif = "'Georgia', 'Times New Roman', serif";

const gold        = "#c8a96e";
const pageBg      = "#080808";
const pageText    = "#f0ece4";
const cardBg      = "#0d0d0d";
const cardBorder  = "#1a1a1a";
const divider     = "#1e1e1e";
const labelText   = "#555";
const metaText    = "#a09880";
const inputBg     = "#111";
const inputBorder = "#2a2a2a";

function statusColor(s: string) {
  if (s === "CONFIRMED") return { color: "#6fcf97", bg: "rgba(111,207,151,0.08)", border: "rgba(111,207,151,0.25)" };
  if (s === "CANCELLED") return { color: "#e57373", bg: "rgba(229,115,115,0.08)", border: "rgba(229,115,115,0.25)" };
  return { color: gold, bg: "rgba(200,169,110,0.08)", border: "rgba(200,169,110,0.25)" };
}

function paymentColor(s: string) {
  if (s === "PAID")   return { color: "#6fcf97", bg: "rgba(111,207,151,0.08)", border: "rgba(111,207,151,0.25)" };
  if (s === "FAILED") return { color: "#e57373", bg: "rgba(229,115,115,0.08)", border: "rgba(229,115,115,0.25)" };
  return { color: gold, bg: "rgba(200,169,110,0.08)", border: "rgba(200,169,110,0.25)" };
}

function formatDate(d?: string) {
  if (!d) return "-";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(t?: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatBookingTime(s?: string) {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

// ── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, scheme }: { label: string; scheme: { color: string; bg: string; border: string } }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      background: scheme.bg,
      border: `1px solid ${scheme.border}`,
      color: scheme.color,
      fontSize: 9,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      fontFamily: sans,
      fontWeight: 700,
      borderRadius: 1,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, padding: "22px 20px" }}>
      <p style={{ fontSize: 9, letterSpacing: "0.28em", color: labelText, textTransform: "uppercase", margin: "0 0 10px", fontFamily: sans }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 400, color: accent, margin: "0 0 4px", fontFamily: serif, letterSpacing: "-0.01em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: metaText, margin: 0, fontFamily: sans }}>{sub}</p>
    </div>
  );
}

export default function ManageBookingsPage() {
  const router = useRouter();
  const { isLoading, userRole } = useAuth();

  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>("ALL");
  const [filterPayment, setFilterPayment] = useState<FilterPayment>("ALL");
  const [expandedId, setExpandedId]       = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const readJson = async (res: Response) => {
    const text = await res.text();
    if (!res.ok) {
      if (text.includes("<html")) throw new Error("Authentication failed. Please log in again.");
      try { const e = JSON.parse(text); throw new Error(e.error || "Request failed"); }
      catch { throw new Error(text || "Request failed"); }
    }
    try { return JSON.parse(text); }
    catch { throw new Error("Server returned invalid JSON."); }
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token. Please log in again.");
      const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await readJson(res);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") router.push("/customer/dashboard");
  }, [isLoading, userRole, router]);

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") fetchBookings();
  }, [isLoading, userRole, fetchBookings]);

  const updateStatus = async (bookingId: number, status: string) => {
    setActionLoading(bookingId);
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token.");
      const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      await readJson(res);
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBooking = async (bookingId: number) => {
    setActionLoading(bookingId);
    setDeleteConfirmId(null);
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token.");
      const res = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      await readJson(res);
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.bookingCode?.toLowerCase().includes(q) ||
      b.movieTitle?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.customerEmail?.toLowerCase().includes(q);
    const matchStatus  = filterStatus  === "ALL" || b.bookingStatus  === filterStatus;
    const matchPayment = filterPayment === "ALL" || b.paymentStatus  === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalRevenue  = bookings.filter((b) => b.paymentStatus === "PAID").reduce((s, b) => s + Number(b.totalAmount), 0);
  const pendingCount  = bookings.filter((b) => b.paymentStatus === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === "CONFIRMED").length;

  if (isLoading || (loading && bookings.length === 0)) {
    return (
      <div style={{ minHeight: "100vh", background: pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 1, height: 48, background: gold }} />
          <p style={{ color: labelText, fontFamily: sans, fontSize: 13, letterSpacing: "0.1em" }}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: pageBg, color: pageText, fontFamily: serif }}>
      <AdminNavbar />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(40px,5vw,64px) clamp(20px,4vw,48px) 96px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#9e8a6e", textTransform: "uppercase", margin: "0 0 14px", fontFamily: sans }}>
            Administration
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 400, color: pageText, margin: 0, letterSpacing: "-0.02em" }}>
              Manage Bookings
            </h1>
            <button
              onClick={fetchBookings}
              disabled={loading}
              style={{
                padding: "10px 24px",
                background: "transparent",
                border: `1px solid ${inputBorder}`,
                color: metaText,
                cursor: loading ? "wait" : "pointer",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: sans,
                fontWeight: 600,
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1,
              }}
              className="refresh-btn"
            >
              {loading ? "Refreshing..." : "↻  Refresh"}
            </button>
          </div>
          <div style={{ width: 48, height: 2, background: gold, marginTop: 20 }} />
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px,20vw,200px),1fr))", gap: 2, marginBottom: 48 }}>
          <StatCard label="Total Bookings"   value={String(bookings.length)}                              sub="all time"         accent={gold} />
          <StatCard label="Confirmed"        value={String(confirmedCount)}                               sub="bookings"         accent="#6fcf97" />
          <StatCard label="Pending Payment"  value={String(pendingCount)}                                 sub={pendingCount > 0 ? "needs attention" : "all clear"} accent={pendingCount > 0 ? "#e57373" : "#6fcf97"} />
          <StatCard label="Total Revenue"    value={`Rs. ${totalRevenue.toLocaleString()}`}               sub="paid bookings"    accent={gold} />
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "rgba(229,115,115,0.08)", border: "1px solid rgba(229,115,115,0.25)", padding: "14px 20px", marginBottom: 24 }}>
            <p style={{ color: "#e57373", fontSize: 13, margin: 0, fontFamily: sans }}>{error}</p>
          </div>
        )}

        {/* ── Filters + search ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, film, customer…"
              style={{
                width: "100%",
                padding: "11px 16px 11px 38px",
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: pageText,
                outline: "none",
                fontFamily: sans,
                fontSize: 12,
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = gold)}
              onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: labelText, fontSize: 13 }}>⌕</span>
          </div>

          {/* Status filter */}
          {(["ALL","CONFIRMED","PENDING","CANCELLED"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                padding: "9px 16px",
                border: filterStatus === f ? `1px solid ${gold}` : `1px solid ${inputBorder}`,
                background: filterStatus === f ? gold : "transparent",
                color: filterStatus === f ? "#080808" : labelText,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: sans,
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              {f}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: divider, flexShrink: 0 }} />

          {/* Payment filter */}
          {(["ALL","PAID","PENDING","FAILED"] as FilterPayment[]).map((f) => (
            <button
              key={`pay-${f}`}
              onClick={() => setFilterPayment(f)}
              style={{
                padding: "9px 16px",
                border: filterPayment === f ? `1px solid ${gold}` : `1px solid ${inputBorder}`,
                background: filterPayment === f ? gold : "transparent",
                color: filterPayment === f ? "#080808" : labelText,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: sans,
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              {f}
            </button>
          ))}

          <span style={{ fontSize: 11, color: labelText, fontFamily: sans, marginLeft: "auto", whiteSpace: "nowrap" }}>
            {filtered.length} / {bookings.length} bookings
          </span>
        </div>

        {/* ── Bookings list ── */}
        {filtered.length === 0 ? (
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, padding: "64px 32px", textAlign: "center" }}>
            <p style={{ fontSize: 18, color: metaText, fontFamily: serif, margin: "0 0 8px" }}>No bookings found</p>
            <p style={{ fontSize: 13, color: labelText, fontFamily: sans, margin: 0 }}>
              {search || filterStatus !== "ALL" || filterPayment !== "ALL" ? "Try adjusting your filters." : "No bookings have been made yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 1fr 120px 80px 100px 110px 130px 100px",
                gap: 0,
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                padding: "12px 20px",
              }}
            >
              {["Booking Code","Film","Customer","Showtime","Seats","Amount","Payment","Status","Actions"].map((h) => (
                <span key={h} style={{ fontSize: 9, letterSpacing: "0.22em", color: labelText, textTransform: "uppercase", fontFamily: sans, fontWeight: 600 }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.map((booking) => {
              const isExpanded = expandedId === booking.id;
              const isActing   = actionLoading === booking.id;
              const sc = statusColor(booking.bookingStatus || "PENDING");
              const pc = paymentColor(booking.paymentStatus || "PENDING");
              const seats = booking.seatNumbers
                ? booking.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={booking.id}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    overflow: "hidden",
                    transition: "border-color 0.2s ease",
                  }}
                  className="booking-row-wrap"
                >
                  {/* Status strip */}
                  <div style={{ height: 2, background: sc.color, opacity: 0.6 }} />

                  {/* Main row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 1fr 120px 80px 100px 110px 130px 100px",
                      gap: 0,
                      padding: "16px 20px",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    {/* Booking code */}
                    <div>
                      <p style={{ fontSize: 12, color: gold, margin: 0, fontFamily: "monospace", letterSpacing: "0.06em" }}>
                        {booking.bookingCode ? booking.bookingCode.slice(0, 8).toUpperCase() : "-"}
                      </p>
                      <p style={{ fontSize: 10, color: labelText, margin: "3px 0 0", fontFamily: sans }}>
                        #{booking.id}
                      </p>
                    </div>

                    {/* Film */}
                    <p style={{ fontSize: 13, color: pageText, margin: 0, fontFamily: serif, paddingRight: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {booking.movieTitle || "—"}
                    </p>

                    {/* Customer */}
                    <div style={{ paddingRight: 12 }}>
                      <p style={{ fontSize: 13, color: pageText, margin: "0 0 2px", fontFamily: sans, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {booking.customerName || "—"}
                      </p>
                      <p style={{ fontSize: 11, color: metaText, margin: 0, fontFamily: sans, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {booking.customerEmail || ""}
                      </p>
                    </div>

                    {/* Showtime */}
                    <div>
                      <p style={{ fontSize: 12, color: metaText, margin: 0, fontFamily: sans }}>
                        {formatDate(booking.showDate)}
                      </p>
                      <p style={{ fontSize: 11, color: labelText, margin: "2px 0 0", fontFamily: sans }}>
                        {formatTime(booking.startTime)}
                      </p>
                    </div>

                    {/* Seats count */}
                    <p style={{ fontSize: 15, color: pageText, margin: 0, fontFamily: serif }}>
                      {booking.totalSeats ?? 0}
                    </p>

                    {/* Amount */}
                    <p style={{ fontSize: 13, color: gold, margin: 0, fontFamily: sans, fontWeight: 600 }}>
                      Rs. {Number(booking.totalAmount || 0).toLocaleString()}
                    </p>

                    {/* Payment badge */}
                    <div>
                      <Badge label={booking.paymentStatus || "PENDING"} scheme={pc} />
                    </div>

                    {/* Status dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={booking.bookingStatus || "PENDING"}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        disabled={isActing}
                        style={{
                          padding: "6px 10px",
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          color: sc.color,
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          fontFamily: sans,
                          fontWeight: 600,
                          cursor: isActing ? "wait" : "pointer",
                          outline: "none",
                          appearance: "none",
                          width: "100%",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = gold)}
                        onBlur={(e)  => (e.target.style.borderColor = inputBorder)}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    {/* Delete */}
                    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", justifyContent: "flex-end" }}>
                      {deleteConfirmId === booking.id ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            disabled={isActing}
                            style={{
                              padding: "6px 10px",
                              background: "rgba(229,115,115,0.15)",
                              border: "1px solid rgba(229,115,115,0.4)",
                              color: "#e57373",
                              cursor: "pointer",
                              fontSize: 9,
                              letterSpacing: "0.15em",
                              fontFamily: sans,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {isActing ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            style={{
                              padding: "6px 10px",
                              background: "transparent",
                              border: `1px solid ${inputBorder}`,
                              color: labelText,
                              cursor: "pointer",
                              fontSize: 9,
                              letterSpacing: "0.15em",
                              fontFamily: sans,
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(booking.id)}
                          disabled={isActing}
                          style={{
                            padding: "7px 14px",
                            background: "transparent",
                            border: "1px solid rgba(229,115,115,0.3)",
                            color: "#e57373",
                            cursor: isActing ? "wait" : "pointer",
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            fontFamily: sans,
                            fontWeight: 600,
                            transition: "all 0.15s ease",
                            opacity: isActing ? 0.5 : 1,
                          }}
                          className="delete-btn"
                        >
                          {isActing ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  <div
                    style={{
                      maxHeight: isExpanded ? 240 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.35s ease",
                    }}
                  >
                    <div style={{ borderTop: `1px solid ${divider}`, padding: "20px 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 20 }}>
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.22em", color: labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: sans }}>Full Booking Code</p>
                        <p style={{ fontSize: 11, color: gold, margin: 0, fontFamily: "monospace", letterSpacing: "0.05em", wordBreak: "break-all" }}>
                          {booking.bookingCode || "—"}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.22em", color: labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: sans }}>Booked At</p>
                        <p style={{ fontSize: 12, color: metaText, margin: 0, fontFamily: sans }}>
                          {formatBookingTime(booking.bookingTime)}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.22em", color: labelText, textTransform: "uppercase", margin: "0 0 8px", fontFamily: sans }}>
                          Seats ({booking.totalSeats || seats.length})
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {seats.map((seat) => (
                            <span
                              key={seat}
                              style={{
                                padding: "3px 8px",
                                background: "rgba(200,169,110,0.1)",
                                border: "1px solid rgba(200,169,110,0.25)",
                                color: gold,
                                fontSize: 10,
                                fontFamily: sans,
                                fontWeight: 600,
                                letterSpacing: "0.08em",
                                borderRadius: 1,
                              }}
                            >
                              {seat}
                            </span>
                          ))}
                          {seats.length === 0 && <span style={{ color: labelText, fontSize: 12, fontFamily: sans }}>—</span>}
                        </div>
                      </div>

                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.22em", color: labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: sans }}>Price per Seat</p>
                        <p style={{ fontSize: 14, color: pageText, margin: 0, fontFamily: serif }}>
                          Rs. {booking.totalSeats > 0 ? (Number(booking.totalAmount) / booking.totalSeats).toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Responsive table scroll hint on small screens */}
      <style>{`
        .refresh-btn:hover { border-color: ${gold} !important; color: ${gold} !important; }
        .delete-btn:hover  { background: rgba(229,115,115,0.12) !important; border-color: rgba(229,115,115,0.5) !important; }
        .booking-row-wrap:hover { border-color: rgba(200,169,110,0.2) !important; }

        @media (max-width: 1100px) {
          /* Wrap columns for smaller screens */
          .booking-row-wrap > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 12px !important;
          }
        }

        @media (max-width: 700px) {
          .booking-row-wrap > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}