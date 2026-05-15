package com.amanda.cinema.repository;

import com.amanda.cinema.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByShowtimeId(Long showtimeId);
    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);
}