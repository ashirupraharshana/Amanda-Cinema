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

interface Showtime {
  id: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

interface MoviePhoto {
  id: number;
  isPrimary: boolean;
  photoData: string;
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

interface ShowtimeFormData {
  showDate: string;
  startTime: string;
  endTime: string;
  price: number | string;
  status: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ManageMovies() {
  const { isLoading, userRole } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedMovieForPhoto, setSelectedMovieForPhoto] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isPrimaryPhoto, setIsPrimaryPhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [moviePhotos, setMoviePhotos] = useState<MoviePhoto[]>([]);
  const [movieShowtimes, setMovieShowtimes] = useState<Showtime[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [showAddShowtimeForm, setShowAddShowtimeForm] = useState(false);
  const [showtimeFormData, setShowtimeFormData] = useState<ShowtimeFormData>({
    showDate: "",
    startTime: "",
    endTime: "",
    price: "",
    status: "ACTIVE"
  });

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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") {
      router.push("/customer/dashboard");
    }
  }, [isLoading, userRole, router]);

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
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
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to fetch movies", "error");
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      showToast("Unable to connect to server", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMoviePhotos = async (movieId: number) => {
    setLoadingPhotos(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/admin/movies/${movieId}/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMoviePhotos(data);
      } else {
        showToast("Failed to load photos", "error");
      }
    } catch (err) {
      console.error("Error loading photos:", err);
      showToast("Failed to load photos", "error");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchMovieShowtimes = async (movieId: number) => {
    setLoadingShowtimes(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/admin/showtimes?movieId=${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const filteredShowtimes = data.filter((st: any) => st.movie.id === movieId);
        setMovieShowtimes(filteredShowtimes);
      } else {
        showToast("Failed to load showtimes", "error");
      }
    } catch (err) {
      console.error("Error loading showtimes:", err);
      showToast("Failed to load showtimes", "error");
    } finally {
      setLoadingShowtimes(false);
    }
  };

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") {
      fetchMovies();
    }
  }, [isLoading, userRole]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShowtimeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShowtimeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUploadInEdit = async () => {
    if (!photoFile || !editingMovie) {
      showToast("Please select a photo to upload", "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("isPrimary", "false");

      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${editingMovie.id}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        showToast("Photo uploaded successfully", "success");
        setPhotoFile(null);
        setPhotoPreview("");
        fetchMoviePhotos(editingMovie.id);
        fetchMovies();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to upload photo", "error");
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      showToast("Failed to upload photo", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (movieId: number, photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${movieId}/photos/${photoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showToast("Photo deleted successfully", "success");
        fetchMoviePhotos(movieId);
        fetchMovies();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete photo", "error");
      }
    } catch (err) {
      console.error("Error deleting photo:", err);
      showToast("Failed to delete photo", "error");
    }
  };

  const handleAddShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/admin/showtimes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId: editingMovie.id,
          ...showtimeFormData,
          price: parseFloat(showtimeFormData.price as string),
        }),
      });

      if (response.ok) {
        showToast("Showtime added successfully", "success");
        setShowAddShowtimeForm(false);
        setShowtimeFormData({
          showDate: "",
          startTime: "",
          endTime: "",
          price: "",
          status: "ACTIVE"
        });
        fetchMovieShowtimes(editingMovie.id);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to add showtime", "error");
      }
    } catch (err) {
      console.error("Error adding showtime:", err);
      showToast("Failed to add showtime", "error");
    }
  };

  const handleDeleteShowtime = async (showtimeId: number) => {
    if (!confirm("Are you sure you want to delete this showtime?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/admin/showtimes/${showtimeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast("Showtime deleted successfully", "success");
        if (editingMovie) {
          fetchMovieShowtimes(editingMovie.id);
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete showtime", "error");
      }
    } catch (err) {
      console.error("Error deleting showtime:", err);
      showToast("Failed to delete showtime", "error");
    }
  };

  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !selectedMovieForPhoto) {
      showToast("Please select a photo to upload", "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("isPrimary", String(isPrimaryPhoto));

      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${selectedMovieForPhoto.id}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || "Photo uploaded successfully", "success");
        setShowPhotoModal(false);
        resetPhotoForm();
        fetchMovies();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to upload photo", "error");
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      showToast("Failed to upload photo", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const resetPhotoForm = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    setIsPrimaryPhoto(false);
    setSelectedMovieForPhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

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
        showToast(data.message || "Movie saved successfully", "success");
        setShowModal(false);
        resetForm();
        fetchMovies();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to save movie", "error");
      }
    } catch (err) {
      console.error("Error saving movie:", err);
      showToast("Failed to save movie", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/movies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast("Movie deleted successfully", "success");
        fetchMovies();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete movie", "error");
      }
    } catch (err) {
      console.error("Error deleting movie:", err);
      showToast("Failed to delete movie", "error");
    }
  };

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
    
    fetchMoviePhotos(movie.id);
    fetchMovieShowtimes(movie.id);
    
    setShowModal(true);
  };

  const handleUploadPhoto = (movie: Movie) => {
    setSelectedMovieForPhoto(movie);
    setShowPhotoModal(true);
  };

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
    setMoviePhotos([]);
    setMovieShowtimes([]);
    setPhotoFile(null);
    setPhotoPreview("");
    setShowAddShowtimeForm(false);
  };

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

      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-lg border backdrop-blur-sm animate-slideIn ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-100'
                : toast.type === 'error'
                ? 'bg-red-900/90 border-red-700 text-red-100'
                : 'bg-blue-900/90 border-blue-700 text-blue-100'
            }`}
          >
            <p className="font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 py-12">
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
                {movie.primaryPhotoBase64 ? (
                  <img
                    src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
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
                    <p><strong>Genre:</strong> {movie.genre}</p>
                    <p><strong>Duration:</strong> {movie.durationMinutes} mins</p>
                    <p><strong>Director:</strong> {movie.director}</p>
                    <p><strong>Rating:</strong> {movie.rating}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(movie)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleUploadPhoto(movie)}
                      className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-3 py-2 rounded hover:bg-[#c4a037] transition text-sm"
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg max-w-6xl w-full my-8">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-[#d4af37]">
                {editingMovie ? "Edit Movie" : "Add New Movie"}
              </h3>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-[#d4af37] border-b border-gray-800 pb-2">
                      Movie Information
                    </h4>
                    
                    <div>
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

                    <div>
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

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

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

                  {editingMovie && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-[#d4af37] border-b border-gray-800 pb-2 mb-4">
                          Movie Photos
                        </h4>
                        
                        <div className="mb-4 p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                          <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                            Add New Photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-[#f5f5f5] text-sm mb-2"
                          />
                          {photoPreview && (
                            <div className="mt-2 mb-2">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handlePhotoUploadInEdit}
                            disabled={!photoFile || uploadingPhoto}
                            className="w-full bg-[#d4af37] text-[#0f0f0f] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#c4a037] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                          {loadingPhotos ? (
                            <div className="col-span-2 text-center py-4 text-[#f5f5f5]/60">
                              Loading photos...
                            </div>
                          ) : moviePhotos.length === 0 ? (
                            <div className="col-span-2 text-center py-4 text-[#f5f5f5]/60 bg-[#0f0f0f] rounded-lg border border-gray-800">
                              No photos uploaded
                            </div>
                          ) : (
                            moviePhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className={`relative group rounded-lg overflow-hidden border-2 ${
                                  photo.isPrimary ? 'border-[#d4af37]' : 'border-gray-800'
                                }`}
                              >
                                <img
                                  src={`data:image/jpeg;base64,${photo.photoData}`}
                                  alt="Movie"
                                  className="w-full h-32 object-cover"
                                />
                                {photo.isPrimary && (
                                  <div className="absolute top-2 left-2 bg-[#d4af37] text-[#0f0f0f] px-2 py-1 rounded text-xs font-bold">
                                    PRIMARY
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => editingMovie && handleDeletePhoto(editingMovie.id, photo.id)}
                                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete photo"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-4">
                          <h4 className="text-lg font-semibold text-[#d4af37]">Showtimes</h4>
                          <button
                            type="button"
                            onClick={() => setShowAddShowtimeForm(!showAddShowtimeForm)}
                            className="text-sm bg-[#d4af37] text-[#0f0f0f] px-3 py-1 rounded hover:bg-[#c4a037] transition"
                          >
                            {showAddShowtimeForm ? "Cancel" : "+ Add Showtime"}
                          </button>
                        </div>

                        {showAddShowtimeForm && (
                          <div className="mb-4 p-4 bg-[#0f0f0f] rounded-lg border border-gray-800">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-[#f5f5f5] mb-1">Show Date</label>
                                <input
                                  type="date"
                                  name="showDate"
                                  value={showtimeFormData.showDate}
                                  onChange={handleShowtimeInputChange}
                                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-[#f5f5f5] text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#f5f5f5] mb-1">Price ($)</label>
                                <input
                                  type="number"
                                  name="price"
                                  step="0.01"
                                  value={showtimeFormData.price}
                                  onChange={handleShowtimeInputChange}
                                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-[#f5f5f5] text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#f5f5f5] mb-1">Start Time</label>
                                <input
                                  type="time"
                                  name="startTime"
                                  value={showtimeFormData.startTime}
                                  onChange={handleShowtimeInputChange}
                                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-[#f5f5f5] text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#f5f5f5] mb-1">End Time</label>
                                <input
                                  type="time"
                                  name="endTime"
                                  value={showtimeFormData.endTime}
                                  onChange={handleShowtimeInputChange}
                                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-1.5 text-[#f5f5f5] text-sm"
                                  required
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddShowtime}
                              className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition"
                            >
                              Add Showtime
                            </button>
                          </div>
                        )}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {loadingShowtimes ? (
                            <div className="text-center py-4 text-[#f5f5f5]/60">Loading showtimes...</div>
                          ) : movieShowtimes.length === 0 ? (
                            <div className="text-center py-4 text-[#f5f5f5]/60 bg-[#0f0f0f] rounded-lg border border-gray-800">
                              No showtimes scheduled
                            </div>
                          ) : (
                            movieShowtimes.map((showtime) => (
                              <div key={showtime.id} className="p-3 bg-[#0f0f0f] border border-gray-800 rounded-lg hover:border-gray-700 transition">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[#d4af37] font-semibold text-sm">{showtime.showDate}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        showtime.status === "ACTIVE" ? "bg-green-900/20 text-green-400" : "bg-gray-700/20 text-gray-400"
                                      }`}>
                                        {showtime.status}
                                      </span>
                                    </div>
                                    <div className="text-xs text-[#f5f5f5]/60">
                                      <span>{showtime.startTime}</span> - <span>{showtime.endTime}</span>
                                      <span className="ml-2 text-[#d4af37]">${showtime.price}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteShowtime(showtime.id)}
                                    className="text-red-400 hover:text-red-300 transition ml-2"
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
                  )}
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-800">
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
        </div>
      )}

      {showPhotoModal && selectedMovieForPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-[#d4af37]">
                Upload Photo for {selectedMovieForPhoto.title}
              </h3>
            </div>

            <form onSubmit={handlePhotoUpload} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f5f5f5] mb-2">Select Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37]"
                    required
                  />
                </div>

                {photoPreview && (
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimaryPhoto}
                    onChange={(e) => setIsPrimaryPhoto(e.target.checked)}
                    className="w-4 h-4 text-[#d4af37] bg-[#0f0f0f] border-gray-800 rounded focus:ring-[#d4af37]"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-[#f5f5f5]">Set as primary photo</label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-6 py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoModal(false);
                    resetPhotoForm();
                  }}
                  disabled={uploadingPhoto}
                  className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}