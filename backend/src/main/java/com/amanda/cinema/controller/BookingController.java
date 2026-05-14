package com.amanda.cinema.controller;

import com.amanda.cinema.dto.BookingRequest;
import com.amanda.cinema.model.Booking;
import com.amanda.cinema.repository.BookingSeatRepository;
import com.amanda.cinema.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;
    private final BookingSeatRepository bookingSeatRepository;

    public BookingController(BookingService bookingService,
                             BookingSeatRepository bookingSeatRepository) {
        this.bookingService = bookingService;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    // Get already-booked seats for a showtime
    @GetMapping("/booked-seats/{showtimeId}")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Long showtimeId) {
        List<String> bookedSeats = bookingSeatRepository.findBookedSeats(showtimeId);
        return ResponseEntity.ok(bookedSeats);
    }

    // Create a booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.ok(Map.of(
                    "bookingId",   booking.getId(),
                    "bookingCode", booking.getBookingCode(),
                    "totalAmount", booking.getTotalAmount(),
                    "status",      booking.getBookingStatus()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}