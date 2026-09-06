package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.BudgetService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller for managing user budgets.
 */
@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Retrieves all budgets for the authenticated user.
     *
     * @param currentUser The authenticated user
     * @return List of BudgetResponse wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getAllBudgets(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<BudgetResponse> budgets = budgetService.getAllBudgets(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Budgets retrieved successfully", budgets));
    }

    /**
     * Retrieves a specific budget by ID.
     *
     * @param id The budget ID
     * @param currentUser The authenticated user
     * @return BudgetResponse wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BudgetResponse budget = budgetService.getBudgetById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget retrieved successfully", budget));
    }

    /**
     * Creates a new budget entry.
     *
     * @param request The budget payload
     * @param currentUser The authenticated user
     * @return The created BudgetResponse wrapped in ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BudgetResponse budget = budgetService.createBudget(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", budget));
    }

    /**
     * Updates an existing budget entry.
     *
     * @param id The budget ID
     * @param request The updated budget payload
     * @param currentUser The authenticated user
     * @return The updated BudgetResponse wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        BudgetResponse budget = budgetService.updateBudget(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", budget));
    }

    /**
     * Deletes a budget entry.
     *
     * @param id The budget ID
     * @param currentUser The authenticated user
     * @return Empty ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        budgetService.deleteBudget(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully"));
    }
}
