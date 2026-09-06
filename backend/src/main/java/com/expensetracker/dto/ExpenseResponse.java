package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Expense details returned in API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private Long id;

    private String title;

    private BigDecimal amount;

    private LocalDate date;

    private String description;

    private String merchant;

    private String paymentMethod;

    private CategoryResponse category;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
