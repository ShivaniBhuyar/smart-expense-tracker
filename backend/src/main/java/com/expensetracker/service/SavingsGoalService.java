package com.expensetracker.service;

import com.expensetracker.dto.DepositRequest;
import com.expensetracker.dto.SavingsGoalRequest;
import com.expensetracker.dto.SavingsGoalResponse;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.SavingsGoal;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.SavingsGoalRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing Savings Goals business logic and progress calculations.
 */
@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new savings goal for the user.
     */
    @Transactional
    public SavingsGoalResponse createSavingsGoal(SavingsGoalRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        BigDecimal currentAmount = request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO;
        GoalStatus status = request.getStatus() != null ? request.getStatus() : GoalStatus.IN_PROGRESS;

        // Auto-complete logic if the initial amount already meets the target
        if (status == GoalStatus.IN_PROGRESS && currentAmount.compareTo(request.getTargetAmount()) >= 0) {
            status = GoalStatus.COMPLETED;
        }

        SavingsGoal goal = SavingsGoal.builder()
                .title(request.getTitle())
                .targetAmount(request.getTargetAmount())
                .currentAmount(currentAmount)
                .targetDate(request.getTargetDate())
                .description(request.getDescription())
                .status(status)
                .user(user)
                .build();

        SavingsGoal savedGoal = savingsGoalRepository.save(goal);
        return mapToResponse(savedGoal);
    }

    /**
     * Retrieves all savings goals for a user, optionally filtered by status.
     */
    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> getAllSavingsGoals(Long userId, GoalStatus status) {
        List<SavingsGoal> goals;
        if (status != null) {
            goals = savingsGoalRepository.findByUserIdAndStatus(userId, status);
        } else {
            goals = savingsGoalRepository.findByUserIdOrderByTargetDateAsc(userId);
        }

        return goals.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a specific savings goal by ID.
     */
    @Transactional(readOnly = true)
    public SavingsGoalResponse getSavingsGoalById(Long id, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", id));
        return mapToResponse(goal);
    }

    /**
     * Updates an existing savings goal.
     */
    @Transactional
    public SavingsGoalResponse updateSavingsGoal(Long id, SavingsGoalRequest request, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", id));

        goal.setTitle(request.getTitle());
        goal.setTargetAmount(request.getTargetAmount());
        
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }

        goal.setTargetDate(request.getTargetDate());
        goal.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        // Auto-complete logic if goal is reached
        if (goal.getStatus() == GoalStatus.IN_PROGRESS && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        return mapToResponse(updatedGoal);
    }

    /**
     * Deposits an amount into an existing savings goal, updating progress and
     * auto-completing the goal when the target is reached.
     *
     * @param id      The savings goal ID
     * @param request DepositRequest containing the amount to add
     * @param userId  The authenticated user's ID
     * @return Updated SavingsGoalResponse
     */
    @Transactional
    public SavingsGoalResponse depositAmount(Long id, DepositRequest request, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", id));

        BigDecimal newAmount = goal.getCurrentAmount().add(request.getAmount());
        goal.setCurrentAmount(newAmount);

        // Auto-complete if target reached
        if (goal.getStatus() == GoalStatus.IN_PROGRESS
                && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        SavingsGoal saved = savingsGoalRepository.save(goal);
        return mapToResponse(saved);
    }

    /**
     * Deletes a savings goal.
     */
    @Transactional
    public void deleteSavingsGoal(Long id, Long userId) {
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SavingsGoal", "id", id));
        savingsGoalRepository.delete(goal);
    }

    /**
     * Maps a SavingsGoal entity to its Response DTO and calculates progress metrics.
     */
    private SavingsGoalResponse mapToResponse(SavingsGoal goal) {
        BigDecimal remainingAmount = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        
        // Prevent negative remaining amounts if over-saved
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        double percentageAchieved = 0.0;
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageAchieved = goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .remainingAmount(remainingAmount)
                .percentageAchieved(percentageAchieved)
                .targetDate(goal.getTargetDate())
                .description(goal.getDescription())
                .status(goal.getStatus())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
