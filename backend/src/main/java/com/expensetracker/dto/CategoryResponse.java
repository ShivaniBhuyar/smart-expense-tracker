package com.expensetracker.dto;

import com.expensetracker.entity.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Category details returned in API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;

    private String name;

    private CategoryType type;

    private String description;

    private String colorCode;

    private String icon;

    private boolean isGlobal;
}
