package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.DashboardSummaryResponse;
import com.expensetracker.dto.MonthlyTrendResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing user dashboard analytics and summaries.
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Retrieves the aggregate financial summary data for the authenticated user's dashboard.
     *
     * @param currentUser The authenticated user
     * @return DashboardSummaryResponse wrapped in ApiResponse
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", summary));
    }

    /**
     * Retrieves monthly trend analytics for the authenticated user's dashboard.
     *
     * @param currentUser The authenticated user
     * @return List of MonthlyTrendResponse wrapped in ApiResponse
     */
    @GetMapping("/monthly-trends")
    public ResponseEntity<ApiResponse<java.util.List<MonthlyTrendResponse>>> getMonthlyTrends(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        java.util.List<MonthlyTrendResponse> trends = dashboardService.getMonthlyTrends(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Monthly trends retrieved successfully", trends));
    }
}
