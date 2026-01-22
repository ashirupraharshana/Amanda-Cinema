package com.amanda.cinema.repository;

import com.amanda.cinema.model.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    // Find showtimes by movie
    List<Showtime> findByMovieId(Long movieId);

    // Find showtimes by date
    List<Showtime> findByShowDate(LocalDate showDate);

    // Find showtimes by movie and date
    List<Showtime> findByMovieIdAndShowDate(Long movieId, LocalDate showDate);

    // Find showtimes by status
    List<Showtime> findByStatus(String status);

    // Find upcoming showtimes
    @Query("SELECT s FROM Showtime s WHERE s.showDate >= :currentDate AND s.status = 'ACTIVE' ORDER BY s.showDate, s.startTime")
    List<Showtime> findUpcomingShowtimes(@Param("currentDate") LocalDate currentDate);

    // Find showtimes by date range
    @Query("SELECT s FROM Showtime s WHERE s.showDate BETWEEN :startDate AND :endDate ORDER BY s.showDate, s.startTime")
    List<Showtime> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}