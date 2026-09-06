package com.expensetracker.repository;

import com.expensetracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for Income entity persistence operations.
 */
@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    /**
     * Find all incomes for a user, ordered by date descending (most recent first).
     *
     * @param userId User ID
     * @return List of Income entities
     */
    List<Income> findByUserIdOrderByDateDesc(Long userId);

    /**
     * Find incomes for a user within a specified date range, ordered by date descending.
     *
     * @param userId    User ID
     * @param startDate Range start date
     * @param endDate   Range end date
     * @return List of matching Income entities
     */
    List<Income> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * Find an income record by ID and user ID for authorization safety.
     *
     * @param id     Income ID
     * @param userId User ID
     * @return Optional containing Income if found and owned by user
     */
    Optional<Income> findByIdAndUserId(Long id, Long userId);

    /**
     * Calculate total cumulative income for a user.
     *
     * @param userId User ID
     * @return Total sum of income amounts (or 0 if no records exist)
     */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId")
    BigDecimal sumTotalIncomeByUserId(@Param("userId") Long userId);

    /**
     * Calculate total income for a user within a specified date range.
     *
     * @param userId    User ID
     * @param startDate Range start date
     * @param endDate   Range end date
     * @return Total sum of income amounts within date range (or 0 if no records exist)
     */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId AND i.date BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByUserIdAndDateBetween(@Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);
}
