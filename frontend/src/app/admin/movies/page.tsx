"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbar";

interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  durationMinutes: number;
  startTime: string;
  language: string;
  rating: string;
  releaseDate: string;
  showStartDate: string;
  showEndDate: string;
  director: string;
  cast: string;
  status: string;
  primaryPhotoBase64?: string;
}

interface MovieFormData {
  title: string;
  description: string;
  genre: string;
  durationMinutes: number | string;
  startTime: string;
  language: string;
  rating: string;
  releaseDate: string;
  showStartDate: string;
  showEndDate: string;
  director: string;
  cast: string;
  status: string;
}

export default function ManageMovies() {
  const { isLoading, userRole } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    description: "",
    genre: "",
    durationMinutes: "",
    startTime: "19:00",
    language: "English",
    rating: "PG-13",
    releaseDate: "",
    showStartDate: "",
    showEndDate: "",
    director: "",
    cast: "",
    status: "ACTIVE",
  });

  // Verify admin role
  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") {
      router.push("/customer/dashboard");
    }
  }, [isLoading, userRole, router]);

  // Fetch movies
  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("http://localhost:8080/api/admin/movies", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMovies(data);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch movies");
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Unable to connect to server");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") {
      fetchMovies();
    }
  }, [isLoading, userRole]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Prepare data
      const movieData = {
        ...formData,
        durationMinutes: parseInt(formData.durationMinutes as string),
      };

      const url = editingMovie
        ? `http://localhost:8080/api/admin/movies/${editingMovie.id}`
        : "http://localhost:8080/api/admin/movies";

      const method = editingMovie ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || "Movie saved successfully");
        setShowModal(false);
        resetForm();
        fetchMovies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save movie");
      }
    } catch (err) {
      console.error("Error saving movie:", err);
      setError("Failed to save movie");
    }
  };

  // Handle delete movie
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess("Movie deleted successfully");
        fetchMovies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete movie");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
      setError("Failed to delete movie");
    }
  };

  // Handle edit movie
  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || "",
      description: movie.description || "",
      genre: movie.genre || "",
      durationMinutes: movie.durationMinutes || "",
      startTime: movie.startTime || "19:00",
      language: movie.language || "",
      rating: movie.rating || "PG-13",
      releaseDate: movie.releaseDate || "",
      showStartDate: movie.showStartDate || "",
      showEndDate: movie.showEndDate || "",
      director: movie.director || "",
      cast: movie.cast || "",
      status: movie.status || "ACTIVE",
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      durationMinutes: "",
      startTime: "19:00",
      language: "English",
      rating: "PG-13",
      releaseDate: "",
      showStartDate: "",
      showEndDate: "",
      director: "",
      cast: "",
      status: "ACTIVE",
    });
    setEditingMovie(null);
  };

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || movie.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (isLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#d4af37]">Loading Movies...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      <AdminNavbar />

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#d4af37] mb-2">Manage Movies</h2>
            <p className="text-[#f5f5f5]/60">Add, edit, and manage cinema movies</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#d4af37] text-[#0f0f0f] px-6 py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition"
          >
            + Add New Movie
          </button>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-900 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <p className="text-[#f5f5f5]/60 text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden hover:border-[#d4af37] transition"
              >
                {movie.primaryPhotoBase64 && (
                  <img
                    src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-[#d4af37]">{movie.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        movie.status === "ACTIVE"
                          ? "bg-green-900/20 text-green-400"
                          : movie.status === "COMING_SOON"
                          ? "bg-blue-900/20 text-blue-400"
                          : "bg-gray-700/20 text-gray-400"
                      }`}
                    >
                      {movie.status}
                    </span>
                  </div>
                  <p className="text-[#f5f5f5]/60 text-sm mb-3 line-clamp-2">
                    {movie.description}
                  </p>
                  <div className="space-y-1 text-sm text-[#f5f5f5]/60 mb-4">
                    <p>
                      <strong>Genre:</strong> {movie.genre}
                    </p>
                    <p>
                      <strong>Duration:</strong> {movie.durationMinutes} mins
                    </p>
                    <p>
                      <strong>Director:</strong> {movie.director}
                    </p>
                    <p>
                      <strong>Rating:</strong> {movie.rating}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(movie)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-[#d4af37]">
                {editingMovie ? "Edit Movie" : "Add New Movie"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>

                {/* Release Date */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate || ""}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Show Start Date */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Show Start Date
                  </label>
                  <input
                    type="date"
                    name="showStartDate"
                    value={formData.showStartDate || ""}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Show End Date */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Show End Date
                  </label>
                  <input
                    type="date"
                    name="showEndDate"
                    value={formData.showEndDate || ""}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Director */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Director
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Cast */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Cast (comma separated)
                  </label>
                  <input
                    type="text"
                    name="cast"
                    value={formData.cast}
                    onChange={handleInputChange}
                    placeholder="Actor 1, Actor 2, Actor 3"
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-6 py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition"
                >
                  {editingMovie ? "Update Movie" : "Create Movie"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}