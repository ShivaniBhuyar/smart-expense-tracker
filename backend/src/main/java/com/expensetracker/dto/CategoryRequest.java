package com.expensetracker.dto;

import com.expensetracker.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for creating or updating transaction categories.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 50, message = "Category name cannot exceed 50 characters")
    private String name;

    @NotNull(message = "Category type (INCOME or EXPENSE) is required")
    private CategoryType type;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Size(max = 10, message = "Color code cannot exceed 10 characters")
    private String colorCode;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String icon;
}
