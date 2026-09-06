package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

/**
 * REST Controller for managing financial categories.
 */
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Retrieves all categories accessible to the user, optionally filtered by type (INCOME/EXPENSE).
     *
     * @param type Optional filter by category type
     * @param currentUser The authenticated user
     * @return List of CategoryResponse wrapped in ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false) CategoryType type,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<CategoryResponse> categories;
        if (type != null) {
            categories = categoryService.getCategoriesByType(currentUser.getId(), type);
        } else {
            categories = categoryService.getAllCategories(currentUser.getId());
        }

        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Retrieves a specific category by ID.
     *
     * @param id The category ID
     * @param currentUser The authenticated user
     * @return CategoryResponse wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        CategoryResponse category = categoryService.getCategoryById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    /**
     * Creates a new custom category for the user.
     *
     * @param request The category details payload
     * @param currentUser The authenticated user
     * @return The created CategoryResponse wrapped in ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        CategoryResponse category = categoryService.createCategory(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    /**
     * Updates an existing custom category.
     *
     * @param id The category ID to update
     * @param request The updated category payload
     * @param currentUser The authenticated user
     * @return The updated CategoryResponse wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        CategoryResponse category = categoryService.updateCategory(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    /**
     * Deletes a custom category.
     *
     * @param id The category ID to delete
     * @param currentUser The authenticated user
     * @return Empty ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        categoryService.deleteCategory(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }
}
