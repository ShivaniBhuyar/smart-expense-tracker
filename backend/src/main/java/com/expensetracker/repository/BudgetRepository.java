package com.expensetracker.repository;

import com.expensetracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for Budget entity persistence operations.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets set by a user.
     *
     * @param userId User ID
     * @return List of Budget entities
     */
    List<Budget> findByUserId(Long userId);

    /**
     * Find a budget record by ID and user ID for authorization security.
     *
     * @param id     Budget ID
     * @param userId User ID
     * @return Optional containing Budget if found and owned by user
     */
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    /**
     * Find active budget for a user and category on a specific date.
     *
     * @param userId     User ID
     * @param categoryId Category ID
     * @param date       Target date
     * @return Optional containing active Budget if configured
     */
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category.id = :categoryId AND :date BETWEEN b.startDate AND b.endDate")
    Optional<Budget> findActiveBudgetForCategory(@Param("userId") Long userId,
                                                @Param("categoryId") Long categoryId,
                                                @Param("date") LocalDate date);

    /**
     * Check if a budget already exists for a user and category overlapping a date range.
     *
     * @param userId     User ID
     * @param categoryId Category ID
     * @param startDate  Budget start date
     * @param endDate    Budget end date
     * @return true if overlapping budget exists, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Budget b WHERE b.user.id = :userId AND b.category.id = :categoryId AND (b.startDate <= :endDate AND b.endDate >= :startDate)")
    Boolean existsOverlappingBudget(@Param("userId") Long userId,
                                   @Param("categoryId") Long categoryId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}
