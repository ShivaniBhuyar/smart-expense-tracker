package com.expensetracker.service;

import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing Expense-related business logic and transactions.
 */
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new expense entry for the user.
     */
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = validateAndGetCategory(request.getCategoryId(), userId);

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .merchant(request.getMerchant())
                .paymentMethod(request.getPaymentMethod())
                .category(category)
                .user(user)
                .build();

        Expense savedExpense = expenseRepository.save(expense);
        return mapToResponse(savedExpense);
    }

    /**
     * Retrieves all expenses for a user, optionally filtered by a date range.
     */
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses;
        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new BadRequestException("Start date cannot be after end date");
            }
            expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        } else {
            expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        }

        return expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a specific expense by ID, ensuring user ownership.
     */
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        return mapToResponse(expense);
    }

    /**
     * Updates an existing expense entry.
     */
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        Category category = validateAndGetCategory(request.getCategoryId(), userId);

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setMerchant(request.getMerchant());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setCategory(category);

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToResponse(updatedExpense);
    }

    /**
     * Deletes an expense entry.
     */
    @Transactional
    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        expenseRepository.delete(expense);
    }

    /**
     * Helper to validate that a category exists, belongs to the user (or is global), and is of type EXPENSE.
     */
    private Category validateAndGetCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserIdOrGlobal(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getType() != CategoryType.EXPENSE) {
            throw new BadRequestException("Category must be of type EXPENSE for an expense transaction");
        }
        
        return category;
    }

    /**
     * Maps an Expense entity to its corresponding Response DTO.
     */
    private ExpenseResponse mapToResponse(Expense expense) {
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
