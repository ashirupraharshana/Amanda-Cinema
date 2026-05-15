"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface Movie {
  id: number;
  title: string;
  genre: string;
  durationMinutes: number;
  language?: string;
  rating?: string;
  primaryPhotoBase64?: string;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatBookingTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [userName, setUserName]     = useState("");
  const [userId, setUserId]         = useState<string | null>(null);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [movies, setMovies]         = useState<Movie[]>([]);
  const [loadingB, setLoadingB]     = useState(true);
  const [loadingM, setLoadingM]     = useState(true);

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const t = {
    pageBg:       isDark ? "#080808" : "#faf8f4",
    pageText:     isDark ? "#f0ece4" : "#1a1814",
    gold:         "#c8a96e",
    goldMuted:    isDark ? "#9e8a6e" : "#a08a5a",
    sansFont:     "'Helvetica Neue', Arial, sans-serif",
    serifFont:    "'Georgia', 'Times New Roman', serif",
    divider:      isDark ? "#1e1e1e" : "#e0dbd0",
    labelText:    isDark ? "#555"    : "#bbb4a0",
    metaText:     isDark ? "#a09880" : "#7a6e5a",
    cardBg:       isDark ? "#0f0f0f" : "#ffffff",
    cardBorder:   isDark ? "#1a1a1a" : "#eae6de",
    statBg:       isDark ? "#0d0d0d" : "#ffffff",
    statBorder:   isDark ? "#1a1a1a" : "#eae6de",
    noImgBg:      isDark ? "#1a1a1a" : "#ede9e0",
    noImgText:    isDark ? "#333"    : "#bbb4a0",
    gradFrom:     isDark ? "rgba(8,8,8,0.97)"  : "rgba(20,18,14,0.92)",
    gradMid:      isDark ? "rgba(8,8,8,0.2)"   : "rgba(20,18,14,0.15)",
    navCardBg:    isDark ? "#0f0f0f" : "#ffffff",
    navCardBorder:isDark ? "#1a1a1a" : "#eae6de",
    seatBg:       isDark ? "#1a1a1a" : "#f0ece4",
    seatBorder:   isDark ? "#2a2a2a" : "#d8d2c4",
    seatText:     isDark ? "#c8a96e" : "#8a6e3a",
  };

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "Guest";
    const storedId   = localStorage.getItem("userId");
    setUserName(storedName);
    setUserId(storedId);

    // Fetch bookings
    if (storedId) {
      fetch(`http://localhost:8080/api/bookings/user/${storedId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setBookings(Array.isArray(data) ? data : []))
        .catch(() => setBookings([]))
        .finally(() => setLoadingB(false));
    } else {
      setLoadingB(false);
    }

    // Fetch now-showing movies
    fetch("http://localhost:8080/api/movies")
      .then((r) => r.json())
      .then((data) => setMovies(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setMovies([]))
      .finally(() => setLoadingM(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalBookings   = bookings.length;
  const pendingPayments = bookings.filter((b) => b.paymentStatus === "PENDING").length;
  const totalSpent      = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const recentBookings  = bookings.slice(0, 4);

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

  // ── Quick nav cards data ─────────────────────────────────────────────────────
  const navCards = [
    {
      href:    "/customer/movies",
      icon:    "🎬",
      label:   "Browse Films",
      desc:    "See what's showing now",
      accent:  t.gold,
    },
    {
      href:    "/customer/bookings",
      icon:    "🎟",
      label:   "My Bookings",
      desc:    `${totalBookings} booking${totalBookings !== 1 ? "s" : ""} total`,
      accent:  "#6fcf97",
    },
    {
      href:    "/customer/profile",
      icon:    "👤",
      label:   "My Profile",
      desc:    "Edit name & password",
      accent:  "#a09880",
    },
  ];

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
          maxWidth: 1200,
          margin: "0 auto",
          padding: "clamp(40px,6vw,64px) clamp(20px,4vw,48px) 96px",
        }}
      >

        {/* ── Welcome header ── */}
        <div style={{ marginBottom: 56 }}>
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
            {timeOfDay()}
          </p>
          <h1
            style={{
              fontSize: "clamp(32px,5vw,64px)",
              fontWeight: 400,
              color: t.pageText,
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              transition: "color 0.4s ease",
            }}
          >
            {userName}
          </h1>
          <div style={{ width: 48, height: 2, background: t.gold, marginTop: 20 }} />
        </div>

        {/* ── Stats row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px,22vw,220px), 1fr))",
            gap: 2,
            marginBottom: 56,
          }}
        >
          {[
            {
              label: "Total Bookings",
              value: loadingB ? "—" : String(totalBookings),
              sub:   "all time",
              color: t.gold,
            },
            {
              label: "Pending Payments",
              value: loadingB ? "—" : String(pendingPayments),
              sub:   pendingPayments > 0 ? "action needed" : "all clear",
              color: pendingPayments > 0 ? "#e57373" : "#6fcf97",
            },
            {
              label: "Total Spent",
              value: loadingB ? "—" : `Rs. ${totalSpent.toLocaleString()}`,
              sub:   "paid bookings",
              color: t.gold,
            },
            {
              label: "Now Showing",
              value: loadingM ? "—" : String(movies.length),
              sub:   "films available",
              color: t.gold,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: t.statBg,
                border: `1px solid ${t.statBorder}`,
                padding: "24px 20px",
                transition: "background 0.4s ease, border-color 0.4s ease",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  color: t.labelText,
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                  fontFamily: t.sansFont,
                  transition: "color 0.4s ease",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: "clamp(20px,3vw,28px)",
                  fontWeight: 400,
                  color: stat.color,
                  margin: "0 0 4px",
                  fontFamily: t.serifFont,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: t.labelText,
                  margin: 0,
                  fontFamily: t.sansFont,
                  letterSpacing: "0.05em",
                }}
              >
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Quick nav cards ── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
              Quick Access
            </h2>
            <div style={{ flex: 1, height: 1, background: t.divider, transition: "background 0.4s ease" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px,28vw,280px),1fr))", gap: 2 }}>
            {navCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="nav-card"
                  style={{
                    background: t.navCardBg,
                    border: `1px solid ${t.navCardBorder}`,
                    padding: "24px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    transition: "background 0.2s ease, border-color 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="nav-card-accent"
                    style={{
                      position: "absolute",
                      left: 0, top: 0,
                      width: 3,
                      height: "100%",
                      background: card.accent,
                      transform: "scaleY(0)",
                      transformOrigin: "bottom",
                      transition: "transform 0.25s ease",
                    }}
                  />

                  <span style={{ fontSize: 28, flexShrink: 0 }}>{card.icon}</span>

                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        color: t.pageText,
                        margin: "0 0 4px",
                        fontFamily: t.sansFont,
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        transition: "color 0.4s ease",
                      }}
                    >
                      {card.label}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: t.metaText,
                        margin: 0,
                        fontFamily: t.sansFont,
                      }}
                    >
                      {card.desc}
                    </p>
                  </div>

                  <span
                    style={{
                      marginLeft: "auto",
                      color: t.labelText,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Two column layout: recent bookings + now showing ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(280px,40vw,480px),1fr))",
            gap: 40,
            alignItems: "start",
          }}
        >

          {/* ── Recent bookings ── */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
                  Recent Bookings
                </h2>
                <div style={{ width: 40, height: 1, background: t.divider }} />
              </div>
              <Link
                href="/customer/bookings"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: t.goldMuted,
                  textDecoration: "none",
                  fontFamily: t.sansFont,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                View all →
              </Link>
            </div>

            {loadingB ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "32px 0" }}>
                <div style={{ width: 1, height: 32, background: t.gold }} />
                <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 12 }}>Loading...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  padding: "40px 24px",
                  textAlign: "center",
                  transition: "background 0.4s ease",
                }}
              >
                <p style={{ fontSize: 28, margin: "0 0 12px" }}>🎟</p>
                <p style={{ fontSize: 14, color: t.metaText, fontFamily: t.sansFont, margin: "0 0 16px" }}>
                  No bookings yet
                </p>
                <button
                  onClick={() => router.push("/customer/movies")}
                  style={{
                    padding: "10px 20px",
                    background: t.gold,
                    border: `1px solid ${t.gold}`,
                    color: "#080808",
                    cursor: "pointer",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    fontFamily: t.sansFont,
                  }}
                >
                  Book Now
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentBookings.map((booking) => {
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
                      {/* Status strip */}
                      <div style={{ height: 2, background: statusColor(booking.bookingStatus) }} />

                      <div style={{ padding: "16px 18px" }}>
                        {/* Movie title + date */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                          <p
                            style={{
                              fontSize: 15,
                              color: t.pageText,
                              margin: 0,
                              fontFamily: t.serifFont,
                              lineHeight: 1.2,
                              transition: "color 0.4s ease",
                            }}
                          >
                            {booking.movie.title}
                          </p>
                          <span
                            style={{
                              fontSize: 9,
                              padding: "3px 8px",
                              border: `1px solid ${paymentColor(booking.paymentStatus)}`,
                              color: paymentColor(booking.paymentStatus),
                              fontFamily: t.sansFont,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>

                        {/* Showtime + seats row */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <p style={{ fontSize: 12, color: t.metaText, margin: "0 0 2px", fontFamily: t.sansFont }}>
                              {formatDateShort(booking.showtime.showDate)} · {formatTime(booking.showtime.startTime)}
                            </p>
                            {/* Seat chips — max 4 shown */}
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                              {seats.slice(0, 4).map((seat) => (
                                <span
                                  key={seat}
                                  style={{
                                    padding: "2px 8px",
                                    background: t.seatBg,
                                    border: `1px solid ${t.seatBorder}`,
                                    fontSize: 10,
                                    fontFamily: t.sansFont,
                                    fontWeight: 600,
                                    color: t.seatText,
                                    borderRadius: 2,
                                    letterSpacing: "0.06em",
                                    transition: "background 0.4s ease",
                                  }}
                                >
                                  {seat}
                                </span>
                              ))}
                              {seats.length > 4 && (
                                <span style={{ fontSize: 10, color: t.labelText, fontFamily: t.sansFont, alignSelf: "center" }}>
                                  +{seats.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p style={{ fontSize: 14, color: t.gold, margin: "0 0 4px", fontFamily: t.sansFont, fontWeight: 600 }}>
                              Rs. {Number(booking.totalAmount).toLocaleString()}
                            </p>
                            {/* Action */}
                            {booking.paymentStatus === "PENDING" ? (
                              <button
                                onClick={() => router.push(`/customer/payment?bookingId=${booking.id}`)}
                                style={{
                                  padding: "5px 12px",
                                  background: "transparent",
                                  border: `1px solid ${t.gold}`,
                                  color: t.gold,
                                  cursor: "pointer",
                                  fontSize: 9,
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  fontWeight: 600,
                                  fontFamily: t.sansFont,
                                  transition: "all 0.15s ease",
                                }}
                                className="pay-now-btn"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/customer/booking-confirmation` +
                                    `?bookingCode=${encodeURIComponent(booking.bookingCode)}` +
                                    `&totalAmount=${encodeURIComponent(String(booking.totalAmount))}` +
                                    `&seats=${encodeURIComponent(booking.seatNumbers)}` +
                                    `&showtimeId=${encodeURIComponent(String(booking.showtime.id))}`
                                  )
                                }
                                style={{
                                  padding: "5px 12px",
                                  background: "transparent",
                                  border: `1px solid ${t.divider}`,
                                  color: t.metaText,
                                  cursor: "pointer",
                                  fontSize: 9,
                                  letterSpacing: "0.15em",
                                  textTransform: "uppercase",
                                  fontWeight: 600,
                                  fontFamily: t.sansFont,
                                  transition: "all 0.15s ease",
                                }}
                                className="view-ticket-btn"
                              >
                                Ticket
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {bookings.length > 4 && (
                  <Link
                    href="/customer/bookings"
                    style={{
                      display: "block",
                      padding: "14px",
                      background: "transparent",
                      border: `1px solid ${t.cardBorder}`,
                      color: t.metaText,
                      textDecoration: "none",
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      fontFamily: t.sansFont,
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                    className="view-all-btn"
                  >
                    View All {bookings.length} Bookings
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* ── Now showing ── */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
                  Now Showing
                </h2>
                <div style={{ width: 40, height: 1, background: t.divider }} />
              </div>
              <Link
                href="/customer/movies"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: t.goldMuted,
                  textDecoration: "none",
                  fontFamily: t.sansFont,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                All films →
              </Link>
            </div>

            {loadingM ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "32px 0" }}>
                <div style={{ width: 1, height: 32, background: t.gold }} />
                <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 12 }}>Loading...</p>
              </div>
            ) : movies.length === 0 ? (
              <div
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  padding: "40px 24px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: t.metaText, fontFamily: t.sansFont, fontSize: 14 }}>No films available.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {movies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/customer/movies/${movie.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="movie-row"
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        cursor: "pointer",
                        transition: "background 0.2s ease, border-color 0.2s ease",
                      }}
                    >
                      {/* Poster thumb */}
                      <div
                        style={{
                          width: 48,
                          height: 68,
                          flexShrink: 0,
                          borderRadius: 2,
                          overflow: "hidden",
                          background: t.noImgBg,
                          transition: "background 0.4s ease",
                        }}
                      >
                        {movie.primaryPhotoBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                            alt={movie.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 8, color: t.noImgText, fontFamily: t.sansFont, letterSpacing: "0.1em" }}>N/A</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 14,
                            color: t.pageText,
                            margin: "0 0 4px",
                            fontFamily: t.serifFont,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            transition: "color 0.4s ease",
                          }}
                        >
                          {movie.title}
                        </p>
                        <p style={{ fontSize: 11, color: t.metaText, margin: "0 0 2px", fontFamily: t.sansFont }}>
                          {movie.genre}
                          {movie.language ? ` · ${movie.language}` : ""}
                        </p>
                        <p style={{ fontSize: 11, color: t.labelText, margin: 0, fontFamily: t.sansFont }}>
                          {movie.durationMinutes} min
                          {movie.rating ? ` · ${movie.rating}` : ""}
                        </p>
                      </div>

                      <span style={{ color: t.labelText, fontSize: 14, flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}

                <Link
                  href="/customer/movies"
                  style={{
                    display: "block",
                    padding: "14px",
                    background: t.gold,
                    border: `1px solid ${t.gold}`,
                    color: "#080808",
                    textDecoration: "none",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    fontFamily: t.sansFont,
                    textAlign: "center",
                    transition: "opacity 0.2s ease",
                  }}
                  className="browse-all-btn"
                >
                  Browse All Films
                </Link>
              </div>
            )}
          </section>

        </div>
      </div>

      <style>{`
        .nav-card:hover .nav-card-accent { transform: scaleY(1) !important; }
        .nav-card:hover { border-color: rgba(200,169,110,0.35) !important; }
        .pay-now-btn:hover  { background: ${t.gold} !important; color: #080808 !important; }
        .view-ticket-btn:hover { border-color: ${t.gold} !important; color: ${t.gold} !important; }
        .view-all-btn:hover  { border-color: ${t.gold} !important; color: ${t.gold} !important; }
        .movie-row:hover { border-color: rgba(200,169,110,0.35) !important; background: ${t.cardBg === "#ffffff" ? "#faf7f2" : "#111"} !important; }
        .browse-all-btn:hover { opacity: 0.88; }
      `}</style>
    </main>
  );
}