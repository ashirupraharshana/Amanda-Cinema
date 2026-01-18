package com.amanda.cinema.controller;

import com.amanda.cinema.model.Movie;
import com.amanda.cinema.model.Showtime;
import com.amanda.cinema.repository.MovieRepository;
import com.amanda.cinema.repository.ShowtimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/showtimes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminShowtimeController {

    private static final Logger logger = LoggerFactory.getLogger(AdminShowtimeController.class);

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;

    public AdminShowtimeController(ShowtimeRepository showtimeRepository,
                                   MovieRepository movieRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
    }

    // Get all showtimes
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllShowtimes(Authentication authentication) {
        try {
            logger.info("Fetching all showtimes");

            List<Showtime> showtimes = showtimeRepository.findAll();
            logger.info("Found {} showtimes", showtimes.size());

            List<Map<String, Object>> showtimeDTOs = showtimes.stream()
                    .map(this::convertToDTO)
                    .toList();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(showtimeDTOs);
        } catch (Exception e) {
            logger.error("Error fetching showtimes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch showtimes: " + e.getMessage()));
        }
    }

    // Get showtime by ID
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getShowtimeById(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("Fetching showtime with id: {}", id);

            Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
            if (showtimeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Showtime not found"));
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(convertToDTO(showtimeOpt.get()));
        } catch (Exception e) {
            logger.error("Error fetching showtime", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch showtime: " + e.getMessage()));
        }
    }

    // Create new showtime
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> createShowtime(@RequestBody Map<String, Object> requestData,
                                            Authentication authentication) {
        try {
            logger.info("Creating new showtime");

            // Validate and get movie
            Long movieId = Long.valueOf(requestData.get("movieId").toString());
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            if (movieOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Movie not found"));
            }

            Showtime showtime = new Showtime();
            showtime.setMovie(movieOpt.get());
            showtime.setShowDate(java.time.LocalDate.parse(requestData.get("showDate").toString()));
            showtime.setStartTime(java.time.LocalTime.parse(requestData.get("startTime").toString()));
            showtime.setEndTime(java.time.LocalTime.parse(requestData.get("endTime").toString()));
            showtime.setPrice(new java.math.BigDecimal(requestData.get("price").toString()));
            showtime.setStatus(requestData.get("status").toString());
            showtime.setCreatedAt(LocalDateTime.now());
            showtime.setUpdatedAt(LocalDateTime.now());

            Showtime savedShowtime = showtimeRepository.save(showtime);
            showtimeRepository.flush();

            logger.info("Showtime created successfully with ID: {}", savedShowtime.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Showtime created successfully",
                            "showtimeId", savedShowtime.getId(),
                            "showtime", convertToDTO(savedShowtime)
                    ));
        } catch (Exception e) {
            logger.error("Error creating showtime", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create showtime: " + e.getMessage()));
        }
    }

    // Update showtime
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> updateShowtime(@PathVariable Long id,
                                            @RequestBody Map<String, Object> requestData,
                                            Authentication authentication) {
        try {
            logger.info("Updating showtime with id: {}", id);

            Optional<Showtime> showtimeOpt = showtimeRepository.findById(id);
            if (showtimeOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Showtime not found"));
            }

            Showtime showtime = showtimeOpt.get();

            // Update movie if provided
            if (requestData.containsKey("movieId")) {
                Long movieId = Long.valueOf(requestData.get("movieId").toString());
                Optional<Movie> movieOpt = movieRepository.findById(movieId);
                if (movieOpt.isPresent()) {
                    showtime.setMovie(movieOpt.get());
                }
            }

            if (requestData.containsKey("showDate")) {
                showtime.setShowDate(java.time.LocalDate.parse(requestData.get("showDate").toString()));
            }
            if (requestData.containsKey("startTime")) {
                showtime.setStartTime(java.time.LocalTime.parse(requestData.get("startTime").toString()));
            }
            if (requestData.containsKey("endTime")) {
                showtime.setEndTime(java.time.LocalTime.parse(requestData.get("endTime").toString()));
            }
            if (requestData.containsKey("price")) {
                showtime.setPrice(new java.math.BigDecimal(requestData.get("price").toString()));
            }
            if (requestData.containsKey("status")) {
                showtime.setStatus(requestData.get("status").toString());
            }

            showtime.setUpdatedAt(LocalDateTime.now());

            Showtime updatedShowtime = showtimeRepository.save(showtime);
            showtimeRepository.flush();

            logger.info("Showtime updated successfully: {}", id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "message", "Showtime updated successfully",
                            "showtime", convertToDTO(updatedShowtime)
                    ));
        } catch (Exception e) {
            logger.error("Error updating showtime", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update showtime: " + e.getMessage()));
        }
    }

    // Delete showtime
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<?> deleteShowtime(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("Deleting showtime with id: {}", id);

            if (!showtimeRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Showtime not found"));
            }

            showtimeRepository.deleteById(id);
            showtimeRepository.flush();

            logger.info("Showtime deleted successfully: {}", id);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("message", "Showtime deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting showtime", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete showtime: " + e.getMessage()));
        }
    }

    // Helper method to convert Showtime to DTO
    private Map<String, Object> convertToDTO(Showtime showtime) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", showtime.getId());
        dto.put("movie", Map.of(
                "id", showtime.getMovie().getId(),
                "title", showtime.getMovie().getTitle()
        ));
        dto.put("showDate", showtime.getShowDate().toString());
        dto.put("startTime", showtime.getStartTime().toString());
        dto.put("endTime", showtime.getEndTime().toString());
        dto.put("price", showtime.getPrice());
        dto.put("status", showtime.getStatus());
        return dto;
    }
}