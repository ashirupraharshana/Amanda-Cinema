"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";

interface BookingShowtime {
  id: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface BookingMovie {
  id: number;
  title: string;
}

interface Booking {
  id: number;
  bookingCode: string;
  totalAmount: number;
  seatNumbers: string;
  totalSeats: number;
  bookingStatus: string;
  paymentStatus: string;
  bookingTime: string;
  movie: BookingMovie;
  showtime: BookingShowtime;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatBookingTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
    cardHover:     isDark ? "#141414" : "#f7f4ee",
    seatBg:        isDark ? "#1a1a1a" : "#f0ece4",
    seatBorder:    isDark ? "#2a2a2a" : "#d8d2c4",
    seatText:      isDark ? "#c8a96e" : "#8a6e3a",
    filterBorder:  isDark ? "#2a2a2a" : "#ddd8cc",
    filterText:    isDark ? "#888"    : "#aaa090",
    emptyBg:       isDark ? "#0f0f0f" : "#ffffff",
    emptyBorder:   isDark ? "#1a1a1a" : "#eae6de",
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("You must be logged in to view bookings.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/bookings/user/${userId}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load bookings");
        setBookings(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load your bookings. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter((b) => b.bookingStatus === filter);

  const statusColor = (status: string) => {
    if (status === "CONFIRMED") return "#6fcf97";
    if (status === "CANCELLED") return "#e57373";
    return t.gold;
  };

  const paymentColor = (status: string) => {
    if (status === "PAID")    return "#6fcf97";
    if (status === "PENDING") return t.gold;
    return t.metaText;
  };

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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(40px,6vw,64px) clamp(20px,4vw,48px) 96px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", color: t.goldMuted, textTransform: "uppercase", marginBottom: 14, fontFamily: t.sansFont, transition: "color 0.4s ease" }}>
            Account
          </p>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, color: t.pageText, margin: "0 0 20px", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
            My Bookings
          </h1>
          <div style={{ width: 48, height: 2, background: t.gold }} />
        </div>

        {/* Filter bar */}
        {!loading && !error && bookings.length > 0 && (
          <div style={{ display: "flex", gap: 2, marginBottom: 40, flexWrap: "wrap" }}>
            {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((f) => {
              const active = filter === f;
              const count  = f === "ALL" ? bookings.length : bookings.filter((b) => b.bookingStatus === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "8px 20px",
                    border: active ? `1px solid ${t.gold}` : `1px solid ${t.filterBorder}`,
                    background: active ? t.gold : "transparent",
                    color: active ? "#080808" : t.filterText,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: t.sansFont,
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                >
                  {f} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "80px 0" }}>
            <div style={{ width: 1, height: 40, background: t.gold }} />
            <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>
              Loading your bookings...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: isDark ? "#2a0a0a" : "#fff0f0", border: `1px solid ${isDark ? "#5a1a1a" : "#ffcccc"}`, padding: "20px 24px" }}>
            <p style={{ color: "#e57373", fontFamily: t.sansFont, margin: 0, fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              background: t.emptyBg,
              border: `1px solid ${t.emptyBorder}`,
              padding: "64px 32px",
              textAlign: "center",
              transition: "background 0.4s ease",
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `1px solid ${t.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22 }}>
              🎬
            </div>
            <p style={{ fontSize: 18, color: t.pageText, fontFamily: t.serifFont, margin: "0 0 8px", transition: "color 0.4s ease" }}>
              {filter === "ALL" ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
            </p>
            <p style={{ fontSize: 13, color: t.labelText, fontFamily: t.sansFont, margin: "0 0 28px" }}>
              {filter === "ALL" ? "Book your first film to see it here." : "Try a different filter."}
            </p>
            {filter === "ALL" && (
              <button
                onClick={() => router.push("/customer/movies")}
                style={{ padding: "12px 28px", background: t.gold, border: `1px solid ${t.gold}`, color: "#080808", cursor: "pointer", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: t.sansFont }}
              >
                Browse Films
              </button>
            )}
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map((booking) => {
              const isExpanded = expandedId === booking.id;
              const seats = booking.seatNumbers
                ? booking.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={booking.id}
                  style={{
                    background: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    overflow: "hidden",
                    transition: "background 0.4s ease, border-color 0.4s ease",
                  }}
                >
                  {/* Status top strip */}
                  <div style={{ height: 3, background: statusColor(booking.bookingStatus) }} />

                  {/* Main row — always visible */}
                  <div
                    style={{
                      padding: "20px 24px",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 16,
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  >
                    {/* Left: movie + date */}
                    <div style={{ display: "flex", gap: "clamp(16px,3vw,40px)", flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Film</p>
                        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: t.pageText, margin: 0, fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
                          {booking.movie.title}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Date</p>
                        <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>
                          {formatDate(booking.showtime.showDate)}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Time</p>
                        <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>
                          {formatTime(booking.showtime.startTime)}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Total</p>
                        <p style={{ fontSize: 15, color: t.gold, margin: 0, fontFamily: t.sansFont, fontWeight: 600 }}>
                          Rs. {Number(booking.totalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Right: status badges + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {/* Payment status */}
                      <span style={{
                        padding: "4px 10px",
                        border: `1px solid ${paymentColor(booking.paymentStatus)}`,
                        color: paymentColor(booking.paymentStatus),
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontFamily: t.sansFont,
                        fontWeight: 600,
                        background: "transparent",
                        whiteSpace: "nowrap",
                      }}>
                        {booking.paymentStatus}
                      </span>

                      {/* Chevron */}
                      <span style={{ color: t.labelText, fontSize: 12, transition: "transform 0.2s ease", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  <div
                    style={{
                      maxHeight: isExpanded ? 500 : 0,
                      overflow: "hidden",
                      transition: "max-height 0.35s ease",
                    }}
                  >
                    <div style={{ borderTop: `1px solid ${t.divider}`, padding: "24px 24px 28px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20, marginBottom: 24 }}>

                        {/* Booking code */}
                        <div>
                          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Booking Code</p>
                          <p style={{ fontSize: 11, color: t.gold, margin: 0, fontFamily: "monospace", letterSpacing: "0.06em", wordBreak: "break-all" }}>
                            {booking.bookingCode}
                          </p>
                        </div>

                        {/* Showtime end */}
                        <div>
                          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Showtime</p>
                          <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>
                            {formatTime(booking.showtime.startTime)} — {formatTime(booking.showtime.endTime)}
                          </p>
                        </div>

                        {/* Total seats */}
                        <div>
                          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Seats Booked</p>
                          <p style={{ fontSize: 15, color: t.pageText, margin: 0, fontFamily: t.sansFont, fontWeight: 600, transition: "color 0.4s ease" }}>
                            {booking.totalSeats}
                          </p>
                        </div>

                        {/* Booked at */}
                        {booking.bookingTime && (
                          <div>
                            <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Booked At</p>
                            <p style={{ fontSize: 12, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>
                              {formatBookingTime(booking.bookingTime)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Seat chips */}
                      {seats.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 10px", fontFamily: t.sansFont }}>Your Seats</p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {seats.map((seat) => (
                              <span
                                key={seat}
                                style={{
                                  padding: "5px 12px",
                                  background: t.seatBg,
                                  border: `1px solid ${t.seatBorder}`,
                                  fontSize: 12,
                                  fontFamily: t.sansFont,
                                  fontWeight: 600,
                                  letterSpacing: "0.08em",
                                  color: t.seatText,
                                  borderRadius: 2,
                                  transition: "background 0.4s ease",
                                }}
                              >
                                {seat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {/* View confirmation — only if paid */}
                        {booking.paymentStatus === "PAID" && (
                          <button
                            onClick={() => router.push(
                              `/customer/booking-confirmation` +
                              `?bookingCode=${encodeURIComponent(booking.bookingCode)}` +
                              `&totalAmount=${encodeURIComponent(String(booking.totalAmount))}` +
                              `&seats=${encodeURIComponent(booking.seatNumbers)}` +
                              `&showtimeId=${encodeURIComponent(String(booking.showtime.id))}`
                            )}
                            style={{
                              padding: "10px 20px",
                              background: t.gold,
                              border: `1px solid ${t.gold}`,
                              color: "#080808",
                              cursor: "pointer",
                              fontSize: 11,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              fontFamily: t.sansFont,
                            }}
                          >
                            View Ticket
                          </button>
                        )}

                        {/* Complete payment — if pending */}
                        {booking.paymentStatus === "PENDING" && (
                          <button
                            onClick={() => router.push(`/customer/payment?bookingId=${booking.id}`)}
                            style={{
                              padding: "10px 20px",
                              background: "transparent",
                              border: `1px solid ${t.gold}`,
                              color: t.gold,
                              cursor: "pointer",
                              fontSize: 11,
                              letterSpacing: "0.15em",
                              textTransform: "uppercase",
                              fontWeight: 600,
                              fontFamily: t.sansFont,
                              transition: "all 0.2s ease",
                            }}
                            className="pay-btn"
                          >
                            Complete Payment
                          </button>
                        )}

                        {/* Browse more */}
                        <button
                          onClick={() => router.push("/customer/movies")}
                          style={{
                            padding: "10px 20px",
                            background: "transparent",
                            border: `1px solid ${t.divider}`,
                            color: t.metaText,
                            cursor: "pointer",
                            fontSize: 11,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                            fontFamily: t.sansFont,
                            transition: "all 0.2s ease",
                          }}
                          className="browse-btn"
                        >
                          Browse Films
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .pay-btn:hover    { background: ${t.gold} !important; color: #080808 !important; }
        .browse-btn:hover { border-color: ${t.gold} !important; color: ${t.gold} !important; }
      `}</style>
    </main>
  );
}