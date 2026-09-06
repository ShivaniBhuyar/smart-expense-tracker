package com.expensetracker.service;

import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.DashboardSummaryResponse;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.dto.MonthlyTrendResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.SavingsGoal;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import com.expensetracker.repository.SavingsGoalRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service aggregating user financial data into dashboard metrics.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    /**
     * Retrieves aggregated financial summary data for the user dashboard.
     * 
     * @param userId The ID of the authenticated user
     * @return DashboardSummaryResponse containing metrics and recent transactions
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        // Validate user existence
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Fetch total income and expense
        BigDecimal totalIncome = incomeRepository.sumTotalIncomeByUserId(userId);
        if (totalIncome == null) {
            totalIncome = BigDecimal.ZERO;
        }

        BigDecimal totalExpense = expenseRepository.sumTotalExpenseByUserId(userId);
        if (totalExpense == null) {
            totalExpense = BigDecimal.ZERO;
        }

        // 2. Calculate net balance
        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        // 3. Fetch savings goals and sum the current saved amounts
        List<SavingsGoal> savingsGoals = savingsGoalRepository.findByUserIdOrderByTargetDateAsc(userId);
        BigDecimal totalSavings = savingsGoals.stream()
                .map(SavingsGoal::getCurrentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Fetch expenses for recent list and category breakdown
        List<Expense> allExpenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        
        List<ExpenseResponse> recentExpenses = allExpenses.stream()
                .limit(5)
                .map(this::mapToExpenseResponse)
                .collect(Collectors.toList());

        Map<String, BigDecimal> categoryExpenseBreakdown = allExpenses.stream()
                .collect(Collectors.toMap(
                        expense -> expense.getCategory().getName(),
                        Expense::getAmount,
                        BigDecimal::add
                ));

        // 5. Fetch incomes for recent list
        List<Income> allIncomes = incomeRepository.findByUserIdOrderByDateDesc(userId);
        
        List<IncomeResponse> recentIncomes = allIncomes.stream()
                .limit(5)
                .map(this::mapToIncomeResponse)
                .collect(Collectors.toList());

        // 6. Build and return dashboard response
        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .totalSavingsGoalAmount(totalSavings)
                .categoryExpenseBreakdown(categoryExpenseBreakdown)
                .recentIncomes(recentIncomes)
                .recentExpenses(recentExpenses)
                .build();
    }

    /**
     * Retrieves monthly trend aggregated data for the last 6 months for the user.
     *
     * @param userId The ID of the authenticated user
     * @return List of MonthlyTrendResponse
     */
    @Transactional(readOnly = true)
    public List<MonthlyTrendResponse> getMonthlyTrends(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        java.time.LocalDate now = java.time.LocalDate.now();
        List<MonthlyTrendResponse> trends = new java.util.ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            java.time.LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            BigDecimal inc = incomeRepository.sumIncomeByUserIdAndDateBetween(userId, monthStart, monthEnd);
            if (inc == null) inc = BigDecimal.ZERO;

            BigDecimal exp = expenseRepository.sumExpenseByUserIdAndDateBetween(userId, monthStart, monthEnd);
            if (exp == null) exp = BigDecimal.ZERO;

            String label = monthStart.getMonth().name().substring(0, 3) + " " + monthStart.getYear();

            trends.add(MonthlyTrendResponse.builder()
                    .year(monthStart.getYear())
                    .month(monthStart.getMonthValue())
                    .label(label)
                    .totalIncome(inc)
                    .totalExpense(exp)
                    .netBalance(inc.subtract(exp))
                    .build());
        }

        return trends;
    }

    /**
     * Maps an Expense entity to its corresponding Response DTO.
     */
    private ExpenseResponse mapToExpenseResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .description(expense.getDescription())
                .merchant(expense.getMerchant())
                .paymentMethod(expense.getPaymentMethod())
                .category(mapCategoryToResponse(expense.getCategory()))
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }

    /**
     * Maps an Income entity to its corresponding Response DTO.
     */
    private IncomeResponse mapToIncomeResponse(Income income) {
        return IncomeResponse.builder()
                .id(income.getId())
                .title(income.getTitle())
                .amount(income.getAmount())
                .date(income.getDate())
                .description(income.getDescription())
                .source(income.getSource())
                .category(mapCategoryToResponse(income.getCategory()))
                .createdAt(income.getCreatedAt())
                .updatedAt(income.getUpdatedAt())
                .build();
    }

    /**
     * Maps a Category entity to its Response DTO without leaking raw entities.
     */
    private CategoryResponse mapCategoryToResponse(Category category) {
        if (category == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .description(category.getDescription())
                .colorCode(category.getColorCode())
                .icon(category.getIcon())
                .isGlobal(category.getUser() == null)
                .build();
    }
}
