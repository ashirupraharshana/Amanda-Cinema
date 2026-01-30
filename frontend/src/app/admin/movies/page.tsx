"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
<<<<<<< Updated upstream
=======
  movieId: number;
>>>>>>> Stashed changes
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

<<<<<<< Updated upstream
interface MoviePhoto {
  id: number;
  isPrimary: boolean;
  photoData: string;
}

=======
>>>>>>> Stashed changes
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
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loadingData, setLoadingData] = useState(true);
<<<<<<< Updated upstream
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedMovieForPhoto, setSelectedMovieForPhoto] = useState<Movie | null>(null);
=======
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [showAddShowtimeForm, setShowAddShowtimeForm] = useState(false);
  const [selectedMovieForShowtime, setSelectedMovieForShowtime] = useState<Movie | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

=======
  const [showtimeFormData, setShowtimeFormData] = useState<ShowtimeFormData>({
    showDate: "",
    startTime: "",
    endTime: "",
    price: "",
    status: "ACTIVE",
  });

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Verify admin role
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
  // Fetch showtimes for a specific movie
  const fetchShowtimes = async (movieId: number) => {
    setLoadingShowtimes(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/showtimes/movie/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
>>>>>>> Stashed changes
        },
      });

      if (response.ok) {
        const data = await response.json();
<<<<<<< Updated upstream
        const filteredShowtimes = data.filter((st: any) => st.movie.id === movieId);
        setMovieShowtimes(filteredShowtimes);
      } else {
        showToast("Failed to load showtimes", "error");
      }
    } catch (err) {
      console.error("Error loading showtimes:", err);
      showToast("Failed to load showtimes", "error");
=======
        setShowtimes(data);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to fetch showtimes", "error");
        setShowtimes([]);
      }
    } catch (err) {
      console.error("Failed to fetch showtimes:", err);
      showToast("Unable to fetch showtimes", "error");
      setShowtimes([]);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // Handle showtime form input changes
>>>>>>> Stashed changes
  const handleShowtimeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShowtimeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

<<<<<<< Updated upstream
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

=======
  // Handle form submit (Create or Update)
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // Handle showtime submit (Create or Update)
  const handleShowtimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMovieForShowtime) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const showtimeData = {
        movieId: selectedMovieForShowtime.id,
        showDate: showtimeFormData.showDate,
        startTime: showtimeFormData.startTime,
        endTime: showtimeFormData.endTime,
        price: parseFloat(showtimeFormData.price as string),
        status: showtimeFormData.status,
      };

      const url = editingShowtime
        ? `http://localhost:8080/api/admin/showtimes/${editingShowtime.id}`
        : "http://localhost:8080/api/admin/showtimes";

      const method = editingShowtime ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(showtimeData),
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || (editingShowtime ? "Showtime updated successfully" : "Showtime added successfully"), "success");
        setShowAddShowtimeForm(false);
        resetShowtimeForm();
        setEditingShowtime(null);
        // Refresh showtimes
        fetchShowtimes(selectedMovieForShowtime.id);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to save showtime", "error");
      }
    } catch (err) {
      console.error("Error saving showtime:", err);
      showToast("Failed to save showtime", "error");
    }
  };

  // Handle delete showtime
  const handleDeleteShowtime = async (showtimeId: number) => {
    if (!confirm("Are you sure you want to delete this showtime?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/showtimes/${showtimeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast("Showtime deleted successfully", "success");
        // Refresh showtimes
        if (selectedMovieForShowtime) {
          fetchShowtimes(selectedMovieForShowtime.id);
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

  // Handle edit showtime
  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowtimeFormData({
      showDate: showtime.showDate,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      price: showtime.price,
      status: showtime.status,
    });
    setShowAddShowtimeForm(true);
  };

  // Handle delete movie
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
  const handleUploadPhoto = (movie: Movie) => {
    setSelectedMovieForPhoto(movie);
    setShowPhotoModal(true);
  };

=======
  // Handle add showtime
  const handleAddShowtime = (movie: Movie) => {
    setSelectedMovieForShowtime(movie);
    setShowtimes([]);
    setShowAddShowtimeForm(false);
    setEditingShowtime(null);
    resetShowtimeForm();
    setShowShowtimeModal(true);
    // Fetch existing showtimes
    fetchShowtimes(movie.id);
  };

  // Reset form
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // Reset showtime form
  const resetShowtimeForm = () => {
    setShowtimeFormData({
      showDate: "",
      startTime: "",
      endTime: "",
      price: "",
      status: "ACTIVE",
    });
    setEditingShowtime(null);
  };

  // Filter movies
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-lg border backdrop-blur-sm animate-slideIn ${
=======
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border animate-slide-in ${
>>>>>>> Stashed changes
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-100'
                : toast.type === 'error'
                ? 'bg-red-900/90 border-red-700 text-red-100'
                : 'bg-blue-900/90 border-blue-700 text-blue-100'
            }`}
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <p className="flex-1">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-2">Manage Movies</h2>
            <p className="text-sm sm:text-base text-[#f5f5f5]/60">Add, edit, and manage cinema movies</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/photos"
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center text-sm sm:text-base"
            >
              📸 Manage Photos
            </Link>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-[#d4af37] text-[#0f0f0f] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition text-sm sm:text-base"
            >
              + Add New Movie
            </button>
          </div>
        </div>

<<<<<<< Updated upstream
        <div className="mb-6 flex gap-4">
=======
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
>>>>>>> Stashed changes
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="ENDED">Ended</option>
          </select>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-gray-800">
            <p className="text-[#f5f5f5]/60 text-base sm:text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
<<<<<<< Updated upstream
                  <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
=======
                  <div className="w-full h-48 bg-gray-800 flex flex-col items-center justify-center text-[#f5f5f5]/40">
                    <span className="text-4xl mb-2">📸</span>
                    <button
                      onClick={() => handleAddShowtime(movie)}
                      className="text-sm text-[#d4af37] hover:underline"
                    >
                      Add Showtimes
                    </button>
>>>>>>> Stashed changes
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] line-clamp-1">{movie.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
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
                  <p className="text-[#f5f5f5]/60 text-xs sm:text-sm mb-3 line-clamp-2">
                    {movie.description}
                  </p>
<<<<<<< Updated upstream
                  <div className="space-y-1 text-sm text-[#f5f5f5]/60 mb-4">
                    <p><strong>Genre:</strong> {movie.genre}</p>
                    <p><strong>Duration:</strong> {movie.durationMinutes} mins</p>
                    <p><strong>Director:</strong> {movie.director}</p>
                    <p><strong>Rating:</strong> {movie.rating}</p>
=======
                  <div className="space-y-1 text-xs sm:text-sm text-[#f5f5f5]/60 mb-4">
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
>>>>>>> Stashed changes
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleEdit(movie)}
<<<<<<< Updated upstream
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
=======
                      className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 transition text-xs sm:text-sm"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
=======
                      className="flex-1 bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 transition text-xs sm:text-sm"
>>>>>>> Stashed changes
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleAddShowtime(movie)}
                      className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-3 sm:px-4 py-2 rounded hover:bg-[#c4a037] transition text-xs sm:text-sm font-semibold"
                    >
                      + Showtime
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

<<<<<<< Updated upstream
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg max-w-6xl w-full my-8">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-2xl font-bold text-[#d4af37]">
=======
      {/* Add/Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-800 sticky top-0 bg-[#1a1a1a] z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
>>>>>>> Stashed changes
                {editingMovie ? "Edit Movie" : "Add New Movie"}
              </h3>
            </div>

<<<<<<< Updated upstream
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
=======
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-6 py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition disabled:opacity-50 disabled:cursor-not-allowed"
=======
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition text-sm sm:text-base"
>>>>>>> Stashed changes
                >
                  {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoModal(false);
                    resetPhotoForm();
                  }}
<<<<<<< Updated upstream
                  disabled={uploadingPhoto}
                  className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
=======
                  className="flex-1 bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-sm sm:text-base"
>>>>>>> Stashed changes
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< Updated upstream
      <style jsx>{`
        @keyframes slideIn {
=======
      {/* Manage Showtimes Modal */}
      {showShowtimeModal && selectedMovieForShowtime && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-800 sticky top-0 bg-[#1a1a1a] z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#d4af37]">
                Manage Showtimes - {selectedMovieForShowtime.title}
              </h3>
            </div>

            <div className="p-4 sm:p-6">
              {/* Existing Showtimes List */}
              {!showAddShowtimeForm && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-[#f5f5f5]">Existing Showtimes</h4>
                    <button
                      onClick={() => {
                        resetShowtimeForm();
                        setShowAddShowtimeForm(true);
                      }}
                      className="bg-[#d4af37] text-[#0f0f0f] px-4 py-2 rounded-lg font-semibold hover:bg-[#c4a037] transition text-sm"
                    >
                      + Add Showtime
                    </button>
                  </div>

                  {loadingShowtimes ? (
                    <div className="text-center py-8">
                      <p className="text-[#f5f5f5]/60">Loading showtimes...</p>
                    </div>
                  ) : showtimes.length === 0 ? (
                    <div className="text-center py-8 bg-[#0f0f0f] rounded-lg border border-gray-800">
                      <p className="text-[#f5f5f5]/60 mb-4">No showtimes added yet</p>
                      <button
                        onClick={() => {
                          resetShowtimeForm();
                          setShowAddShowtimeForm(true);
                        }}
                        className="bg-[#d4af37] text-[#0f0f0f] px-6 py-2 rounded-lg font-semibold hover:bg-[#c4a037] transition"
                      >
                        Add First Showtime
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {showtimes.map((showtime) => (
                        <div
                          key={showtime.id}
                          className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[#d4af37] font-semibold">
                                {new Date(showtime.showDate).toLocaleDateString()}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  showtime.status === "ACTIVE"
                                    ? "bg-green-900/20 text-green-400"
                                    : showtime.status === "CANCELLED"
                                    ? "bg-red-900/20 text-red-400"
                                    : "bg-gray-700/20 text-gray-400"
                                }`}
                              >
                                {showtime.status}
                              </span>
                            </div>
                            <div className="text-sm text-[#f5f5f5]/60 space-y-1">
                              <p>
                                <strong>Time:</strong> {showtime.startTime} - {showtime.endTime}
                              </p>
                              <p>
                                <strong>Price:</strong> ${showtime.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditShowtime(showtime)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteShowtime(showtime.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add/Edit Showtime Form */}
              {showAddShowtimeForm && (
                <form onSubmit={handleShowtimeSubmit} className="space-y-6">
                  <h4 className="text-lg font-semibold text-[#f5f5f5]">
                    {editingShowtime ? "Edit Showtime" : "Add New Showtime"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Show Date */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                        Show Date *
                      </label>
                      <input
                        type="date"
                        name="showDate"
                        value={showtimeFormData.showDate}
                        onChange={handleShowtimeInputChange}
                        required
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
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
                        value={showtimeFormData.startTime}
                        onChange={handleShowtimeInputChange}
                        required
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={showtimeFormData.endTime}
                        onChange={handleShowtimeInputChange}
                        required
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={showtimeFormData.price}
                        onChange={handleShowtimeInputChange}
                        required
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={showtimeFormData.status}
                        onChange={handleShowtimeInputChange}
                        required
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#d4af37] text-[#0f0f0f] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition text-sm sm:text-base"
                    >
                      {editingShowtime ? "Update Showtime" : "Add Showtime"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddShowtimeForm(false);
                        resetShowtimeForm();
                      }}
                      className="flex-1 bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 transition text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Close Modal Button */}
              {!showAddShowtimeForm && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowShowtimeModal(false);
                      setSelectedMovieForShowtime(null);
                      setShowtimes([]);
                    }}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
>>>>>>> Stashed changes
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
<<<<<<< Updated upstream

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
=======
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
>>>>>>> Stashed changes
        }
      `}</style>
    </main>
  );
}