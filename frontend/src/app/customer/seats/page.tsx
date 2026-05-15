"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";


interface ShowtimeInfo {
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  movieTitle?: string;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

function SeatsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  const showtimeId = searchParams.get("showtimeId");

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats]     = useState<string[]>([]);
  const [showtimeInfo, setShowtimeInfo]   = useState<ShowtimeInfo | null>(null);
  const [loading, setLoading]             = useState(true);
  const [booking, setBooking]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Theme tokens
  const t = {
    pageBg:        isDark ? "#080808" : "#faf8f4",
    pageText:      isDark ? "#f0ece4" : "#1a1814",
    gold:          "#c8a96e",
    sansFont:      "'Helvetica Neue', Arial, sans-serif",
    serifFont:     "'Georgia', 'Times New Roman', serif",
    divider:       isDark ? "#1e1e1e" : "#e0dbd0",
    labelText:     isDark ? "#555"    : "#bbb4a0",
    metaText:      isDark ? "#a09880" : "#7a6e5a",
    seatDefault:   isDark ? "#1a1a1a" : "#eae6de",
    seatBorder:    isDark ? "#2a2a2a" : "#d8d2c4",
    seatText:      isDark ? "#888"    : "#aaa090",
    seatBooked:    isDark ? "#2a2a2a" : "#e0dbd0",
    seatBookedText:isDark ? "#444"    : "#ccc0a8",
    infoBg:        isDark ? "#0f0f0f" : "#ffffff",
    infoBorder:    isDark ? "#1a1a1a" : "#eae6de",
    legendBg:      isDark ? "#1a1a1a" : "#eae6de",
    errorBg:       isDark ? "#2a0a0a" : "#fff0f0",
    errorBorder:   isDark ? "#5a1a1a" : "#ffcccc",
  };

  useEffect(() => {
    if (!showtimeId) {
      setLoading(false);
      return;
    }

    // Fetch booked seats
    fetch(`http://localhost:8080/api/bookings/booked-seats/${showtimeId}`)
      .then((res) => res.json())
      .then((data) => setBookedSeats(data))
      .catch((err) => console.error("Failed to load booked seats:", err));

    // Fetch showtime info to display movie/time/price
    fetch(`http://localhost:8080/api/showtimes/${showtimeId}`)
      .then((res) => res.json())
      .then((data) => setShowtimeInfo(data))
      .catch((err) => console.error("Failed to load showtime info:", err))
      .finally(() => setLoading(false));
  }, [showtimeId]);

  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setError(null);
    setBooking(true);

    try {
      // Get userId from localStorage (set during login)
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("You must be logged in to book tickets.");
        setBooking(false);
        return;
      }

      const payload = {
        userId:     Number(userId),
        showtimeId: Number(showtimeId),
        seats:      selectedSeats,
      };

      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

if (response.ok) {
  router.push(`/customer/payment?bookingId=${data.bookingId}`);
} else {
  setError(data.error || "Booking failed. Please try again.");
}
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (!showtimeId) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center" }}>
        <p style={{ color: t.labelText, fontFamily: t.sansFont }}>
          No showtime selected.{" "}
          <span
            style={{ color: t.gold, cursor: "pointer" }}
            onClick={() => router.push("/customer/movies")}
          >
            Browse movies →
          </span>
        </p>
      </div>
    );
  }

  const totalPrice = selectedSeats.length * (showtimeInfo?.price ?? 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(20px,4vw,48px) 96px" }}>

      {/* Showtime info bar */}
      {showtimeInfo && (
        <div
          style={{
            background: t.infoBg,
            border: `1px solid ${t.infoBorder}`,
            padding: "20px 24px",
            marginBottom: 48,
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            alignItems: "center",
            transition: "background 0.4s ease, border-color 0.4s ease",
          }}
        >
          {showtimeInfo.movieTitle && (
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Film</p>
              <p style={{ fontSize: 16, color: t.pageText, margin: 0, fontFamily: t.serifFont }}>{showtimeInfo.movieTitle}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Date</p>
            <p style={{ fontSize: 14, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>{formatDate(showtimeInfo.showDate)}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Time</p>
            <p style={{ fontSize: 14, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>{formatTime(showtimeInfo.startTime)} — {formatTime(showtimeInfo.endTime)}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Price per seat</p>
            <p style={{ fontSize: 14, color: t.gold, margin: 0, fontFamily: t.sansFont, fontWeight: 600 }}>Rs. {Number(showtimeInfo.price).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
        <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
          Select Your Seats
        </h2>
        <div style={{ flex: 1, height: 1, background: t.divider }} />
      </div>

      {/* Screen indicator */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${t.gold}, transparent)`, borderRadius: 2, maxWidth: 480, margin: "0 auto 10px" }} />
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: t.labelText, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont }}>Screen</p>
      </div>

      {/* Seat grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>Loading seats...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", marginBottom: 48 }}>
          {ROWS.map((row) => (
            <div key={row} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Row label */}
              <span style={{ width: 20, fontSize: 11, color: t.labelText, fontFamily: t.sansFont, textAlign: "center", flexShrink: 0 }}>
                {row}
              </span>

              {/* Gap in middle (aisle) */}
              {COLS.map((col, idx) => {
                const seat = `${row}${col}`;
                const isSelected = selectedSeats.includes(seat);
                const isBooked   = bookedSeats.includes(seat);

                return (
  <React.Fragment key={seat}>
    {idx === 4 && (
      <div style={{ width: 20 }} />
    )}
                    <button
                      
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                      title={isBooked ? "Already booked" : seat}
                      style={{
                        width: "clamp(36px,5vw,46px)",
                        height: "clamp(36px,5vw,46px)",
                        border: isSelected
                          ? `2px solid ${t.gold}`
                          : `1px solid ${isBooked ? "transparent" : t.seatBorder}`,
                        cursor: isBooked ? "not-allowed" : "pointer",
                        background: isBooked
                          ? t.seatBooked
                          : isSelected
                          ? t.gold
                          : t.seatDefault,
                        color: isBooked
                          ? t.seatBookedText
                          : isSelected
                          ? "#080808"
                          : t.seatText,
                        borderRadius: 4,
                        fontSize: 10,
                        fontFamily: t.sansFont,
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      {col}
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Row label right */}
              <span style={{ width: 20, fontSize: 11, color: t.labelText, fontFamily: t.sansFont, textAlign: "center", flexShrink: 0 }}>
                {row}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
        {[
          { color: t.seatDefault, border: t.seatBorder, label: "Available" },
          { color: t.gold,        border: t.gold,        label: "Selected" },
          { color: t.seatBooked,  border: "transparent",  label: "Booked" },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, background: color, border: `1px solid ${border}`, borderRadius: 3 }} />
            <span style={{ fontSize: 11, color: t.metaText, fontFamily: t.sansFont, letterSpacing: "0.1em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, padding: "14px 20px", marginBottom: 24, borderRadius: 2 }}>
          <p style={{ color: "#e57373", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{error}</p>
        </div>
      )}

      {/* Summary & confirm */}
      <div
        style={{
          background: t.infoBg,
          border: `1px solid ${t.infoBorder}`,
          padding: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          transition: "background 0.4s ease",
        }}
      >
        <div>
          <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>
            Selected Seats
          </p>
          <p style={{ fontSize: 15, color: t.pageText, margin: 0, fontFamily: t.sansFont }}>
            {selectedSeats.length > 0 ? selectedSeats.sort().join(", ") : "None selected"}
          </p>
          {selectedSeats.length > 0 && (
            <p style={{ fontSize: 13, color: t.gold, margin: "8px 0 0", fontFamily: t.sansFont, fontWeight: 600 }}>
              Total: Rs. {totalPrice.toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || booking}
          style={{
            padding: "14px 40px",
            background: selectedSeats.length > 0 ? t.gold : "transparent",
            border: `1px solid ${selectedSeats.length > 0 ? t.gold : t.divider}`,
            color: selectedSeats.length > 0 ? "#080808" : t.labelText,
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 600,
            cursor: selectedSeats.length > 0 ? "pointer" : "not-allowed",
            fontFamily: t.sansFont,
            transition: "all 0.2s ease",
            opacity: booking ? 0.7 : 1,
          }}
        >
          {booking ? "Confirming..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

export default function SeatsPage() {
  const { isDark } = useTheme();

  const t = {
    pageBg:    isDark ? "#080808" : "#faf8f4",
    pageText:  isDark ? "#f0ece4" : "#1a1814",
    serifFont: "'Georgia', 'Times New Roman', serif",
  };

  return (
    <main style={{ minHeight: "100vh", background: t.pageBg, color: t.pageText, fontFamily: t.serifFont, transition: "background 0.4s ease, color 0.4s ease" }}>
      <Navbar />

      {/* Page title */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px clamp(20px,4vw,48px) 0" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#9e8a6e", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          Booking
        </p>
        <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, color: t.pageText, margin: 0, letterSpacing: "-0.02em", fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
          Choose Your Seats
        </h1>
        <div style={{ width: 48, height: 2, background: "#c8a96e", marginTop: 16 }} />
      </div>

      <Suspense fallback={
        <div style={{ padding: "80px 48px", textAlign: "center" }}>
          <p style={{ color: "#555", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13 }}>Loading...</p>
        </div>
      }>
        <SeatsContent />
      </Suspense>
    </main>
  );
}