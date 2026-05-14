"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

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
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
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
        // Default select first date
        const dates = Object.keys(
          showtimesData.reduce((acc: Record<string, boolean>, s: Showtime) => {
            acc[s.showDate] = true;
            return acc;
          }, {})
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 1, height: 48, background: "#c8a96e" }} />
          <p style={{ color: "#666", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, letterSpacing: "0.1em" }}>
            Loading film...
          </p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#555", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>Film not found.</p>
      </div>
    );
  }

  const groupedShowtimes = groupByDate(showtimes);
  const sortedDates = Object.keys(groupedShowtimes).sort();
  const displayedShowtimes = selectedDate ? groupedShowtimes[selectedDate] || [] : [];

  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f0ece4", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <Navbar />

      {/* ── Cinematic Hero ── */}
      <section style={{ position: "relative", height: "70vh", minHeight: 500, overflow: "hidden" }}>
        {/* Blurred backdrop */}
        {movie.primaryPhotoBase64 && (
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              backgroundImage: `url(data:image/jpeg;base64,${movie.primaryPhotoBase64})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(24px) brightness(0.25)",
              transform: "scale(1.1)",
            }}
          />
        )}

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(8,8,8,0.98) 35%, rgba(8,8,8,0.5) 70%, rgba(8,8,8,0.2) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            background: "linear-gradient(to top, #080808, transparent)",
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 48px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 56,
          }}
        >
          {/* Poster */}
          <div
            style={{
              flexShrink: 0,
              width: 220,
              aspectRatio: "2/3",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              border: "1px solid rgba(200,169,110,0.2)",
            }}
          >
            {movie.primaryPhotoBase64 ? (
              <img
                src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                alt={movie.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#333", fontSize: 10, letterSpacing: "0.2em", fontFamily: "sans-serif" }}>NO IMAGE</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, maxWidth: 600 }}>
            {movie.genre && (
              <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", margin: "0 0 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                {movie.genre}
              </p>
            )}
            <h1 style={{ fontSize: "clamp(36px, 4vw, 60px)", fontWeight: 400, color: "#f0ece4", margin: "0 0 16px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {movie.title}
            </h1>

            {/* Meta pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 24px" }}>
              {movie.rating && (
                <span style={{ padding: "4px 12px", border: "1px solid #2a2a2a", fontSize: 11, letterSpacing: "0.15em", color: "#c8a96e", fontFamily: "sans-serif", fontWeight: 600 }}>
                  {movie.rating}
                </span>
              )}
              <span style={{ padding: "4px 12px", border: "1px solid #2a2a2a", fontSize: 11, letterSpacing: "0.1em", color: "#777", fontFamily: "sans-serif" }}>
                {movie.durationMinutes} min
              </span>
              {movie.language && (
                <span style={{ padding: "4px 12px", border: "1px solid #2a2a2a", fontSize: 11, letterSpacing: "0.1em", color: "#777", fontFamily: "sans-serif" }}>
                  {movie.language}
                </span>
              )}
            </div>

            <p style={{ fontSize: 15, color: "#a09880", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 500 }}>
              {movie.description}
            </p>

            {/* Credits */}
            <div style={{ display: "flex", gap: 40 }}>
              {movie.director && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "sans-serif" }}>Director</p>
                  <p style={{ fontSize: 13, color: "#c8a96e", margin: 0, fontFamily: "sans-serif" }}>{movie.director}</p>
                </div>
              )}
              {movie.releaseDate && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", margin: "0 0 4px", fontFamily: "sans-serif" }}>Released</p>
                  <p style={{ fontSize: 13, color: "#a09880", margin: 0, fontFamily: "sans-serif" }}>{movie.releaseDate}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "64px 48px 96px" }}>

        {/* ── Showtimes ── */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 40 }}>
            <h2 style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", margin: 0, fontFamily: "sans-serif", fontWeight: 500 }}>
              Showtimes
            </h2>
            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
          </div>

          {showtimes.length === 0 ? (
            <p style={{ color: "#555", fontFamily: "sans-serif", fontSize: 14 }}>No upcoming showtimes available.</p>
          ) : (
            <>
              {/* Date selector */}
              <div style={{ display: "flex", gap: 2, marginBottom: 40, overflowX: "auto", paddingBottom: 4 }}>
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
                        background: active ? "#c8a96e" : "#0f0f0f",
                        border: active ? "1px solid #c8a96e" : "1px solid #1e1e1e",
                        cursor: "pointer",
                        textAlign: "center",
                        minWidth: 72,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <p style={{ fontSize: 9, letterSpacing: "0.2em", color: active ? "#5a3e1b" : (today ? "#c8a96e" : "#555"), margin: "0 0 4px", fontFamily: "sans-serif", fontWeight: 600 }}>
                        {today ? "TODAY" : weekday}
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 400, color: active ? "#080808" : "#f0ece4", margin: "0 0 2px", fontFamily: "Georgia, serif", lineHeight: 1 }}>
                        {day}
                      </p>
                      <p style={{ fontSize: 9, letterSpacing: "0.15em", color: active ? "#5a3e1b" : "#555", margin: 0, fontFamily: "sans-serif" }}>
                        {month}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Selected date label */}
              {selectedDate && (
                <p style={{ fontSize: 13, color: "#555", fontFamily: "sans-serif", marginBottom: 24, letterSpacing: "0.05em" }}>
                  {formatDate(selectedDate)}
                </p>
              )}

              {/* Showtime cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                {displayedShowtimes.map((showtime) => (
                  <div
                    key={showtime.id}
                    style={{
                      background: "#0f0f0f",
                      border: "1px solid #1a1a1a",
                      padding: "28px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    className="showtime-card"
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 3,
                        height: "100%",
                        background: "#c8a96e",
                        transform: "scaleY(0)",
                        transformOrigin: "bottom",
                        transition: "transform 0.25s ease",
                      }}
                      className="showtime-accent"
                    />

                    <p style={{ fontSize: 28, fontWeight: 400, color: "#f0ece4", margin: 0, letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>
                      {formatTime(showtime.startTime)}
                    </p>
                    <p style={{ fontSize: 12, color: "#444", margin: 0, fontFamily: "sans-serif" }}>
                      ends {formatTime(showtime.endTime)}
                    </p>
                    <p style={{ fontSize: 16, color: "#c8a96e", margin: "16px 0 0", fontFamily: "sans-serif", letterSpacing: "0.05em" }}>
                      Rs. {Number(showtime.price).toLocaleString()}
                    </p>

                    <button
                      onClick={() => router.push(`/customer/booking/${showtime.id}`)}
                      style={{
                        marginTop: 20,
                        padding: "12px 0",
                        background: "transparent",
                        border: "1px solid #2a2a2a",
                        color: "#f0ece4",
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "sans-serif",
                        fontWeight: 600,
                        width: "100%",
                        transition: "all 0.2s ease",
                      }}
                      className="book-btn"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Cast & Details ── */}
        {(movie.cast || movie.showStartDate || movie.showEndDate) && (
          <section style={{ marginBottom: 80 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", margin: 0, fontFamily: "sans-serif", fontWeight: 500 }}>
                Details
              </h2>
              <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 32 }}>
              {movie.cast && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "sans-serif" }}>Cast</p>
                  <p style={{ fontSize: 14, color: "#a09880", lineHeight: 1.6, margin: 0, fontFamily: "sans-serif" }}>{movie.cast}</p>
                </div>
              )}
              {movie.showStartDate && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "sans-serif" }}>Show Period</p>
                  <p style={{ fontSize: 14, color: "#a09880", lineHeight: 1.6, margin: 0, fontFamily: "sans-serif" }}>
                    {movie.showStartDate} — {movie.showEndDate || "ongoing"}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Photos ── */}
        {photos.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 13, letterSpacing: "0.3em", color: "#c8a96e", textTransform: "uppercase", margin: 0, fontFamily: "sans-serif", fontWeight: 500 }}>
                Gallery
              </h2>
              <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", cursor: "pointer" }}
                  onClick={() => setActivePhoto(`data:image/jpeg;base64,${photo.photoData}`)}
                  className="gallery-item"
                >
                  <img
                    src={`data:image/jpeg;base64,${photo.photoData}`}
                    alt={`${movie.title} photo`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                    className="gallery-img"
                  />
                  {photo.isPrimary && (
                    <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(200,169,110,0.9)", padding: "3px 8px", fontSize: 9, letterSpacing: "0.15em", color: "#080808", fontFamily: "sans-serif", fontWeight: 700 }}>
                      PRIMARY
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(8,8,8,0)",
                      transition: "background 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="gallery-overlay"
                  >
                    <span style={{ color: "rgba(240,236,228,0)", fontSize: 12, letterSpacing: "0.2em", fontFamily: "sans-serif", transition: "color 0.3s ease" }} className="gallery-expand">
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,8,8,0.97)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => setActivePhoto(null)}
        >
          <button
            style={{
              position: "absolute",
              top: 32,
              right: 32,
              background: "none",
              border: "1px solid #2a2a2a",
              color: "#f0ece4",
              width: 40,
              height: 40,
              cursor: "pointer",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
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
        .movie-card:hover .movie-card-cta { transform: translateY(0) !important; }
        .movie-card:hover .movie-poster-img { transform: scale(1.04) !important; }
      `}</style>
    </main>
  );
}