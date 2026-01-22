package com.amanda.cinema.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MovieDTO {
    private Long id;
    private String title;
    private String description;
    private String genre;
    private Integer durationMinutes;
    private LocalTime startTime;
    private String language;
    private String rating;
    private LocalDate releaseDate;
    private LocalDate showStartDate;
    private LocalDate showEndDate;
    private String director;
    private String cast;
    private String status;
    private String primaryPhotoBase64;

    // Constructors
    public MovieDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public LocalDate getShowStartDate() { return showStartDate; }
    public void setShowStartDate(LocalDate showStartDate) { this.showStartDate = showStartDate; }

    public LocalDate getShowEndDate() { return showEndDate; }
    public void setShowEndDate(LocalDate showEndDate) { this.showEndDate = showEndDate; }

    public String getDirector() { return director; }
    public void setDirector(String director) { this.director = director; }

    public String getCast() { return cast; }
    public void setCast(String cast) { this.cast = cast; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPrimaryPhotoBase64() { return primaryPhotoBase64; }
    public void setPrimaryPhotoBase64(String primaryPhotoBase64) { this.primaryPhotoBase64 = primaryPhotoBase64; }
}