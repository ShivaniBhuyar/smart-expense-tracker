package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Budget details returned in API responses, including spending progress calculation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;

    private BigDecimal amount;

    private BigDecimal spentAmount;

    private BigDecimal remainingAmount;

    private double percentageUsed;

    private boolean isExceeded;

    private LocalDate startDate;

    private LocalDate endDate;

    private CategoryResponse category;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
