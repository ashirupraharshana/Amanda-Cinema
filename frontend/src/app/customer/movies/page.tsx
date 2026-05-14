"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useTheme } from "../../context/ThemeContext";

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

export default function CustomerMoviesPage() {
  const { isDark } = useTheme();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/movies");
        const data = await res.json();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = ["ALL", ...Array.from(new Set(movies.map((m) => m.genre).filter(Boolean)))];
  const filtered = filter === "ALL" ? movies : movies.filter((m) => m.genre === filter);

  const t = {
    pageBg:       isDark ? "#080808" : "#faf8f4",
    pageText:     isDark ? "#f0ece4" : "#1a1814",
    gold:         "#c8a96e",
    goldMuted:    isDark ? "#9e8a6e" : "#a08a5a",
    sansFont:     "'Helvetica Neue', Arial, sans-serif",
    serifFont:    "'Georgia', 'Times New Roman', serif",
    filterBorder: isDark ? "#2a2a2a" : "#ddd8cc",
    filterText:   isDark ? "#888" : "#aaa090",
    cardBg:       isDark ? "#111111" : "#ffffff",
    cardBorder:   isDark ? "#1a1a1a" : "#eae6de",
    gradFrom:     isDark ? "rgba(8,8,8,0.97)" : "rgba(20,18,14,0.92)",
    gradMid:      isDark ? "rgba(8,8,8,0.3)"  : "rgba(20,18,14,0.25)",
    ratingBg:     isDark ? "rgba(8,8,8,0.85)" : "rgba(20,18,14,0.75)",
    ratingBorder: isDark ? "#2a2a2a" : "rgba(200,169,110,0.3)",
    noImgBg:      isDark ? "#1a1a1a" : "#ede9e0",
    noImgText:    isDark ? "#333" : "#bbb4a0",
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

      {/* Hero header */}
      <section style={{ padding: "clamp(40px,6vw,72px) clamp(20px,4vw,48px) clamp(24px,4vw,48px)", maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: t.goldMuted, textTransform: "uppercase", marginBottom: 16, fontFamily: t.sansFont, transition: "color 0.4s ease" }}>
          Now Showing
        </p>
        <h1 style={{ fontSize: "clamp(40px,6vw,88px)", fontWeight: 400, lineHeight: 1, color: t.pageText, margin: "0 0 8px", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
          What's on
        </h1>
        <div style={{ width: 64, height: 2, background: t.gold, marginTop: 24 }} />
      </section>

      {/* Genre filter */}
      <section style={{ padding: "0 clamp(20px,4vw,48px) clamp(24px,4vw,48px)", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {genres.map((g) => {
            const active = filter === g;
            return (
              <button
                key={g}
                onClick={() => setFilter(g)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 2,
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
                {g}
              </button>
            );
          })}
        </div>
      </section>

      {/* Movies grid */}
      <section style={{ padding: "0 clamp(20px,4vw,48px) 96px", maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "80px 0" }}>
            <div style={{ width: 1, height: 48, background: t.gold }} />
            <p style={{ color: t.filterText, fontFamily: t.sansFont, fontSize: 13, letterSpacing: "0.1em" }}>Loading films...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: t.filterText, fontFamily: t.sansFont, padding: "80px 0" }}>No films available.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px,25vw,280px),1fr))", gap: 2 }}>
            {filtered.map((movie) => (
              <Link href={`/customer/movies/${movie.id}`} key={movie.id} style={{ textDecoration: "none", color: "inherit" }}>
                <article
                  className="movie-card"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: t.cardBg,
                    display: "block",
                    border: `1px solid ${t.cardBorder}`,
                    transition: "border-color 0.4s ease, background 0.4s ease",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
                    {movie.primaryPhotoBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                        alt={movie.title}
                        className="movie-poster-img"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: t.noImgBg, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.4s ease" }}>
                        <span style={{ color: t.noImgText, fontSize: 11, letterSpacing: "0.2em", fontFamily: t.sansFont }}>NO IMAGE</span>
                      </div>
                    )}

                    {/* Gradient */}
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${t.gradFrom} 0%, ${t.gradMid} 50%, transparent 100%)`, transition: "background 0.4s ease" }} />

                    {/* Rating */}
                    {movie.rating && (
                      <div style={{ position: "absolute", top: 12, right: 12, background: t.ratingBg, border: `1px solid ${t.ratingBorder}`, padding: "4px 10px", fontSize: 10, letterSpacing: "0.15em", color: t.gold, fontFamily: t.sansFont, fontWeight: 600, transition: "background 0.4s ease" }}>
                        {movie.rating}
                      </div>
                    )}

                    {/* Text overlay */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 16px 16px" }}>
                      {movie.genre && (
                        <p style={{ fontSize: 10, letterSpacing: "0.25em", color: t.gold, textTransform: "uppercase", margin: "0 0 6px", fontFamily: t.sansFont }}>
                          {movie.genre}
                        </p>
                      )}
                      <h2 style={{ fontSize: "clamp(16px,2vw,20px)", fontWeight: 400, color: "#f0ece4", margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.01em", fontFamily: t.serifFont }}>
                        {movie.title}
                      </h2>
                      <p style={{ fontSize: 12, color: "#888", margin: 0, fontFamily: t.sansFont }}>
                        {movie.durationMinutes} min{movie.language ? ` · ${movie.language}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Hover CTA */}
                  <div
                    className="movie-card-cta"
                    style={{
                      padding: "14px 16px",
                      background: t.gold,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transform: "translateY(100%)",
                      transition: "transform 0.3s ease",
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#080808", fontFamily: t.sansFont, fontWeight: 600, textTransform: "uppercase" }}>
                      Book Tickets
                    </span>
                    <span style={{ fontSize: 18, color: "#080808" }}>→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .movie-card:hover .movie-card-cta { transform: translateY(0) !important; }
        .movie-card:hover .movie-poster-img { transform: scale(1.04) !important; }
        @media (max-width: 480px) {
          .movie-card-cta { transform: translateY(0) !important; }
        }
      `}</style>
    </main>
  );
}