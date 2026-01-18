package com.amanda.cinema.repository;

import com.amanda.cinema.model.MoviePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoviePhotoRepository extends JpaRepository<MoviePhoto, Long> {

    // Find all photos for a movie
    List<MoviePhoto> findByMovieId(Long movieId);

    // Find primary photo for a movie
    @Query("SELECT mp FROM MoviePhoto mp WHERE mp.movie.id = :movieId AND mp.isPrimary = true")
    Optional<MoviePhoto> findPrimaryPhotoByMovieId(@Param("movieId") Long movieId);

    // Delete all photos for a movie
    void deleteByMovieId(Long movieId);
}