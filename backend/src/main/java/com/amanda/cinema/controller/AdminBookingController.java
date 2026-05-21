package com.amanda.cinema.controller;

import com.amanda.cinema.dto.BookingResponse;
import com.amanda.cinema.model.Booking;
import com.amanda.cinema.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookingResponses();
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request
    ) {
        try {
            String status = request.get("status");

            Booking updatedBooking = bookingService.updateBookingStatus(bookingId, status);

            return ResponseEntity.ok(Map.of(
                    "bookingId", updatedBooking.getId(),
                    "bookingCode", updatedBooking.getBookingCode(),
                    "status", updatedBooking.getBookingStatus()
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
        try {
            bookingService.deleteBooking(bookingId);

            return ResponseEntity.ok(Map.of(
                    "message", "Booking deleted successfully"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}