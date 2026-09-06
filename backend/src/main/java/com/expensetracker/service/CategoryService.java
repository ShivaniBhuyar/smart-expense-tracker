package com.expensetracker.service;

import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing income/expense transaction categories.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * Retrieve all categories accessible to a specific user (global system categories + custom user categories).
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Long userId) {
        return categoryRepository.findAllAvailableByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve categories filtered by category type (INCOME or EXPENSE).
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(Long userId, CategoryType type) {
        return categoryRepository.findAllAvailableByUserIdAndType(userId, type)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific category by ID if accessible to user.
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, Long userId) {
        Category category = categoryRepository.findByIdAndUserIdOrGlobal(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponse(category);
    }

    /**
     * Create a new custom category for a user.
     */
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, Long userId) {
        if (categoryRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .description(request.getDescription())
                .colorCode(request.getColorCode())
                .icon(request.getIcon())
                .user(user)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }

    /**
     * Update an existing custom user category.
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, Long userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.getUser() == null) {
            throw new BadRequestException("System global categories cannot be modified");
        }

        if (!category.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to update this category");
        }

        category.setName(request.getName());
        category.setType(request.getType());
        category.setDescription(request.getDescription());
        category.setColorCode(request.getColorCode());
        category.setIcon(request.getIcon());

        Category updatedCategory = categoryRepository.save(category);
        return mapToResponse(updatedCategory);
    }

    /**
     * Delete a custom user category.
     */
    @Transactional
    public void deleteCategory(Long id, Long userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.getUser() == null) {
            throw new BadRequestException("System global categories cannot be deleted");
        }

        if (!category.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to delete this category");
        }

        categoryRepository.delete(category);
    }

    /**
     * Helper method mapping Category entity to CategoryResponse DTO.
     */
    public CategoryResponse mapToResponse(Category category) {
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
