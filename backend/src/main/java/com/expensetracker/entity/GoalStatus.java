package com.expensetracker.entity;

/**
 * Enumeration representing the current lifecycle status of a user's savings goal.
 * 
 * IN_PROGRESS: Target amount is currently active and accumulating savings.
 * COMPLETED: Target savings goal amount has been successfully achieved.
 * CANCELLED: Goal was prematurely terminated or abandoned by the user.
 */
public enum GoalStatus {
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
