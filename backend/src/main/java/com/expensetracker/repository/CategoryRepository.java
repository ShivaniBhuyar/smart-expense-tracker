package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for Category entity persistence operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Retrieve all categories available to a specific user (system default global categories + user custom categories).
     *
     * @param userId User ID
     * @return List of accessible Category entities
     */
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId OR c.user IS NULL")
    List<Category> findAllAvailableByUserId(@Param("userId") Long userId);

    /**
     * Retrieve categories filtered by user ID (or global default) and category type (INCOME or EXPENSE).
     *
     * @param userId User ID
     * @param type   CategoryType (INCOME or EXPENSE)
     * @return List of matching Category entities
     */
    @Query("SELECT c FROM Category c WHERE (c.user.id = :userId OR c.user IS NULL) AND c.type = :type")
    List<Category> findAllAvailableByUserIdAndType(@Param("userId") Long userId, @Param("type") CategoryType type);

    /**
     * Find a category by ID if it belongs to the specified user or is a global category.
     *
     * @param id     Category ID
     * @param userId User ID
     * @return Optional containing Category if authorized, empty Optional otherwise
     */
    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.user.id = :userId OR c.user IS NULL)")
    Optional<Category> findByIdAndUserIdOrGlobal(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Check if a category with the same name already exists for a specific user.
     *
     * @param name   Category Name
     * @param userId User ID
     * @return true if custom category exists, false otherwise
     */
    Boolean existsByNameAndUserId(String name, Long userId);
}
