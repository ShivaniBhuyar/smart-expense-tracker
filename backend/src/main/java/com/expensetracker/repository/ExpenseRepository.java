package com.expensetracker.repository;

import com.expensetracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for Expense entity persistence operations.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    /**
     * Find all expenses for a user, ordered by date descending (most recent first).
     *
     * @param userId User ID
     * @return List of Expense entities
     */
    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    /**
     * Find expenses for a user within a specified date range, ordered by date descending.
     *
     * @param userId    User ID
     * @param startDate Range start date
     * @param endDate   Range end date
     * @return List of matching Expense entities
     */
    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * Find an expense record by ID and user ID for authorization safety.
     *
     * @param id     Expense ID
     * @param userId User ID
     * @return Optional containing Expense if found and owned by user
     */
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    /**
     * Calculate total cumulative expense for a user.
     *
     * @param userId User ID
     * @return Total sum of expense amounts (or 0 if no records exist)
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumTotalExpenseByUserId(@Param("userId") Long userId);

    /**
     * Calculate total expense for a user within a specified date range.
     *
     * @param userId    User ID
     * @param startDate Range start date
     * @param endDate   Range end date
     * @return Total sum of expense amounts within date range (or 0 if no records exist)
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserIdAndDateBetween(@Param("userId") Long userId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    /**
     * Calculate total expense for a specific category within a date range (for budget threshold calculations).
     *
     * @param userId     User ID
     * @param categoryId Category ID
     * @param startDate  Range start date
     * @param endDate    Range end date
     * @return Sum of expenses for category within timeframe (or 0 if no records exist)
     */
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.category.id = :categoryId AND e.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserIdAndCategoryIdAndDateBetween(@Param("userId") Long userId,
                                                             @Param("categoryId") Long categoryId,
                                                             @Param("startDate") LocalDate startDate,
                                                             @Param("endDate") LocalDate endDate);
}
