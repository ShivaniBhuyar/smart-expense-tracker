package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object representing aggregated financial data for a single calendar month.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTrendResponse {

    /** Calendar year (e.g. 2026). */
    private int year;

    /** Calendar month number 1-12. */
    private int month;

    /** Human-readable month label, e.g. "Aug 2026". */
    private String label;

    /** Total income for the month. */
    private BigDecimal totalIncome;

    /** Total expense for the month. */
    private BigDecimal totalExpense;

    /** Net balance (income minus expense) for the month. */
    private BigDecimal netBalance;
}
