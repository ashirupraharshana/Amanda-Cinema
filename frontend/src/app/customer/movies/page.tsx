"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

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

  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f0ece4", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <Navbar />

      {/* Hero header */}
      <section style={{ padding: "72px 48px 48px", maxWidth: 1400, margin: "0 auto" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#9e8a6e", textTransform: "uppercase", marginBottom: 16, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          Now Showing
        </p>
        <h1 style={{ fontSize: "clamp(48px, 6vw, 88px)", fontWeight: 400, lineHeight: 1, color: "#f0ece4", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          What's on
        </h1>
        <div style={{ width: 64, height: 2, background: "#c8a96e", marginTop: 24 }} />
      </section>

      {/* Genre filter bar */}
      <section style={{ padding: "0 48px 48px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              style={{
                padding: "8px 20px",
                borderRadius: 2,
                border: filter === g ? "1px solid #c8a96e" : "1px solid #2a2a2a",
                background: filter === g ? "#c8a96e" : "transparent",
                color: filter === g ? "#080808" : "#888",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Movies grid */}
      <section style={{ padding: "0 48px 96px", maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "80px 0" }}>
            <div style={{ width: 1, height: 48, background: "#c8a96e" }} />
            <p style={{ color: "#888", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, letterSpacing: "0.1em" }}>
              Loading films...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#555", fontFamily: "'Helvetica Neue', Arial, sans-serif", padding: "80px 0" }}>
            No films available.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {filtered.map((movie, i) => (
              <Link
                href={`/customer/movies/${movie.id}`}
                key={movie.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#111",
                    display: "block",
                  }}
                  className="movie-card"
                >
                  {/* Poster */}
                  <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden" }}>
                    {movie.primaryPhotoBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                        alt={movie.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.6s ease",
                        }}
                        className="movie-poster-img"
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#1a1a1a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "#333", fontSize: 11, letterSpacing: "0.2em", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                          NO IMAGE
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)",
                      }}
                    />

                    {/* Rating badge */}
                    {movie.rating && (
                      <div
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          background: "rgba(8,8,8,0.85)",
                          border: "1px solid #2a2a2a",
                          padding: "4px 10px",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          color: "#c8a96e",
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {movie.rating}
                      </div>
                    )}

                    {/* Bottom text overlay */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px 20px" }}>
                      {movie.genre && (
                        <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#c8a96e", textTransform: "uppercase", margin: "0 0 8px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                          {movie.genre}
                        </p>
                      )}
                      <h2 style={{ fontSize: 20, fontWeight: 400, color: "#f0ece4", margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                        {movie.title}
                      </h2>
                      <p style={{ fontSize: 12, color: "#777", margin: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                        {movie.durationMinutes} min
                        {movie.language ? ` · ${movie.language}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Hover CTA strip */}
                  <div
                    className="movie-card-cta"
                    style={{
                      padding: "14px 20px",
                      background: "#c8a96e",
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
                    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#080808", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontWeight: 600, textTransform: "uppercase" }}>
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
        .movie-card:hover .movie-card-cta {
          transform: translateY(0) !important;
        }
        .movie-card:hover .movie-poster-img {
          transform: scale(1.04) !important;
        }
      `}</style>
    </main>
  );
}