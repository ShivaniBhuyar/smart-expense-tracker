package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller for managing user expenses.
 */
@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    /**
     * Retrieves all expenses for the authenticated user, optionally filtered by date range.
     *
     * @param startDate Optional start date for filtering (ISO format)
     * @param endDate Optional end date for filtering (ISO format)
     * @param currentUser The authenticated user
     * @return List of ExpenseResponse wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<ExpenseResponse> expenses = expenseService.getAllExpenses(currentUser.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", expenses));
    }

    /**
     * Retrieves a specific expense by ID.
     *
     * @param id The expense ID
     * @param currentUser The authenticated user
     * @return ExpenseResponse wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ExpenseResponse expense = expenseService.getExpenseById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense retrieved successfully", expense));
    }

    /**
     * Creates a new expense entry.
     *
     * @param request The expense payload
     * @param currentUser The authenticated user
     * @return The created ExpenseResponse wrapped in ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ExpenseResponse expense = expenseService.createExpense(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", expense));
    }

    /**
     * Updates an existing expense entry.
     *
     * @param id The expense ID
     * @param request The updated expense payload
     * @param currentUser The authenticated user
     * @return The updated ExpenseResponse wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ExpenseResponse expense = expenseService.updateExpense(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expense));
    }

    /**
     * Deletes an expense entry.
     *
     * @param id The expense ID
     * @param currentUser The authenticated user
     * @return Empty ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        expenseService.deleteExpense(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully"));
    }
}
