"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../../context/ThemeContext";

interface MoviePhoto {
  id: number;
  isPrimary: boolean;
  photoData: string;
}

interface Showtime {
  id: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  durationMinutes: number;
  language?: string;
  rating?: string;
  releaseDate?: string;
  showStartDate?: string;
  showEndDate?: string;
  director?: string;
  cast?: string;
  status?: string;
  primaryPhotoBase64?: string;
}

function groupByDate(showtimes: Showtime[]): Record<string, Showtime[]> {
  return showtimes.reduce((acc, s) => {
    if (!acc[s.showDate]) acc[s.showDate] = [];
    acc[s.showDate].push(s);
    return acc;
  }, {} as Record<string, Showtime[]>);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateShort(dateStr: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateStr + "T00:00:00");
  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const id = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [photos, setPhotos] = useState<MoviePhoto[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const [movieRes, photosRes, showtimesRes] = await Promise.all([
          fetch(`http://localhost:8080/api/movies/${id}`),
          fetch(`http://localhost:8080/api/movies/${id}/photos`),
          fetch(`http://localhost:8080/api/movies/${id}/showtimes`),
        ]);
        const movieData = await movieRes.json();
        const photosData = await photosRes.json();
        const showtimesData = await showtimesRes.json();
        setMovie(movieData);
        setPhotos(photosData);
        setShowtimes(showtimesData);
        const dates = Object.keys(
          showtimesData.reduce((acc: Record<string, boolean>, s: Showtime) => { acc[s.showDate] = true; return acc; }, {})
        ).sort();
        if (dates.length > 0) setSelectedDate(dates[0]);
      } catch (error) {
        console.error("Error loading movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Theme tokens
  const t = {
    pageBg:          isDark ? "#080808" : "#faf8f4",
    pageText:        isDark ? "#f0ece4" : "#1a1814",
    gold:            "#c8a96e",
    goldDark:        "#5a3e1b",
    sansFont:        "'Helvetica Neue', Arial, sans-serif",
    serifFont:       "'Georgia', 'Times New Roman', serif",
    heroOverlayL:    isDark ? "rgba(8,8,8,0.98)" : "rgba(250,248,244,0.97)",
    heroOverlayR:    isDark ? "rgba(8,8,8,0.2)"  : "rgba(250,248,244,0.15)",
    heroBottom:      isDark ? "#080808" : "#faf8f4",
    metaText:        isDark ? "#a09880" : "#7a6e5a",
    metaPill:        isDark ? "#1a1a1a" : "#eae6de",
    metaPillBorder:  isDark ? "#2a2a2a" : "#d8d2c4",
    divider:         isDark ? "#1e1e1e" : "#e0dbd0",
    labelText:       isDark ? "#555" : "#bbb4a0",
    sectionTitle:    "#c8a96e",
    dateBtnBg:       isDark ? "#0f0f0f" : "#f0ece4",
    dateBtnBorder:   isDark ? "#1e1e1e" : "#ddd8cc",
    dateBtnText:     isDark ? "#f0ece4" : "#1a1814",
    todayLabel:      "#c8a96e",
    inactiveDateLabel: isDark ? "#555" : "#bbb4a0",
    selectedDateLabel: isDark ? "#5a3e1b" : "#5a3e1b",
    showtimeBg:      isDark ? "#0f0f0f" : "#ffffff",
    showtimeBorder:  isDark ? "#1a1a1a" : "#eae6de",
    showtimeTimeText:isDark ? "#f0ece4" : "#1a1814",
    showtimeSubText: isDark ? "#444" : "#ccc0a8",
    bookBtnText:     isDark ? "#f0ece4" : "#1a1814",
    bookBtnBorder:   isDark ? "#2a2a2a" : "#ddd8cc",
    detailText:      isDark ? "#a09880" : "#7a6e5a",
    noImgBg:         isDark ? "#1a1a1a" : "#ede9e0",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: t.pageBg, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 1, height: 48, background: t.gold }} />
          <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>Loading film...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ minHeight: "100vh", background: t.pageBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: t.labelText, fontFamily: t.sansFont }}>Film not found.</p>
      </div>
    );
  }

  const groupedShowtimes = groupByDate(showtimes);
  const sortedDates = Object.keys(groupedShowtimes).sort();
  const displayedShowtimes = selectedDate ? groupedShowtimes[selectedDate] || [] : [];

  return (
    <main style={{ minHeight: "100vh", background: t.pageBg, color: t.pageText, fontFamily: t.serifFont, transition: "background 0.4s ease, color 0.4s ease" }}>
      <Navbar />

      {/* ── Cinematic Hero ── */}
      <section style={{ position: "relative", height: "clamp(420px,70vh,700px)", overflow: "hidden" }}>
        {/* Blurred backdrop — always dark regardless of theme to keep poster readable */}
        {movie.primaryPhotoBase64 && (
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              backgroundImage: `url(data:image/jpeg;base64,${movie.primaryPhotoBase64})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: isDark ? "blur(24px) brightness(0.2)" : "blur(24px) brightness(0.45)",
              transform: "scale(1.1)",
              transition: "filter 0.4s ease",
            }}
          />
        )}

        {/* Left-to-right overlay fades into page background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to right, ${t.heroOverlayL} 30%, rgba(0,0,0,0) 75%)`,
            transition: "background 0.4s ease",
          }}
        />
        {/* Bottom fade into page */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 160,
            background: `linear-gradient(to top, ${t.heroBottom}, transparent)`,
            transition: "background 0.4s ease",
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 clamp(20px,4vw,48px)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "clamp(24px,4vw,56px)",
          }}
        >
          {/* Poster */}
          <div
            style={{
              flexShrink: 0,
              width: "clamp(120px,16vw,220px)",
              aspectRatio: "2/3",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              border: "1px solid rgba(200,169,110,0.25)",
            }}
          >
            {movie.primaryPhotoBase64 ? (
              <img src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: t.noImgBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: t.labelText, fontSize: 10, letterSpacing: "0.2em", fontFamily: t.sansFont }}>NO IMAGE</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, maxWidth: 580 }}>
            {movie.genre && (
              <p style={{ fontSize: 11, letterSpacing: "0.3em", color: t.gold, textTransform: "uppercase", margin: "0 0 14px", fontFamily: t.sansFont }}>
                {movie.genre}
              </p>
            )}
            <h1
              style={{
                fontSize: "clamp(28px,4vw,60px)",
                fontWeight: 400,
                color: isDark ? "#f0ece4" : "#1a1814",
                margin: "0 0 16px",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                fontFamily: t.serifFont,
                transition: "color 0.4s ease",
              }}
            >
              {movie.title}
            </h1>

            {/* Meta pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 20px" }}>
              {movie.rating && (
                <span style={{ padding: "4px 12px", border: `1px solid ${t.metaPillBorder}`, fontSize: 11, letterSpacing: "0.15em", color: t.gold, fontFamily: t.sansFont, fontWeight: 600, background: t.metaPill, transition: "all 0.4s ease" }}>
                  {movie.rating}
                </span>
              )}
              <span style={{ padding: "4px 12px", border: `1px solid ${t.metaPillBorder}`, fontSize: 11, letterSpacing: "0.1em", color: t.metaText, fontFamily: t.sansFont, background: t.metaPill, transition: "all 0.4s ease" }}>
                {movie.durationMinutes} min
              </span>
              {movie.language && (
                <span style={{ padding: "4px 12px", border: `1px solid ${t.metaPillBorder}`, fontSize: 11, letterSpacing: "0.1em", color: t.metaText, fontFamily: t.sansFont, background: t.metaPill, transition: "all 0.4s ease" }}>
                  {movie.language}
                </span>
              )}
            </div>

            <p style={{ fontSize: "clamp(13px,1.5vw,15px)", color: t.metaText, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 480, fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
              {movie.description}
            </p>

            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {movie.director && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont, transition: "color 0.4s ease" }}>Director</p>
                  <p style={{ fontSize: 13, color: t.gold, margin: 0, fontFamily: t.sansFont }}>{movie.director}</p>
                </div>
              )}
              {movie.releaseDate && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 4px", fontFamily: t.sansFont, transition: "color 0.4s ease" }}>Released</p>
                  <p style={{ fontSize: 13, color: t.metaText, margin: 0, fontFamily: t.sansFont }}>{movie.releaseDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "clamp(40px,6vw,64px) clamp(20px,4vw,48px) 96px" }}>

        {/* ── Showtimes ── */}
        <section style={{ marginBottom: 80 }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
            <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.sectionTitle, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
              Showtimes
            </h2>
            <div style={{ flex: 1, height: 1, background: t.divider, transition: "background 0.4s ease" }} />
          </div>

          {showtimes.length === 0 ? (
            <p style={{ color: t.labelText, fontFamily: t.sansFont, fontSize: 14 }}>No upcoming showtimes available.</p>
          ) : (
            <>
              {/* Date selector */}
              <div style={{ display: "flex", gap: 2, marginBottom: 32, overflowX: "auto", paddingBottom: 4 }}>
                {sortedDates.map((date) => {
                  const { day, month, weekday } = formatDateShort(date);
                  const active = selectedDate === date;
                  const today = isToday(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      style={{
                        flexShrink: 0,
                        padding: "14px 20px",
                        background: active ? t.gold : t.dateBtnBg,
                        border: active ? `1px solid ${t.gold}` : `1px solid ${t.dateBtnBorder}`,
                        cursor: "pointer",
                        textAlign: "center",
                        minWidth: 72,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <p style={{ fontSize: 9, letterSpacing: "0.2em", color: active ? t.selectedDateLabel : (today ? t.todayLabel : t.inactiveDateLabel), margin: "0 0 4px", fontFamily: t.sansFont, fontWeight: 600, transition: "color 0.2s ease" }}>
                        {today ? "TODAY" : weekday}
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 400, color: active ? "#080808" : t.dateBtnText, margin: "0 0 2px", fontFamily: t.serifFont, lineHeight: 1, transition: "color 0.2s ease" }}>
                        {day}
                      </p>
                      <p style={{ fontSize: 9, letterSpacing: "0.15em", color: active ? t.selectedDateLabel : t.inactiveDateLabel, margin: 0, fontFamily: t.sansFont, transition: "color 0.2s ease" }}>
                        {month}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Date label */}
              {selectedDate && (
                <p style={{ fontSize: 13, color: t.labelText, fontFamily: t.sansFont, marginBottom: 20, letterSpacing: "0.05em", transition: "color 0.4s ease" }}>
                  {formatDate(selectedDate)}
                </p>
              )}

              {/* Showtime cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px,20vw,200px),1fr))", gap: 2 }}>
                {displayedShowtimes.map((showtime) => (
                  <div
                    key={showtime.id}
                    className="showtime-card"
                    style={{
                      background: t.showtimeBg,
                      border: `1px solid ${t.showtimeBorder}`,
                      padding: "clamp(20px,3vw,28px) clamp(16px,3vw,24px)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      position: "relative",
                      overflow: "hidden",
                      transition: "background 0.4s ease, border-color 0.4s ease",
                    }}
                  >
                    <div
                      className="showtime-accent"
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: 3, height: "100%",
                        background: t.gold,
                        transform: "scaleY(0)",
                        transformOrigin: "bottom",
                        transition: "transform 0.25s ease",
                      }}
                    />

                    <p style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 400, color: t.showtimeTimeText, margin: 0, letterSpacing: "-0.02em", fontFamily: t.serifFont, transition: "color 0.4s ease" }}>
                      {formatTime(showtime.startTime)}
                    </p>
                    <p style={{ fontSize: 12, color: t.showtimeSubText, margin: 0, fontFamily: t.sansFont, transition: "color 0.4s ease" }}>
                      ends {formatTime(showtime.endTime)}
                    </p>
                    <p style={{ fontSize: 16, color: t.gold, margin: "14px 0 0", fontFamily: t.sansFont, letterSpacing: "0.05em" }}>
                      Rs. {Number(showtime.price).toLocaleString()}
                    </p>

                    <button
                      onClick={() => router.push(`/customer/seats?showtimeId=${showtime.id}`)}
                      className="book-btn"
                      style={{
                        marginTop: 18,
                        padding: "11px 0",
                        background: "transparent",
                        border: `1px solid ${t.bookBtnBorder}`,
                        color: t.bookBtnText,
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: t.sansFont,
                        fontWeight: 600,
                        width: "100%",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Details ── */}
        {(movie.cast || movie.showStartDate || movie.showEndDate) && (
          <section style={{ marginBottom: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.sectionTitle, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
                Details
              </h2>
              <div style={{ flex: 1, height: 1, background: t.divider, transition: "background 0.4s ease" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 32 }}>
              {movie.cast && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 10px", fontFamily: t.sansFont, transition: "color 0.4s ease" }}>Cast</p>
                  <p style={{ fontSize: 14, color: t.detailText, lineHeight: 1.6, margin: 0, fontFamily: t.sansFont, transition: "color 0.4s ease" }}>{movie.cast}</p>
                </div>
              )}
              {movie.showStartDate && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: t.labelText, textTransform: "uppercase", margin: "0 0 10px", fontFamily: t.sansFont, transition: "color 0.4s ease" }}>Show Period</p>
                  <p style={{ fontSize: 14, color: t.detailText, lineHeight: 1.6, margin: 0, fontFamily: t.sansFont, transition: "color 0.4s ease" }}>
                    {movie.showStartDate} — {movie.showEndDate || "ongoing"}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Gallery ── */}
        {photos.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 12, letterSpacing: "0.3em", color: t.sectionTitle, textTransform: "uppercase", margin: 0, fontFamily: t.sansFont, fontWeight: 500, whiteSpace: "nowrap" }}>
                Gallery
              </h2>
              <div style={{ flex: 1, height: 1, background: t.divider, transition: "background 0.4s ease" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px,22vw,240px),1fr))", gap: 2 }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="gallery-item"
                  style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", cursor: "pointer" }}
                  onClick={() => setActivePhoto(`data:image/jpeg;base64,${photo.photoData}`)}
                >
                  <img
                    src={`data:image/jpeg;base64,${photo.photoData}`}
                    alt={`${movie.title} photo`}
                    className="gallery-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                  />
                  {photo.isPrimary && (
                    <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(200,169,110,0.9)", padding: "3px 8px", fontSize: 9, letterSpacing: "0.15em", color: "#080808", fontFamily: t.sansFont, fontWeight: 700 }}>
                      PRIMARY
                    </div>
                  )}
                  <div className="gallery-overlay" style={{ position: "absolute", inset: 0, background: "rgba(8,8,8,0)", transition: "background 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="gallery-expand" style={{ color: "rgba(240,236,228,0)", fontSize: 11, letterSpacing: "0.2em", fontFamily: t.sansFont, transition: "color 0.3s ease" }}>
                      EXPAND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(8,8,8,0.97)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          onClick={() => setActivePhoto(null)}
        >
          <button
            style={{ position: "absolute", top: 28, right: 28, background: "none", border: "1px solid #2a2a2a", color: "#f0ece4", width: 40, height: 40, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.sansFont }}
            onClick={() => setActivePhoto(null)}
          >
            ✕
          </button>
          <img
            src={activePhoto}
            alt="Gallery"
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style>{`
        .showtime-card:hover .showtime-accent { transform: scaleY(1) !important; }
        .showtime-card:hover .book-btn { background: #c8a96e !important; border-color: #c8a96e !important; color: #080808 !important; }
        .gallery-item:hover .gallery-img { transform: scale(1.05) !important; }
        .gallery-item:hover .gallery-overlay { background: rgba(8,8,8,0.45) !important; }
        .gallery-item:hover .gallery-expand { color: rgba(240,236,228,0.9) !important; }
      `}</style>
    </main>
  );
}