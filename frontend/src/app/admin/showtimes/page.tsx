"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbar";


interface Movie {
  id: number;
  title: string;
  genre: string;
  durationMinutes: number;
  rating: string;
  status: string;
  primaryPhotoBase64?: string;
}
interface Showtime {
  id: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  movie?: { id: number };
}

interface ShowtimeFormData {
  showDate: string;
  startTime: string;
  endTime: string;
  price: string;
  status: string;
}
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const API_BASE = "http://localhost:8080";

export default function ManageShowtimes() {
  const { isLoading, userRole } = useAuth();
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [movieShowtimes, setMovieShowtimes] = useState<Showtime[]>([]);
const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const [formData, setFormData] = useState<ShowtimeFormData>({
    showDate: "",
    startTime: "",
    endTime: "",
    price: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") {
      router.push("/customer/dashboard");
    }
  }, [isLoading, userRole, router]);

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") {
      fetchMovies();
    }
  }, [isLoading, userRole]);


const fetchMovies = async () => {
  try {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/admin/movies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setMovies(data);
    } else {
      alert("Failed to fetch movies");
    }
  } catch (error) {
    console.error(error);
    alert("Unable to connect to server");
  } finally {
    setLoadingMovies(false);
  }
};

    // Toast
const showToast = useCallback(
  (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  },
  []
);

const dismissToast = (id: number) =>
  setToasts((prev) => prev.filter((t) => t.id !== id));

// Token
const getToken = useCallback((): string | null => {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("No authentication token found", "error");
  }

  return token;
}, [showToast]);

  const openShowtimeModal = (movie: Movie) => {
  setSelectedMovie(movie);
  setShowModal(true);
  fetchMovieShowtimes(movie.id);

  setFormData({
    showDate: "",
    startTime: "",
    endTime: "",
    price: "",
    status: "ACTIVE",
  });
};

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovie) return;

    setSubmitting(true);

    try {
      const token = getToken();

if (!token) {
  setSubmitting(false);
  return;
}

      const res = await fetch(`${API_BASE}/api/admin/showtimes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          showDate: formData.showDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          price: parseFloat(formData.price),
          status: formData.status,
        }),
      });

      if (res.ok) {
  alert("Showtime added successfully");

  fetchMovieShowtimes(selectedMovie.id);

  setFormData({
    showDate: "",
    startTime: "",
    endTime: "",
    price: "",
    status: "ACTIVE",
  });
}else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to add showtime");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add showtime");
    } finally {
      setSubmitting(false);
    }
  };

const fetchMovieShowtimes = async (movieId: number) => {
  setLoadingShowtimes(true);

  try {
    const token = getToken();
    if (!token) return;

    const res = await fetch(
      `${API_BASE}/api/admin/showtimes?movieId=${movieId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const data = await res.json();

      const filtered = (Array.isArray(data) ? data : []).filter(
        (showtime: Showtime) => showtime.movie?.id === movieId
      );

      setMovieShowtimes(filtered);
    } else {
      setMovieShowtimes([]);
    }
  } catch (error) {
    console.error(error);
    setMovieShowtimes([]);
  } finally {
    setLoadingShowtimes(false);
  }
};

  const imgSrc = (b64: string) => `data:image/*;base64,${b64}`;

  if (isLoading || loadingMovies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <h2 className="text-2xl font-bold text-[#d4af37]">
          Loading Movies...
        </h2>
      </div>
    );
  }

   const handleDeleteShowtime = async (showtimeId: number) => {
    if (!confirm("Are you sure you want to delete this showtime?")) return;
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/admin/showtimes/${showtimeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
  showToast("Showtime deleted successfully", "success");
  if (selectedMovie) await fetchMovieShowtimes(selectedMovie.id);
} else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Failed to delete showtime", "error");
      }
    } catch {
      showToast("Failed to delete showtime", "error");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <AdminNavbar />

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d4af37] mb-2">
            Manage Showtimes
          </h1>
          <p className="text-gray-400">
            Select a movie and add showtimes
          </p>
        </div>

        {toasts.length > 0 && (
  <div className="fixed top-4 right-4 z-50 space-y-3">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`rounded-lg px-4 py-3 border shadow-lg ${
          toast.type === "success"
            ? "bg-green-900/90 border-green-700 text-green-100"
            : toast.type === "error"
            ? "bg-red-900/90 border-red-700 text-red-100"
            : "bg-gray-900/90 border-gray-700 text-gray-100"
        }`}
      >
        {toast.message}
      </div>
    ))}
  </div>
)}

        {movies.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-10 text-center">
            <p className="text-gray-400">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden hover:border-[#d4af37] transition"
              >
                {movie.primaryPhotoBase64 ? (
                  <div className="w-full h-64 overflow-hidden bg-black">
                    <img
                      src={imgSrc(movie.primaryPhotoBase64)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;

                        if (!target.dataset.fallback) {
                          target.dataset.fallback = "1";
                          target.src = `data:image/png;base64,${movie.primaryPhotoBase64}`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-[#d4af37]">
                      {movie.title}
                    </h2>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        movie.status === "ACTIVE"
                          ? "bg-green-900/30 text-green-400"
                          : movie.status === "COMING_SOON"
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-gray-700/30 text-gray-400"
                      }`}
                    >
                      {movie.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-400 mb-5">
                    <p>
                      <strong>Genre:</strong> {movie.genre}
                    </p>
                    <p>
                      <strong>Duration:</strong> {movie.durationMinutes} mins
                    </p>
                    <p>
                      <strong>Rating:</strong> {movie.rating}
                    </p>
                  </div>

                  <button
                    onClick={() => openShowtimeModal(movie)}
                    className="w-full bg-[#d4af37] text-[#0f0f0f] py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition"
                  >
                    + Add Showtime
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMovie && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-[#1a1a1a] rounded-xl w-full max-w-3xl border border-gray-800 my-10">

      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">
            Add Showtime
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            {selectedMovie.title}
          </p>
        </div>

        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-white text-3xl leading-none"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

        {/* LEFT SIDE - FORM */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Show Date
              </label>

              <input
                type="date"
                name="showDate"
                value={formData.showDate}
                onChange={handleInputChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Start Time
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  End Time
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ticket Price
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="Enter price"
                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#d4af37] text-[#0f0f0f] py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Showtime"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT SIDE - SHOWTIMES */}
        <div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#d4af37]">
              Assigned Showtimes
            </h3>

            <span className="bg-[#d4af37] text-[#0f0f0f] text-sm px-3 py-1 rounded-full font-semibold">
              {movieShowtimes.length} Showtimes
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">

            {movieShowtimes.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-dashed border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No showtimes assigned
                </p>
              </div>
            ) : (
              movieShowtimes.map((showtime) => (
                <div
                  key={showtime.id}
                  className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 hover:border-[#d4af37] transition"
                >

                  <div className="flex justify-between items-start mb-3">

                    <div>
                      <h4 className="text-[#d4af37] font-semibold">
                        {showtime.showDate}
                      </h4>

                      <p className="text-sm text-gray-400 mt-1">
                        {showtime.startTime} - {showtime.endTime}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        showtime.status === "ACTIVE"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {showtime.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">

                    <p className="text-white font-medium">
                      ${showtime.price}
                    </p>

                    <button
                                    type="button"
                                    onClick={() => handleDeleteShowtime(showtime.id)}
                                    className="text-red-400 hover:text-red-300 transition ml-2 flex-shrink-0"
                                    title="Delete showtime"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>

      </div>
    </div>
  </div>
)}
    </main>
  );
}
