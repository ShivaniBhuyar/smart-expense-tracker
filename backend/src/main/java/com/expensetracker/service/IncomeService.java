package com.expensetracker.service;

import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.IncomeRequest;
import com.expensetracker.dto.IncomeResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.Income;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.IncomeRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing Income-related business logic and transactions.
 */
@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new income entry for the user.
     */
    @Transactional
    public IncomeResponse createIncome(IncomeRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = validateAndGetCategory(request.getCategoryId(), userId);

        Income income = Income.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .date(request.getDate())
                .description(request.getDescription())
                .source(request.getSource())
                .category(category)
                .user(user)
                .build();

        Income savedIncome = incomeRepository.save(income);
        return mapToResponse(savedIncome);
    }

    /**
     * Retrieves all incomes for a user, optionally filtered by a date range.
     */
    @Transactional(readOnly = true)
    public List<IncomeResponse> getAllIncomes(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Income> incomes;
        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new BadRequestException("Start date cannot be after end date");
            }
            incomes = incomeRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        } else {
            incomes = incomeRepository.findByUserIdOrderByDateDesc(userId);
        }

        return incomes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a specific income by ID, ensuring user ownership.
     */
    @Transactional(readOnly = true)
    public IncomeResponse getIncomeById(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        return mapToResponse(income);
    }

    /**
     * Updates an existing income entry.
     */
    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));

        Category category = validateAndGetCategory(request.getCategoryId(), userId);

        income.setTitle(request.getTitle());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setDescription(request.getDescription());
        income.setSource(request.getSource());
        income.setCategory(category);

        Income updatedIncome = incomeRepository.save(income);
        return mapToResponse(updatedIncome);
    }

    /**
     * Deletes an income entry.
     */
    @Transactional
    public void deleteIncome(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        incomeRepository.delete(income);
    }

    /**
     * Helper to validate that a category exists, belongs to the user (or is global), and is of type INCOME.
     */
    private Category validateAndGetCategory(Long categoryId, Long userId) {
        Category category = categoryRepository.findByIdAndUserIdOrGlobal(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getType() != CategoryType.INCOME) {
            throw new BadRequestException("Category must be of type INCOME for an income transaction");
        }
        
        return category;
    }

    /**
     * Maps an Income entity to its corresponding Response DTO.
     */
    private IncomeResponse mapToResponse(Income income) {
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
