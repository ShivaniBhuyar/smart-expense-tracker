package com.expensetracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for creating or updating category budgets.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetRequest {

    @NotNull(message = "Budget limit amount is required")
    @Positive(message = "Budget limit amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Budget start date is required")
    private LocalDate startDate;

    @NotNull(message = "Budget end date is required")
    private LocalDate endDate;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
