package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.DepositRequest;
import com.expensetracker.dto.SavingsGoalRequest;
import com.expensetracker.dto.SavingsGoalResponse;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for managing user savings goals.
 */
@RestController
@RequestMapping("/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    /**
     * Retrieves all savings goals for the authenticated user, optionally filtered by status.
     *
     * @param status Optional filter for goal status (e.g., IN_PROGRESS, COMPLETED)
     * @param currentUser The authenticated user
     * @return List of SavingsGoalResponse wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SavingsGoalResponse>>> getAllSavingsGoals(
            @RequestParam(required = false) GoalStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<SavingsGoalResponse> goals = savingsGoalService.getAllSavingsGoals(currentUser.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Savings goals retrieved successfully", goals));
    }

    /**
     * Retrieves a specific savings goal by ID.
     *
     * @param id The savings goal ID
     * @param currentUser The authenticated user
     * @return SavingsGoalResponse wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> getSavingsGoalById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        SavingsGoalResponse goal = savingsGoalService.getSavingsGoalById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Savings goal retrieved successfully", goal));
    }

    /**
     * Creates a new savings goal.
     *
     * @param request The savings goal payload
     * @param currentUser The authenticated user
     * @return The created SavingsGoalResponse wrapped in ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> createSavingsGoal(
            @Valid @RequestBody SavingsGoalRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        SavingsGoalResponse goal = savingsGoalService.createSavingsGoal(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Savings goal created successfully", goal));
    }

    /**
     * Updates an existing savings goal.
     *
     * @param id The savings goal ID
     * @param request The updated savings goal payload
     * @param currentUser The authenticated user
     * @return The updated SavingsGoalResponse wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> updateSavingsGoal(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        SavingsGoalResponse goal = savingsGoalService.updateSavingsGoal(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Savings goal updated successfully", goal));
    }

    /**
     * Deposits an amount into an existing savings goal.
     *
     * @param id      The savings goal ID
     * @param request The deposit amount
     * @param currentUser The authenticated user
     * @return Updated SavingsGoalResponse wrapped in ApiResponse
     */
    @PostMapping("/{id}/deposit")
    public ResponseEntity<ApiResponse<SavingsGoalResponse>> depositAmount(
            @PathVariable Long id,
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        SavingsGoalResponse goal = savingsGoalService.depositAmount(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Deposit applied successfully", goal));
    }

    /**
     * Deletes a savings goal.
     *
     * @param id The savings goal ID
     * @param currentUser The authenticated user
     * @return Empty ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSavingsGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        savingsGoalService.deleteSavingsGoal(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Savings goal deleted successfully"));
    }
}
