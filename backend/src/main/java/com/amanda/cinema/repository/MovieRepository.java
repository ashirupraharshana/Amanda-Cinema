package com.amanda.cinema.repository;

import com.amanda.cinema.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Find by status
    List<Movie> findByStatus(String status);

    // Find by genre
    List<Movie> findByGenre(String genre);

    // Search by title
    List<Movie> findByTitleContainingIgnoreCase(String title);

    // Find currently showing movies
    @Query("SELECT m FROM Movie m WHERE m.status = 'ACTIVE' AND m.showStartDate <= :currentDate AND m.showEndDate >= :currentDate")
    List<Movie> findCurrentlyShowing(@Param("currentDate") LocalDate currentDate);

    // Find coming soon movies
    @Query("SELECT m FROM Movie m WHERE m.status = 'COMING_SOON' AND m.showStartDate > :currentDate")
    List<Movie> findComingSoon(@Param("currentDate") LocalDate currentDate);

    // Search movies by multiple criteria
    @Query("SELECT m FROM Movie m WHERE " +
            "(:title IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:genre IS NULL OR m.genre = :genre) AND " +
            "(:status IS NULL OR m.status = :status)")
    List<Movie> searchMovies(@Param("title") String title,
                             @Param("genre") String genre,
                             @Param("status") String status);
}