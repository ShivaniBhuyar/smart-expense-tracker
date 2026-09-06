package com.expensetracker.dto;

import com.expensetracker.entity.GoalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for creating or updating financial savings goals.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsGoalRequest {

    @NotBlank(message = "Goal title is required")
    @Size(max = 100, message = "Goal title cannot exceed 100 characters")
    private String title;

    @NotNull(message = "Target savings amount is required")
    @Positive(message = "Target amount must be greater than zero")
    private BigDecimal targetAmount;

    @PositiveOrZero(message = "Current saved amount cannot be negative")
    private BigDecimal currentAmount;

    @NotNull(message = "Target deadline date is required")
    private LocalDate targetDate;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    private GoalStatus status;
}
