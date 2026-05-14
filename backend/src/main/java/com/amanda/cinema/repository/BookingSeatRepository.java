package com.amanda.cinema.repository;

import com.amanda.cinema.model.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("""
        SELECT CONCAT(bs.seatRow, bs.seatNumber)
        FROM BookingSeat bs
        WHERE bs.booking.showtime.id = :showtimeId
    """)
    List<String> findBookedSeats(@Param("showtimeId") Long showtimeId);
}