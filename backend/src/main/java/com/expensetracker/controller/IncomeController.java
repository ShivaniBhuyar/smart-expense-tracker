package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.IncomeRequest;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.IncomeService;
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
 * REST Controller for managing user incomes.
 */
@RestController
@RequestMapping("/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    /**
     * Retrieves all incomes for the authenticated user, optionally filtered by date range.
     *
     * @param startDate Optional start date for filtering (ISO format)
     * @param endDate Optional end date for filtering (ISO format)
     * @param currentUser The authenticated user
     * @return List of IncomeResponse wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAllIncomes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<IncomeResponse> incomes = incomeService.getAllIncomes(currentUser.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Incomes retrieved successfully", incomes));
    }

    /**
     * Retrieves a specific income by ID.
     *
     * @param id The income ID
     * @param currentUser The authenticated user
     * @return IncomeResponse wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncomeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        IncomeResponse income = incomeService.getIncomeById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Income retrieved successfully", income));
    }

    /**
     * Creates a new income entry.
     *
     * @param request The income payload
     * @param currentUser The authenticated user
     * @return The created IncomeResponse wrapped in ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> createIncome(
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        IncomeResponse income = incomeService.createIncome(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Income created successfully", income));
    }

    /**
     * Updates an existing income entry.
     *
     * @param id The income ID
     * @param request The updated income payload
     * @param currentUser The authenticated user
     * @return The updated IncomeResponse wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        IncomeResponse income = incomeService.updateIncome(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Income updated successfully", income));
    }

    /**
     * Deletes an income entry.
     *
     * @param id The income ID
     * @param currentUser The authenticated user
     * @return Empty ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        incomeService.deleteIncome(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Income deleted successfully"));
    }
}
