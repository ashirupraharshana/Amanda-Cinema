package com.amanda.cinema.service;

import com.amanda.cinema.dto.BookingRequest;
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
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.StringJoiner;
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
        Set<String> bookedSeats = new HashSet<>(bookingSeatRepository.findBookedSeats(request.getShowtimeId()));

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
            Integer number = Integer.parseInt(seat.substring(1));

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setSeatRow(row);
            bookingSeat.setSeatNumber(number);

            bookingSeatRepository.save(bookingSeat);
        }

        return savedBooking;
    }
}