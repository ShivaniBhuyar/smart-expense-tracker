package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for aggregate financial dashboard analytics and summary metrics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private BigDecimal totalIncome;

    private BigDecimal totalExpense;

    private BigDecimal netBalance;

    private BigDecimal totalSavingsGoalAmount;

    private Map<String, BigDecimal> categoryExpenseBreakdown;

    private List<IncomeResponse> recentIncomes;

    private List<ExpenseResponse> recentExpenses;
}
