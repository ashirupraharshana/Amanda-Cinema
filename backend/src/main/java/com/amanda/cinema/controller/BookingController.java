package com.amanda.cinema.controller;

import com.amanda.cinema.dto.BookingRequest;
import com.amanda.cinema.model.Booking;
import com.amanda.cinema.repository.BookingRepository;
import com.amanda.cinema.repository.BookingSeatRepository;
import com.amanda.cinema.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public BookingController(BookingService bookingService,
                             BookingRepository bookingRepository,
                             BookingSeatRepository bookingSeatRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    //   booked seats for a showtime
    @GetMapping("/booked-seats/{showtimeId}")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Long showtimeId) {
        List<String> bookedSeats = bookingSeatRepository.findBookedSeats(showtimeId);
        return ResponseEntity.ok(bookedSeats);
    }

    //   create booking
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

    //  single booking by id (used by payment page)
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Optional<Booking> opt = bookingRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking b = opt.get();

        return ResponseEntity.ok(Map.of(
                "id",            b.getId(),
                "bookingCode",   b.getBookingCode(),
                "totalAmount",   b.getTotalAmount(),
                "seatNumbers",   b.getSeatNumbers() != null ? b.getSeatNumbers() : "",
                "totalSeats",    b.getTotalSeats() != null ? b.getTotalSeats() : 0,
                "bookingStatus", b.getBookingStatus() != null ? b.getBookingStatus() : "",
                "paymentStatus", b.getPaymentStatus() != null ? b.getPaymentStatus() : "",
                "movie", Map.of(
                        "id",    b.getMovie().getId(),
                        "title", b.getMovie().getTitle()
                ),
                "showtime", Map.of(
                        "id",         b.getShowtime().getId(),
                        "showDate",   b.getShowtime().getShowDate().toString(),
                        "startTime",  b.getShowtime().getStartTime().toString(),
                        "endTime",    b.getShowtime().getEndTime().toString(),
                        "price",      b.getShowtime().getPrice(),
                        "movieTitle", b.getMovie().getTitle()
                )
        ));
    }

    //   simulate payment
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payBooking(@PathVariable Long id,
                                        @RequestBody Map<String, String> paymentDetails) {
        Optional<Booking> opt = bookingRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking b = opt.get();
        b.setPaymentStatus("PAID");
        bookingRepository.save(b);

        return ResponseEntity.ok(Map.of(
                "id",            b.getId(),
                "bookingCode",   b.getBookingCode(),
                "totalAmount",   b.getTotalAmount(),
                "seatNumbers",   b.getSeatNumbers() != null ? b.getSeatNumbers() : "",
                "bookingStatus", b.getBookingStatus(),
                "paymentStatus", b.getPaymentStatus(),
                "showtime", Map.of(
                        "id",         b.getShowtime().getId(),
                        "showDate",   b.getShowtime().getShowDate().toString(),
                        "startTime",  b.getShowtime().getStartTime().toString(),
                        "endTime",    b.getShowtime().getEndTime().toString(),
                        "movieTitle", b.getMovie().getTitle()
                )
        ));
    }

    // bookings for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);

        List<Map<String, Object>> result = bookings.stream()
                .map(b -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id",            b.getId());
                    map.put("bookingCode",   b.getBookingCode());
                    map.put("totalAmount",   b.getTotalAmount());
                    map.put("seatNumbers",   b.getSeatNumbers() != null ? b.getSeatNumbers() : "");
                    map.put("totalSeats",    b.getTotalSeats() != null ? b.getTotalSeats() : 0);
                    map.put("bookingStatus", b.getBookingStatus() != null ? b.getBookingStatus() : "");
                    map.put("paymentStatus", b.getPaymentStatus() != null ? b.getPaymentStatus() : "");
                    map.put("bookingTime",   b.getBookingTime() != null ? b.getBookingTime().toString() : "");
                    map.put("movie", Map.of(
                            "id",    b.getMovie().getId(),
                            "title", b.getMovie().getTitle()
                    ));
                    map.put("showtime", Map.of(
                            "id",        b.getShowtime().getId(),
                            "showDate",  b.getShowtime().getShowDate().toString(),
                            "startTime", b.getShowtime().getStartTime().toString(),
                            "endTime",   b.getShowtime().getEndTime().toString(),
                            "price",     b.getShowtime().getPrice()
                    ));
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}