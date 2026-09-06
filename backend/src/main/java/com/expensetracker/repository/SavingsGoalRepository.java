package com.expensetracker.repository;

import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository interface for SavingsGoal entity persistence operations.
 */
@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    /**
     * Find all savings goals for a user, ordered by target date ascending (earliest target dates first).
     *
     * @param userId User ID
     * @return List of SavingsGoal entities
     */
    List<SavingsGoal> findByUserIdOrderByTargetDateAsc(Long userId);

    /**
     * Find savings goals for a user filtered by goal status (IN_PROGRESS, COMPLETED, CANCELLED).
     *
     * @param userId User ID
     * @param status GoalStatus
     * @return List of matching SavingsGoal entities
     */
    List<SavingsGoal> findByUserIdAndStatus(Long userId, GoalStatus status);

    /**
     * Find a savings goal by ID and user ID for authorization safety.
     *
     * @param id     SavingsGoal ID
     * @param userId User ID
     * @return Optional containing SavingsGoal if found and owned by user
     */
    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);
}
