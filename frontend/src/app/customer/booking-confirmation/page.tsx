"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";

interface ShowtimeInfo {
  showDate: string;
  startTime: string;
  endTime: string;
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

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();

  const bookingCode = searchParams.get("bookingCode");
  const totalAmount = searchParams.get("totalAmount");
  const seats = searchParams.get("seats");
  const showtimeId = searchParams.get("showtimeId");

  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo | null>(null);

  useEffect(() => {
    if (!showtimeId) return;

    fetch(`http://localhost:8080/api/showtimes/${showtimeId}`)
      .then((res) => res.json())
      .then((data) => setShowtimeInfo(data))
      .catch((err) =>
        console.error("Failed to load showtime details:", err)
      );
  }, [showtimeId]);

  const t = {
    cardBg: isDark ? "#101010" : "#ffffff",
    text: isDark ? "#f5f1e8" : "#1a1814",
    subText: isDark ? "#9f9684" : "#6f6555",
    border: isDark ? "#1f1f1f" : "#e8e1d4",
    gold: "#c8a96e",
    success: "#6fcf97",
    sans: "'Helvetica Neue', Arial, sans-serif",
    serif: "'Georgia', 'Times New Roman', serif",
  };

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "40px 20px 40px",
      }}
    >
      {/* Printable Ticket */}
      <div
        id="ticket"
        style={{
          background: t.cardBg,
          border: `1px solid ${t.border}`,
          padding: "40px 32px",
        }}
      >
        {/* Success */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              border: `2px solid ${t.success}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 36,
              color: t.success,
            }}
          >
            ✓
          </div>

          <p
            style={{
              color: t.gold,
              fontSize: 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 12,
              fontFamily: t.sans,
            }}
          >
            Booking Confirmed
          </p>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 400,
              margin: 0,
              color: t.text,
              fontFamily: t.serif,
              letterSpacing: "-0.03em",
            }}
          >
            Enjoy Your Movie
          </h1>
        </div>

        {/* Booking Code */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: t.subText,
              marginBottom: 10,
              fontFamily: t.sans,
            }}
          >
            Booking Code
          </p>

          <div
            style={{
              background: isDark ? "#151515" : "#f7f3ec",
              border: `1px solid ${t.border}`,
              padding: "18px 20px",
            }}
          >
            <span
              style={{
                color: t.gold,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.08em",
                fontFamily: t.sans,
              }}
            >
              {bookingCode || "N/A"}
            </span>
          </div>
        </div>

        {/* Ticket Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 36,
          }}
        >
          {/* Film */}
          <div
            style={{
              border: `1px solid ${t.border}`,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.subText,
                marginBottom: 8,
                fontFamily: t.sans,
              }}
            >
              Film
            </p>

            <p
              style={{
                margin: 0,
                color: t.text,
                fontSize: 18,
                fontFamily: t.serif,
              }}
            >
              {showtimeInfo?.movieTitle || "Loading..."}
            </p>
          </div>

          {/* Date */}
          <div
            style={{
              border: `1px solid ${t.border}`,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.subText,
                marginBottom: 8,
                fontFamily: t.sans,
              }}
            >
              Show Date
            </p>

            <p
              style={{
                margin: 0,
                color: t.text,
                fontSize: 16,
                fontFamily: t.sans,
              }}
            >
              {showtimeInfo?.showDate
                ? formatDate(showtimeInfo.showDate)
                : "Loading..."}
            </p>
          </div>

          {/* Showtime */}
          <div
            style={{
              border: `1px solid ${t.border}`,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.subText,
                marginBottom: 8,
                fontFamily: t.sans,
              }}
            >
              Showtime
            </p>

            <p
              style={{
                margin: 0,
                color: t.gold,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: t.sans,
              }}
            >
              {showtimeInfo
                ? `${formatTime(showtimeInfo.startTime)} — ${formatTime(
                    showtimeInfo.endTime
                  )}`
                : "Loading..."}
            </p>
          </div>

          {/* Seats */}
          <div
            style={{
              border: `1px solid ${t.border}`,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.subText,
                marginBottom: 8,
                fontFamily: t.sans,
              }}
            >
              Seats
            </p>

            <p
              style={{
                margin: 0,
                color: t.text,
                fontSize: 18,
                fontFamily: t.sans,
                fontWeight: 600,
              }}
            >
              {seats || "N/A"}
            </p>
          </div>

          {/* Total */}
          <div
            style={{
              border: `1px solid ${t.border}`,
              padding: 20,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: t.subText,
                marginBottom: 8,
                fontFamily: t.sans,
              }}
            >
              Total Paid
            </p>

            <p
              style={{
                margin: 0,
                color: t.gold,
                fontSize: 22,
                fontWeight: 700,
                fontFamily: t.sans,
              }}
            >
              Rs. {Number(totalAmount || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer Message */}
        <div
          style={{
            borderTop: `1px solid ${t.border}`,
            paddingTop: 28,
          }}
        >
          <p
            style={{
              margin: 0,
              color: t.subText,
              lineHeight: 1.8,
              fontSize: 14,
              fontFamily: t.sans,
            }}
          >
            Please present this booking confirmation at the cinema entrance.
            Arrive at least 15 minutes before the showtime.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div
        className="no-print"
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 40,
        }}
      >
        <button
          onClick={() => router.push("/customer/movies")}
          style={{
            padding: "14px 32px",
            background: "transparent",
            border: `1px solid ${t.border}`,
            color: t.text,
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 600,
            fontFamily: t.sans,
          }}
        >
          Browse More Movies
        </button>

        <button
          onClick={() => window.print()}
          style={{
            padding: "14px 32px",
            background: t.gold,
            border: `1px solid ${t.gold}`,
            color: "#080808",
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: t.sans,
          }}
        >
          Print Ticket
        </button>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  const { isDark } = useTheme();

  return (
    <>
      <style jsx global>{`
  @media print {
    html,
    body {
      width: 210mm;
      height: 297mm;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: white !important;
    }

    nav,
    .no-print {
      display: none !important;
    }

    main {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      min-height: auto !important;
    }

    #ticket {
      width: 170mm !important;
      max-width: 170mm !important;
      margin: 0 auto !important;
      padding: 12mm !important;
      box-sizing: border-box !important;

      border: 1px solid #ccc !important;
      box-shadow: none !important;

      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    #ticket * {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    @page {
      size: A4 portrait;
      margin: 8mm;
    }
  }
`}</style>

      <main
        style={{
          minHeight: "100vh",
          background: isDark ? "#080808" : "#faf8f4",
          color: isDark ? "#f5f1e8" : "#1a1814",
        }}
      >
        <Navbar />

        <Suspense
          fallback={
            <div style={{ padding: 80, textAlign: "center" }}>
              Loading...
            </div>
          }
        >
          <BookingConfirmationContent />
        </Suspense>
      </main>
    </>
  );
}