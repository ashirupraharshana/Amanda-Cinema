package com.amanda.cinema.controller;

import com.amanda.cinema.model.Showtime;
import com.amanda.cinema.repository.ShowtimeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ShowtimeController {

    private final ShowtimeRepository showtimeRepository;

    public ShowtimeController(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShowtime(@PathVariable Long id) {
        Optional<Showtime> opt = showtimeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Showtime s = opt.get();
        return ResponseEntity.ok(Map.of(
                "id",          s.getId(),
                "showDate",    s.getShowDate().toString(),
                "startTime",   s.getStartTime().toString(),
                "endTime",     s.getEndTime().toString(),
                "price",       s.getPrice(),
                "status",      s.getStatus(),
                "movieTitle",  s.getMovie().getTitle()
        ));
    }
}