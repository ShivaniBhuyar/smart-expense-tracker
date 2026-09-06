package com.expensetracker.service;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing user-related business logic, profiles, and account settings.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieves a user entity by ID. Primarily used internally by other services.
     *
     * @param userId The ID of the user
     * @return User entity
     * @throws ResourceNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    /**
     * Retrieves a user entity by email.
     *
     * @param email The email of the user
     * @return User entity
     * @throws ResourceNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /**
     * Retrieves the profile information for a user using existing AuthResponse DTO (without token).
     *
     * @param userId The ID of the user
     * @return User profile details mapped to AuthResponse
     */
    @Transactional(readOnly = true)
    public AuthResponse getUserProfile(Long userId) {
        User user = getUserById(userId);
        
        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                // token and tokenType will be null for profile responses
                .build();
    }

    /**
     * Changes a user's password with validation.
     *
     * @param userId The ID of the user
     * @param currentPassword The current password to verify
     * @param newPassword The new password to set
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Invalid current password");
        }
        
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as the current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
