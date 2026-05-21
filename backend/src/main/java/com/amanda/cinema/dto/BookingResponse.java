package com.amanda.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;
    private String bookingCode;
    private String bookingStatus;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private Integer totalSeats;
    private String seatNumbers;
    private LocalDateTime bookingTime;

    private String movieTitle;
    private String customerName;
    private String customerEmail;
    private String showDate;
    private String startTime;

    public BookingResponse() {
    }

    public BookingResponse(Long id,
                           String bookingCode,
                           String bookingStatus,
                           String paymentStatus,
                           BigDecimal totalAmount,
                           Integer totalSeats,
                           String seatNumbers,
                           LocalDateTime bookingTime,
                           String movieTitle,
                           String customerName,
                           String customerEmail,
                           String showDate,
                           String startTime) {
        this.id = id;
        this.bookingCode = bookingCode;
        this.bookingStatus = bookingStatus;
        this.paymentStatus = paymentStatus;
        this.totalAmount = totalAmount;
        this.totalSeats = totalSeats;
        this.seatNumbers = seatNumbers;
        this.bookingTime = bookingTime;
        this.movieTitle = movieTitle;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.showDate = showDate;
        this.startTime = startTime;
    }

    public Long getId() {
        return id;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getShowDate() {
        return showDate;
    }

    public String getStartTime() {
        return startTime;
    }
}