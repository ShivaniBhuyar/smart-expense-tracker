package com.expensetracker.dto;

import com.expensetracker.entity.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for SavingsGoal details returned in API responses, including progress metrics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsGoalResponse {

    private Long id;

    private String title;

    private BigDecimal targetAmount;

    private BigDecimal currentAmount;

    private BigDecimal remainingAmount;

    private double percentageAchieved;

    private LocalDate targetDate;

    private String description;

    private GoalStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
