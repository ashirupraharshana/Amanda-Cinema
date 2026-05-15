"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";

interface BookingDetails {
  id: number;
  bookingCode: string;
  totalAmount: number;
  seatNumbers: string;
  totalSeats: number;
  bookingStatus: string;
  paymentStatus: string;
  movie: {
    id: number;
    title: string;
  };
  showtime: {
    id: number;
    showDate: string;
    startTime: string;
    endTime: string;
    price: number;
    movieTitle: string;
  };
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "-";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// Format card number input: add space every 4 digits
function formatCardInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

// Format expiry MM/YY
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking]       = useState<BookingDetails | null>(null);
  const [loading, setLoading]       = useState(true);
  const [paying, setPaying]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");

  const t = useMemo(() => ({
    pageBg:      isDark ? "#080808" : "#faf8f4",
    pageText:    isDark ? "#f0ece4" : "#1a1814",
    gold:        "#c8a96e",
    sansFont:    "'Helvetica Neue', Arial, sans-serif",
    serifFont:   "'Georgia', 'Times New Roman', serif",
    divider:     isDark ? "#1e1e1e" : "#e0dbd0",
    labelText:   isDark ? "#555"    : "#bbb4a0",
    metaText:    isDark ? "#a09880" : "#7a6e5a",
    infoBg:      isDark ? "#0f0f0f" : "#ffffff",
    infoBorder:  isDark ? "#1a1a1a" : "#eae6de",
    errorBg:     isDark ? "#2a0a0a" : "#fff0f0",
    errorBorder: isDark ? "#5a1a1a" : "#ffcccc",
    inputBg:     isDark ? "#111"    : "#fff",
    inputBorder: isDark ? "#2a2a2a" : "#d8d2c4",
    inputFocus:  "#c8a96e",
    inputText:   isDark ? "#f0ece4" : "#1a1814",
    seatBg:      isDark ? "#1a1a1a" : "#f0ece4",
    seatBorder:  isDark ? "#2a2a2a" : "#d8d2c4",
    seatText:    isDark ? "#c8a96e" : "#8a6e3a",
  }), [isDark]);

  // ── Fetch booking details ─────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load booking");
        setBooking(data);
      })
      .catch((err) => {
        console.error(err);
        setFetchError("Unable to load booking details. Please go back and try again.");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  // ── Payment submit ────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!bookingId || !booking) return;

    // Basic validation
    const rawCard = cardNumber.replace(/\s/g, "");
    if (rawCard.length < 16) { setError("Please enter a valid 16-digit card number."); return; }
    if (!cardHolder.trim())  { setError("Please enter the card holder name."); return; }
    if (expiry.length < 5)   { setError("Please enter a valid expiry date (MM/YY)."); return; }
    if (cvv.length < 3)      { setError("Please enter a valid CVV."); return; }

    setError(null);
    setPaying(true);

    try {
      const res = await fetch(`http://localhost:8080/api/bookings/${bookingId}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cardNumber: rawCard, cardHolder, expiry, cvv }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Payment failed");

      // Use data from response, fall back to local booking state
      const confirmedCode   = data.bookingCode   || booking.bookingCode;
      const confirmedAmount = data.totalAmount    ?? booking.totalAmount;
      const confirmedSeats  = data.seatNumbers    || booking.seatNumbers || "";
      const confirmedStId   = data.showtime?.id   || booking.showtime?.id;

      router.push(
        `/customer/booking-confirmation` +
        `?bookingCode=${encodeURIComponent(confirmedCode)}` +
        `&totalAmount=${encodeURIComponent(String(confirmedAmount))}` +
        `&seats=${encodeURIComponent(confirmedSeats)}` +
        `&showtimeId=${encodeURIComponent(String(confirmedStId || ""))}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ── No bookingId ──────────────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <p style={{ color: t.metaText, fontFamily: t.sansFont, marginBottom: 24 }}>No booking selected.</p>
        <button
          onClick={() => router.push("/customer/movies")}
          style={{ padding: "12px 28px", background: t.gold, border: "none", color: "#080808", cursor: "pointer", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: t.sansFont }}
        >
          Browse Movies
        </button>
      </div>
    );
  }

  // ── Fetch error ───────────────────────────────────────────────────────────
  if (!loading && fetchError) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, padding: "24px 28px", marginBottom: 24 }}>
          <p style={{ color: "#e57373", fontFamily: t.sansFont, margin: 0 }}>{fetchError}</p>
        </div>
        <button
          onClick={() => router.back()}
          style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${t.divider}`, color: t.metaText, cursor: "pointer", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: t.sansFont }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Seat chips from seatNumbers string ────────────────────────────────────
  const seatChips = booking?.seatNumbers
    ? booking.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(20px,4vw,48px) 96px" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 48 }}>
        <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
          Payment
        </h2>
        <div style={{ flex: 1, height: 1, background: t.divider }} />
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "64px 0" }}>
          <div style={{ width: 1, height: 40, background: t.gold }} />
          <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>
            Loading booking details...
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 2, alignItems: "start" }}>

          {/* ── LEFT: Booking summary ── */}
          <div style={{ background: t.infoBg, border: `1px solid ${t.infoBorder}`, transition: "background 0.4s ease, border-color 0.4s ease" }}>
            {/* Gold top strip */}
            <div style={{ height: 3, background: t.gold }} />

            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", color: t.labelText, textTransform: "uppercase", margin: "0 0 24px", fontFamily: t.sansFont }}>
                Booking Summary
              </p>

              {/* Booking code */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Booking Code</p>
                <p style={{ fontSize: 13, color: t.gold, margin: 0, fontFamily: "monospace", letterSpacing: "0.06em", wordBreak: "break-all" }}>
                  {booking?.bookingCode || "-"}
                </p>
              </div>

              <div style={{ height: 1, background: t.divider, margin: "0 0 20px" }} />

              {/* Film */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Film</p>
                <p style={{ fontSize: 18, color: t.pageText, margin: 0, fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
                  {booking?.movie?.title || booking?.showtime?.movieTitle || "-"}
                </p>
              </div>

              {/* Date & time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Date</p>
                  <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont, lineHeight: 1.4 }}>
                    {formatDate(booking?.showtime?.showDate)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Showtime</p>
                  <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>
                    {formatTime(booking?.showtime?.startTime)}<br />— {formatTime(booking?.showtime?.endTime)}
                  </p>
                </div>
              </div>

              <div style={{ height: 1, background: t.divider, margin: "0 0 20px" }} />

              {/* Seats */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 10px", fontFamily: t.sansFont }}>
                  Seats ({booking?.totalSeats || seatChips.length})
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {seatChips.length > 0 ? seatChips.map((seat) => (
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
                  )) : (
                    <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, margin: 0 }}>—</p>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: t.divider, margin: "0 0 20px" }} />

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>Total Due</p>
                  <p style={{ fontSize: 28, fontWeight: 400, color: t.pageText, margin: 0, fontFamily: t.serifFont, letterSpacing: "-0.01em", transition: "color 0.4s ease" }}>
                    Rs. <span style={{ color: t.gold }}>{Number(booking?.totalAmount || 0).toLocaleString()}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont }}>Status</p>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    background: booking?.paymentStatus === "PAID" ? "rgba(111,207,151,0.15)" : "rgba(200,169,110,0.12)",
                    border: `1px solid ${booking?.paymentStatus === "PAID" ? "#6fcf97" : t.gold}`,
                    color: booking?.paymentStatus === "PAID" ? "#6fcf97" : t.gold,
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    fontFamily: t.sansFont,
                    fontWeight: 600,
                  }}>
                    {booking?.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment form ── */}
          <div style={{ background: t.infoBg, border: `1px solid ${t.infoBorder}`, transition: "background 0.4s ease, border-color 0.4s ease" }}>
            <div style={{ height: 3, background: t.divider, transition: "background 0.4s ease" }} />

            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", color: t.labelText, textTransform: "uppercase", margin: "0 0 24px", fontFamily: t.sansFont }}>
                Card Details
              </p>

              {/* Card number */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: t.labelText, marginBottom: 8, fontFamily: t.sansFont }}>
                  Card Number
                </label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={{ width: "100%", padding: "13px 16px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputText, outline: "none", fontFamily: "monospace", fontSize: 15, letterSpacing: "0.1em", boxSizing: "border-box", transition: "border-color 0.2s ease" }}
                  onFocus={(e) => e.target.style.borderColor = t.inputFocus}
                  onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                />
              </div>

              {/* Card holder */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: t.labelText, marginBottom: 8, fontFamily: t.sansFont }}>
                  Card Holder Name
                </label>
                <input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="YOUR NAME"
                  style={{ width: "100%", padding: "13px 16px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputText, outline: "none", fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.08em", boxSizing: "border-box", transition: "border-color 0.2s ease" }}
                  onFocus={(e) => e.target.style.borderColor = t.inputFocus}
                  onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                />
              </div>

              {/* Expiry + CVV */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: t.labelText, marginBottom: 8, fontFamily: t.sansFont }}>
                    Expiry
                  </label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    style={{ width: "100%", padding: "13px 16px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputText, outline: "none", fontFamily: "monospace", fontSize: 14, boxSizing: "border-box", transition: "border-color 0.2s ease" }}
                    onFocus={(e) => e.target.style.borderColor = t.inputFocus}
                    onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: t.labelText, marginBottom: 8, fontFamily: t.sansFont }}>
                    CVV
                  </label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    style={{ width: "100%", padding: "13px 16px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputText, outline: "none", fontFamily: "monospace", fontSize: 14, boxSizing: "border-box", transition: "border-color 0.2s ease" }}
                    onFocus={(e) => e.target.style.borderColor = t.inputFocus}
                    onBlur={(e) => e.target.style.borderColor = t.inputBorder}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, padding: "13px 16px", marginBottom: 16, borderRadius: 2 }}>
                  <p style={{ color: "#e57373", fontSize: 13, margin: 0, fontFamily: t.sansFont }}>{error}</p>
                </div>
              )}

              {/* Pay button */}
              <button
                onClick={handlePayment}
                disabled={paying}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: t.gold,
                  border: `1px solid ${t.gold}`,
                  color: "#080808",
                  cursor: paying ? "wait" : "pointer",
                  fontSize: 12,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontFamily: t.sansFont,
                  opacity: paying ? 0.75 : 1,
                  marginBottom: 10,
                  transition: "opacity 0.2s ease",
                }}
              >
                {paying ? "Processing..." : `Pay Rs. ${Number(booking?.totalAmount || 0).toLocaleString()}`}
              </button>

              {/* Back button */}
              <button
                onClick={() => router.back()}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "transparent",
                  border: `1px solid ${t.divider}`,
                  color: t.metaText,
                  cursor: "pointer",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontFamily: t.sansFont,
                  transition: "border-color 0.2s ease, color 0.2s ease",
                }}
                className="back-btn"
              >
                Back
              </button>

              <p style={{ fontSize: 11, color: t.labelText, fontFamily: t.sansFont, textAlign: "center", margin: "20px 0 0", lineHeight: 1.6 }}>
                This is a simulated payment for the cinema project.
                <br />No real transaction will occur.
              </p>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .back-btn:hover { border-color: ${t.gold} !important; color: ${t.gold} !important; }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  const { isDark } = useTheme();

  return (
    <main style={{ minHeight: "100vh", background: isDark ? "#080808" : "#faf8f4", color: isDark ? "#f0ece4" : "#1a1814", fontFamily: "'Georgia', 'Times New Roman', serif", transition: "background 0.4s ease, color 0.4s ease" }}>
      <Navbar />

      {/* Page title */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(20px,4vw,48px) 0" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#9e8a6e", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          Checkout
        </p>
        <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, color: isDark ? "#f0ece4" : "#1a1814", margin: 0, letterSpacing: "-0.02em", fontFamily: "'Georgia', 'Times New Roman', serif", transition: "color 0.4s ease" }}>
          Complete Payment
        </h1>
        <div style={{ width: 48, height: 2, background: "#c8a96e", marginTop: 16 }} />
      </div>

      <Suspense fallback={
        <div style={{ padding: "80px 48px", textAlign: "center" }}>
          <p style={{ color: "#555", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13 }}>Loading...</p>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </main>
  );
}