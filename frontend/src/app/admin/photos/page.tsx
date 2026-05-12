"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbar";

interface Movie {
  id: number;
  title: string;
  primaryPhotoBase64?: string;
}

interface Photo {
  id: number;
  isPrimary: boolean;
  photoData: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ManagePhotos() {
  const { isLoading, userRole } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPrimary, setUploadPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") {
      fetchMovies();
    }
  }, [isLoading, userRole]);

  // Fetch photos for selected movie
  const fetchPhotos = async (movieId: number) => {
    setLoadingPhotos(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${movieId}/photos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to fetch photos", "error");
      }
    } catch (err) {
      console.error("Failed to fetch photos:", err);
      showToast("Unable to connect to server", "error");
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Handle movie selection
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setPhotos([]);
    setUploadFile(null);
    setUploadPrimary(false);
    fetchPhotos(movie.id);
  };

  // Handle file selection with size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        showToast("Please upload photos less than 5 MB", "error");
        // Reset file input
        e.target.value = "";
        setUploadFile(null);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showToast("Please upload only image files", "error");
        e.target.value = "";
        setUploadFile(null);
        return;
      }

      setUploadFile(file);
    }
  };

  // Handle photo upload
  const handleUpload = async () => {
    if (!uploadFile || !selectedMovie) {
      showToast("Please select a file to upload", "error");
      return;
    }

    // Double-check file size before upload
    if (uploadFile.size > MAX_FILE_SIZE) {
      showToast("Please upload photos less than 5 MB", "error");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("isPrimary", uploadPrimary.toString());

      console.log("Uploading photo for movie ID:", selectedMovie.id);
      console.log("isPrimary:", uploadPrimary);
      console.log("File:", uploadFile.name, uploadFile.size, uploadFile.type);

      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${selectedMovie.id}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type header - let the browser set it with boundary for multipart
          },
          body: formData,
        }
      );

      console.log("Upload response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || "Photo uploaded successfully", "success");
        setUploadFile(null);
        setUploadPrimary(false);
        fetchPhotos(selectedMovie.id);
        fetchMovies(); // Refresh movies to update primary photo
        // Reset file input
        const fileInput = document.getElementById("photo-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to upload photo", "error");
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      showToast("Failed to upload photo. Please check if the server is running.", "error");
    } finally {
      setUploading(false);
    }
  };

  // Handle photo deletion
  const handleDelete = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    if (!selectedMovie) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("No authentication token found", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/movies/${selectedMovie.id}/photos/${photoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showToast("Photo deleted successfully", "success");
        fetchPhotos(selectedMovie.id);
        fetchMovies(); // Refresh movies to update primary photo
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete photo", "error");
      }
    } catch (err) {
      console.error("Error deleting photo:", err);
      showToast("Failed to delete photo", "error");
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#d4af37]">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      <AdminNavbar />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-100'
                : toast.type === 'error'
                ? 'bg-red-900/90 border-red-700 text-red-100'
                : 'bg-blue-900/90 border-blue-700 text-blue-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <p className="flex-1 text-sm">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-2">Manage Movie Photos</h2>
          <p className="text-sm sm:text-base text-[#f5f5f5]/60">Upload and manage photos for your movies (Max 5 MB per photo)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Movies List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] mb-4">Select Movie</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {movies.length === 0 ? (
                  <p className="text-[#f5f5f5]/60 text-sm text-center py-4">No movies available</p>
                ) : (
                  movies.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => handleMovieSelect(movie)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg transition ${
                        selectedMovie?.id === movie.id
                          ? "bg-[#d4af37] text-[#0f0f0f]"
                          : "bg-[#0f0f0f] border border-gray-800 hover:border-[#d4af37] text-[#f5f5f5]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {movie.primaryPhotoBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${movie.primaryPhotoBase64}`}
                            alt={movie.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs">
                            No Photo
                          </div>
                        )}
                        <span className="font-semibold text-sm sm:text-base line-clamp-2">{movie.title}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Photo Management Area */}
          <div className="lg:col-span-2">
            {!selectedMovie ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 sm:p-12 text-center">
                <p className="text-[#f5f5f5]/60 text-base sm:text-lg">
                  Select a movie to manage its photos
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Upload Section */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] mb-4">
                    Upload Photo for {selectedMovie.title}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#f5f5f5] mb-2">
                        Select Photo (Max 5 MB)
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-lg px-3 sm:px-4 py-2 text-[#f5f5f5] focus:outline-none focus:border-[#d4af37] text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#d4af37] file:text-[#0f0f0f] hover:file:bg-[#c4a037] file:cursor-pointer"
                      />
                      {uploadFile && (
                        <p className="mt-2 text-xs sm:text-sm text-[#f5f5f5]/60">
                          Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={uploadPrimary}
                        onChange={(e) => setUploadPrimary(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-800 bg-[#0f0f0f] text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0"
                      />
                      <label htmlFor="isPrimary" className="text-xs sm:text-sm text-[#f5f5f5]">
                        Set as primary photo (will be displayed on movie cards)
                      </label>
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={!uploadFile || uploading}
                      className="w-full bg-[#d4af37] text-[#0f0f0f] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#c4a037] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </button>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[#d4af37] mb-4">
                    Existing Photos ({photos.length})
                  </h3>
                  {loadingPhotos ? (
                    <div className="text-center py-8">
                      <p className="text-[#f5f5f5]/60 text-sm sm:text-base">Loading photos...</p>
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#f5f5f5]/60 text-sm sm:text-base">No photos uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden"
                        >
                          {photo.isPrimary && (
                            <div className="absolute top-2 left-2 bg-[#d4af37] text-[#0f0f0f] px-2 py-1 rounded text-xs font-semibold z-10">
                              Primary
                            </div>
                          )}
                          <img
                            src={`data:image/jpeg;base64,${photo.photoData}`}
                            alt="Movie photo"
                            className="w-full h-40 sm:h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              onClick={() => handleDelete(photo.id)}
                              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 transition text-xs sm:text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}