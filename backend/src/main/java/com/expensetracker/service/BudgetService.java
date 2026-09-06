package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing Budget-related business logic, thresholds, and calculations.
 */
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    /**
     * Creates a new budget for a specific category.
     */
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, Long userId) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = validateAndGetExpenseCategory(request.getCategoryId(), userId);

        if (budgetRepository.existsOverlappingBudget(userId, category.getId(), request.getStartDate(), request.getEndDate())) {
            throw new BadRequestException("An overlapping budget already exists for this category in the specified date range");
        }

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .category(category)
                .user(user)
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        return mapToResponse(savedBudget, userId);
    }

    /**
     * Retrieves all budgets for a user.
     */
    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets(Long userId) {
        return budgetRepository.findByUserId(userId)
                .stream()
                .map(budget -> mapToResponse(budget, userId))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a specific budget by ID, ensuring user ownership.
     */
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        return mapToResponse(budget, userId);
    }

    /**
     * Updates an existing budget entry.
     */
    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request, Long userId) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        Category category = validateAndGetExpenseCategory(request.getCategoryId(), userId);

        // Check for overlaps excluding the current budget in memory
        boolean overlap = budgetRepository.findByUserId(userId).stream()
                .filter(b -> !b.getId().equals(id))
                .filter(b -> b.getCategory().getId().equals(category.getId()))
                .anyMatch(b -> !b.getStartDate().isAfter(request.getEndDate()) && !b.getEndDate().isBefore(request.getStartDate()));

        if (overlap) {
            throw new BadRequestException("An overlapping budget already exists for this category in the specified date range");
        }

        budget.setAmount(request.getAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setCategory(category);

        Budget updatedBudget = budgetRepository.save(budget);
        return mapToResponse(updatedBudget, userId);
    }

    /**
     * Deletes a budget entry.
     */
    @Transactional
    public void deleteBudget(Long id, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        budgetRepository.delete(budget);
    }

    /**
     * Helper to validate that a category exists, belongs to the user (or is global), and is of type EXPENSE.
     */
    private Category validateAndGetExpenseCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserIdOrGlobal(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getType() != CategoryType.EXPENSE) {
            throw new BadRequestException("Budgets can only be set for EXPENSE categories");
        }

        return category;
    }

    /**
     * Maps a Budget entity to its Response DTO and calculates spending progress.
     */
    private BudgetResponse mapToResponse(Budget budget, Long userId) {
        // Fetch actual spent amount for the category in the given timeframe
        BigDecimal spentAmount = expenseRepository.sumExpenseByUserIdAndCategoryIdAndDateBetween(
                userId,
                budget.getCategory().getId(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        if (spentAmount == null) {
            spentAmount = BigDecimal.ZERO;
        }

        BigDecimal remainingAmount = budget.getAmount().subtract(spentAmount);
        
        double percentageUsed = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spentAmount.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        boolean isExceeded = remainingAmount.compareTo(BigDecimal.ZERO) < 0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .amount(budget.getAmount())
                .spentAmount(spentAmount)
                .remainingAmount(remainingAmount)
                .percentageUsed(percentageUsed)
                .isExceeded(isExceeded)
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .category(mapCategoryToResponse(budget.getCategory()))
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
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
