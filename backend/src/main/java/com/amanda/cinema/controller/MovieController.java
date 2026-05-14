package com.amanda.cinema.controller;

import com.amanda.cinema.dto.MovieDTO;
import com.amanda.cinema.model.Movie;
import com.amanda.cinema.model.MoviePhoto;
import com.amanda.cinema.repository.MoviePhotoRepository;
import com.amanda.cinema.repository.MovieRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.amanda.cinema.model.Showtime;
import com.amanda.cinema.repository.ShowtimeRepository;
import java.util.Comparator;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.*;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/movies")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class MovieController {

    private final MovieRepository movieRepository;
    private final MoviePhotoRepository moviePhotoRepository;
    private final ShowtimeRepository showtimeRepository;

    public MovieController(MovieRepository movieRepository,
                           MoviePhotoRepository moviePhotoRepository,
                           ShowtimeRepository showtimeRepository) {

        this.movieRepository = movieRepository;
        this.moviePhotoRepository = moviePhotoRepository;
        this.showtimeRepository = showtimeRepository;
    }

    // Get all active movies for customers
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<MovieDTO>> getAllMovies() {

        List<Movie> movies = movieRepository.findAll();

        List<MovieDTO> movieDTOs = movies.stream()
                .filter(movie ->
                        movie.getStatus() != null &&
                                movie.getStatus().equalsIgnoreCase("ACTIVE")
                )
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(movieDTOs);
    }

    // Get single movie
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {

        Optional<Movie> movieOpt = movieRepository.findById(id);

        if (movieOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(convertToDTO(movieOpt.get()));
    }

    @GetMapping(value = "/{id}/photos", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMoviePhotos(@PathVariable Long id) {
        Optional<Movie> movieOpt = movieRepository.findById(id);

        if (movieOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<MoviePhoto> photos = moviePhotoRepository.findByMovieId(id);

        List<Map<String, Object>> result = photos.stream()
                .map(photo -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", photo.getId());
                    map.put("isPrimary", photo.getIsPrimary());
                    map.put("photoData",
                            Base64.getEncoder().encodeToString(photo.getPhotoData()));
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/{id}/showtimes", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMovieShowtimes(@PathVariable Long id) {

        Optional<Movie> movieOpt = movieRepository.findById(id);

        if (movieOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Showtime> showtimes = showtimeRepository.findByMovieId(id);

        List<Map<String, Object>> result = showtimes.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                // removed the date filter — show all active showtimes
                .sorted(Comparator.comparing(Showtime::getShowDate)
                        .thenComparing(Showtime::getStartTime))
                .map(showtime -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", showtime.getId());
                    map.put("showDate", showtime.getShowDate().toString());
                    map.put("startTime", showtime.getStartTime().toString());
                    map.put("endTime", showtime.getEndTime().toString());
                    map.put("price", showtime.getPrice());
                    map.put("status", showtime.getStatus());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Convert entity to DTO
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

        // Get primary photo
        try {

            Optional<MoviePhoto> primaryPhoto =
                    moviePhotoRepository.findPrimaryPhotoByMovieId(movie.getId());

            if (primaryPhoto.isPresent()) {

                String base64Image = Base64.getEncoder()
                        .encodeToString(primaryPhoto.get().getPhotoData());

                dto.setPrimaryPhotoBase64(base64Image);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return dto;
    }
}