package com.amanda.cinema.service;

import com.amanda.cinema.dto.BookingRequest;
import com.amanda.cinema.dto.BookingResponse;
import com.amanda.cinema.model.Booking;
import com.amanda.cinema.model.BookingSeat;
import com.amanda.cinema.model.Movie;
import com.amanda.cinema.model.Showtime;
import com.amanda.cinema.model.User;
import com.amanda.cinema.repository.BookingRepository;
import com.amanda.cinema.repository.BookingSeatRepository;
import com.amanda.cinema.repository.ShowtimeRepository;
import com.amanda.cinema.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;

    public BookingService(BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          UserRepository userRepository,
                          ShowtimeRepository showtimeRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.userRepository = userRepository;
        this.showtimeRepository = showtimeRepository;
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        if (request.getSeats() == null || request.getSeats().isEmpty()) {
            throw new RuntimeException("Please select at least one seat");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        Movie movie = showtime.getMovie();

        if (movie == null) {
            throw new RuntimeException("Movie not found for this showtime");
        }

        Set<String> requestedSeats = new HashSet<>(request.getSeats());
        Set<String> bookedSeats = new HashSet<>(
                bookingSeatRepository.findBookedSeats(request.getShowtimeId())
        );

        requestedSeats.retainAll(bookedSeats);

        if (!requestedSeats.isEmpty()) {
            throw new RuntimeException("Some seats are already booked: " + requestedSeats);
        }

        Booking booking = new Booking();
        booking.setBookingCode(UUID.randomUUID().toString());
        booking.setUser(user);
        booking.setMovie(movie);
        booking.setShowtime(showtime);
        booking.setBookingStatus("CONFIRMED");
        booking.setPaymentStatus("PENDING");
        booking.setBookingTime(LocalDateTime.now());
        booking.setTotalSeats(request.getSeats().size());

        StringJoiner joiner = new StringJoiner(",");

        for (String seat : request.getSeats()) {
            joiner.add(seat);
        }

        booking.setSeatNumbers(joiner.toString());

        BigDecimal totalAmount = showtime.getPrice()
                .multiply(BigDecimal.valueOf(request.getSeats().size()));

        booking.setTotalAmount(totalAmount);

        Booking savedBooking = bookingRepository.save(booking);

        for (String seat : request.getSeats()) {
            if (seat == null || seat.length() < 2) {
                throw new RuntimeException("Invalid seat format: " + seat);
            }

            String row = seat.substring(0, 1).toUpperCase();

            Integer number;

            try {
                number = Integer.parseInt(seat.substring(1));
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid seat format: " + seat);
            }

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setSeatRow(row);
            bookingSeat.setSeatNumber(number);

            bookingSeatRepository.save(bookingSeat);
        }

        return savedBooking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<BookingResponse> getAllBookingResponses() {
        return bookingRepository.findAll()
                .stream()
                .map(booking -> new BookingResponse(
                        booking.getId(),
                        booking.getBookingCode(),
                        booking.getBookingStatus(),
                        booking.getPaymentStatus(),
                        booking.getTotalAmount(),
                        booking.getTotalSeats(),
                        booking.getSeatNumbers(),
                        booking.getBookingTime(),

                        booking.getMovie() != null && booking.getMovie().getTitle() != null
                                ? booking.getMovie().getTitle()
                                : "Movie",

                        booking.getUser() != null && booking.getUser().getName() != null
                                ? booking.getUser().getName()
                                : "Customer",

                        booking.getUser() != null && booking.getUser().getEmail() != null
                                ? booking.getUser().getEmail()
                                : "",

                        booking.getShowtime() != null && booking.getShowtime().getShowDate() != null
                                ? booking.getShowtime().getShowDate().toString()
                                : "",

                        booking.getShowtime() != null && booking.getShowtime().getStartTime() != null
                                ? booking.getShowtime().getStartTime().toString()
                                : ""
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Booking status is required");
        }

        String cleanStatus = status.trim().toUpperCase();

        if (!cleanStatus.equals("CONFIRMED")
                && !cleanStatus.equals("PENDING")
                && !cleanStatus.equals("CANCELLED")) {
            throw new RuntimeException("Invalid booking status: " + status);
        }

        booking.setBookingStatus(cleanStatus);

        return bookingRepository.save(booking);
    }

    @Transactional
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        bookingRepository.delete(booking);
    }
}