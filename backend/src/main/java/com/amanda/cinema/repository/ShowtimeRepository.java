package com.amanda.cinema.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.amanda.cinema.model.Showtime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieId(Long movieId);

    // Active upcoming showtimes for a movie
    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId " +
            "AND s.status = 'ACTIVE' AND s.showDate >= :today " +
            "ORDER BY s.showDate ASC, s.startTime ASC")
    List<Showtime> findActiveUpcomingByMovieId(
            @Param("movieId") Long movieId,
            @Param("today") LocalDate today
    );
}