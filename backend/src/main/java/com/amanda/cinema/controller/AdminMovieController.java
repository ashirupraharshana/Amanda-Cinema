package com.amanda.cinema.controller;

import com.amanda.cinema.dto.MovieDTO;
import com.amanda.cinema.model.Movie;
import com.amanda.cinema.model.MoviePhoto;
import com.amanda.cinema.repository.MoviePhotoRepository;
import com.amanda.cinema.repository.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/movies")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminMovieController {

    private static final Logger logger = LoggerFactory.getLogger(AdminMovieController.class);

    private final MovieRepository movieRepository;
    private final MoviePhotoRepository moviePhotoRepository;

    public AdminMovieController(MovieRepository movieRepository,
                                MoviePhotoRepository moviePhotoRepository) {
        this.movieRepository = movieRepository;
        this.moviePhotoRepository = moviePhotoRepository;
    }

    // Get all movies
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllMovies(Authentication authentication) {
        try {
            logger.info("Fetching all movies. Auth: {}", authentication != null ? authentication.getName() : "null");

            if (!isAdmin(authentication)) {
                logger.warn("Unauthorized access attempt - not admin");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            List<Movie> movies = movieRepository.findAll();
            logger.info("Found {} movies in database", movies.size());

            List<MovieDTO> movieDTOs = movies.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movieDTOs);
        } catch (Exception e) {
            logger.error("Error fetching movies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch movies: " + e.getMessage()));
        }
    }

    // Get movie by ID
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMovieById(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("Fetching movie with id: {}", id);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            Optional<Movie> movieOpt = movieRepository.findById(id);
            if (movieOpt.isEmpty()) {
                logger.warn("Movie not found with id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Movie not found"));
            }

            MovieDTO movieDTO = convertToDTO(movieOpt.get());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movieDTO);
        } catch (Exception e) {
            logger.error("Error fetching movie with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch movie: " + e.getMessage()));
        }
    }

    // Create new movie
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> createMovie(@RequestBody Movie movie, Authentication authentication) {
        try {
            logger.info("Creating new movie: {}", movie.getTitle());
            logger.info("Authentication: {}", authentication != null ? authentication.getName() : "null");

            if (!isAdmin(authentication)) {
                logger.warn("Unauthorized create attempt");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            // Validate required fields
            if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Title is required"));
            }

            if (movie.getDurationMinutes() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Duration is required"));
            }

            if (movie.getStartTime() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Start time is required"));
            }

            // Set timestamps
            movie.setCreatedAt(LocalDateTime.now());
            movie.setUpdatedAt(LocalDateTime.now());

            // Set default status if not provided
            if (movie.getStatus() == null || movie.getStatus().trim().isEmpty()) {
                movie.setStatus("ACTIVE");
            }

            // Save movie
            Movie savedMovie = movieRepository.save(movie);
            movieRepository.flush(); // Force immediate persistence

            logger.info("Movie created successfully with ID: {}", savedMovie.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Movie created successfully",
                            "movieId", savedMovie.getId(),
                            "movie", convertToDTO(savedMovie)
                    ));
        } catch (Exception e) {
            logger.error("Error creating movie", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create movie: " + e.getMessage()));
        }
    }

    // Update movie
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> updateMovie(@PathVariable Long id,
                                         @RequestBody Movie movieDetails,
                                         Authentication authentication) {
        try {
            logger.info("Updating movie with id: {}", id);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            Optional<Movie> movieOpt = movieRepository.findById(id);
            if (movieOpt.isEmpty()) {
                logger.warn("Movie not found with id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Movie not found"));
            }

            Movie movie = movieOpt.get();

            // Update fields
            if (movieDetails.getTitle() != null) {
                movie.setTitle(movieDetails.getTitle());
            }
            if (movieDetails.getDescription() != null) {
                movie.setDescription(movieDetails.getDescription());
            }
            if (movieDetails.getGenre() != null) {
                movie.setGenre(movieDetails.getGenre());
            }
            if (movieDetails.getDurationMinutes() != null) {
                movie.setDurationMinutes(movieDetails.getDurationMinutes());
            }
            if (movieDetails.getStartTime() != null) {
                movie.setStartTime(movieDetails.getStartTime());
            }
            if (movieDetails.getLanguage() != null) {
                movie.setLanguage(movieDetails.getLanguage());
            }
            if (movieDetails.getRating() != null) {
                movie.setRating(movieDetails.getRating());
            }
            if (movieDetails.getReleaseDate() != null) {
                movie.setReleaseDate(movieDetails.getReleaseDate());
            }
            if (movieDetails.getShowStartDate() != null) {
                movie.setShowStartDate(movieDetails.getShowStartDate());
            }
            if (movieDetails.getShowEndDate() != null) {
                movie.setShowEndDate(movieDetails.getShowEndDate());
            }
            if (movieDetails.getDirector() != null) {
                movie.setDirector(movieDetails.getDirector());
            }
            if (movieDetails.getCast() != null) {
                movie.setCast(movieDetails.getCast());
            }
            if (movieDetails.getStatus() != null) {
                movie.setStatus(movieDetails.getStatus());
            }

            movie.setUpdatedAt(LocalDateTime.now());

            Movie updatedMovie = movieRepository.save(movie);
            movieRepository.flush();

            logger.info("Movie updated successfully: {}", id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Movie updated successfully",
                            "movie", convertToDTO(updatedMovie)
                    ));
        } catch (Exception e) {
            logger.error("Error updating movie with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update movie: " + e.getMessage()));
        }
    }

    // Delete movie
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> deleteMovie(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("Deleting movie with id: {}", id);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            if (!movieRepository.existsById(id)) {
                logger.warn("Movie not found with id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Movie not found"));
            }

            movieRepository.deleteById(id);
            movieRepository.flush();

            logger.info("Movie deleted successfully: {}", id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Movie deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting movie with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete movie: " + e.getMessage()));
        }
    }

    // Search movies
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> searchMovies(@RequestParam(required = false) String title,
                                          @RequestParam(required = false) String genre,
                                          @RequestParam(required = false) String status,
                                          Authentication authentication) {
        try {
            logger.info("Searching movies - title: {}, genre: {}, status: {}", title, genre, status);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            List<Movie> movies = movieRepository.searchMovies(title, genre, status);
            logger.info("Found {} movies matching search criteria", movies.size());

            List<MovieDTO> movieDTOs = movies.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(movieDTOs);
        } catch (Exception e) {
            logger.error("Error searching movies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Search failed: " + e.getMessage()));
        }
    }

    // Upload movie photo
    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id,
                                         @RequestParam("file") MultipartFile file,
                                         @RequestParam(defaultValue = "false") Boolean isPrimary,
                                         Authentication authentication) {
        try {
            logger.info("Uploading photo for movie id: {}", id);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            Optional<Movie> movieOpt = movieRepository.findById(id);
            if (movieOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Movie not found"));
            }

            Movie movie = movieOpt.get();

            // If this is set as primary, unset other primary photos
            if (isPrimary) {
                List<MoviePhoto> existingPhotos = moviePhotoRepository.findByMovieId(id);
                existingPhotos.forEach(photo -> photo.setIsPrimary(false));
                moviePhotoRepository.saveAll(existingPhotos);
            }

            MoviePhoto photo = new MoviePhoto();
            photo.setMovie(movie);
            photo.setPhotoData(file.getBytes());
            photo.setIsPrimary(isPrimary);

            MoviePhoto savedPhoto = moviePhotoRepository.save(photo);
            moviePhotoRepository.flush();

            logger.info("Photo uploaded successfully with id: {}", savedPhoto.getId());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Photo uploaded successfully",
                            "photoId", savedPhoto.getId()
                    ));
        } catch (Exception e) {
            logger.error("Error uploading photo for movie id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload photo: " + e.getMessage()));
        }
    }

    // Get movie photo
    @GetMapping(value = "/{movieId}/photos/{photoId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPhoto(@PathVariable Long movieId,
                                      @PathVariable Long photoId) {
        try {
            logger.info("Fetching photo id: {} for movie id: {}", photoId, movieId);

            Optional<MoviePhoto> photoOpt = moviePhotoRepository.findById(photoId);
            if (photoOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Photo not found"));
            }

            MoviePhoto photo = photoOpt.get();
            String base64Image = Base64.getEncoder().encodeToString(photo.getPhotoData());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "id", photo.getId(),
                            "isPrimary", photo.getIsPrimary(),
                            "photoData", base64Image
                    ));
        } catch (Exception e) {
            logger.error("Error fetching photo id: {}", photoId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch photo: " + e.getMessage()));
        }
    }

    // Get all photos for a movie
    @GetMapping(value = "/{movieId}/photos", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllPhotos(@PathVariable Long movieId, Authentication authentication) {
        try {
            logger.info("Fetching all photos for movie id: {}", movieId);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            List<MoviePhoto> photos = moviePhotoRepository.findByMovieId(movieId);

            List<Map<String, Object>> photoData = photos.stream()
                    .map(photo -> Map.of(
                            "id", (Object) photo.getId(),
                            "isPrimary", photo.getIsPrimary(),
                            "photoData", Base64.getEncoder().encodeToString(photo.getPhotoData())
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(photoData);
        } catch (Exception e) {
            logger.error("Error fetching photos for movie id: {}", movieId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch photos: " + e.getMessage()));
        }
    }

    // Delete movie photo
    @DeleteMapping(value = "/{movieId}/photos/{photoId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> deletePhoto(@PathVariable Long movieId,
                                         @PathVariable Long photoId,
                                         Authentication authentication) {
        try {
            logger.info("Deleting photo id: {} for movie id: {}", photoId, movieId);

            if (!isAdmin(authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            if (!moviePhotoRepository.existsById(photoId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Photo not found"));
            }

            moviePhotoRepository.deleteById(photoId);
            moviePhotoRepository.flush();

            logger.info("Photo deleted successfully: {}", photoId);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Photo deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting photo id: {}", photoId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete photo: " + e.getMessage()));
        }
    }

    // Helper method to convert Movie to DTO
    private MovieDTO convertToDTO(Movie movie) {
        MovieDTO dto = new MovieDTO();
        dto.setId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setDescription(movie.getDescription());
        dto.setGenre(movie.getGenre());
        dto.setDurationMinutes(movie.getDurationMinutes());
        dto.setStartTime(movie.getStartTime());
        dto.setLanguage(movie.getLanguage());
        dto.setRating(movie.getRating());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setShowStartDate(movie.getShowStartDate());
        dto.setShowEndDate(movie.getShowEndDate());
        dto.setDirector(movie.getDirector());
        dto.setCast(movie.getCast());
        dto.setStatus(movie.getStatus());

        // Get primary photo if exists
        try {
            Optional<MoviePhoto> primaryPhoto = moviePhotoRepository.findPrimaryPhotoByMovieId(movie.getId());
            if (primaryPhoto.isPresent()) {
                String base64Image = Base64.getEncoder().encodeToString(primaryPhoto.get().getPhotoData());
                dto.setPrimaryPhotoBase64(base64Image);
            }
        } catch (Exception e) {
            logger.warn("Error loading primary photo for movie id: {}", movie.getId());
        }

        return dto;
    }

    // Helper method to check if user is admin
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Authentication is null or not authenticated");
            return false;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        logger.info("User {} is admin: {}", authentication.getName(), isAdmin);
        return isAdmin;
    }
}