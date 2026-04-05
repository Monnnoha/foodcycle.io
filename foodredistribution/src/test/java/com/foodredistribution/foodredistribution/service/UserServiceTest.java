package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.dto.RegisterRequest;
import com.foodredistribution.foodredistribution.dto.UpdateUserRequest;
import com.foodredistribution.foodredistribution.dto.UserDTO;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.entity.UserRole;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole(UserRole.DONOR);

        savedUser = new User();
        savedUser.setUserId(1L);
        savedUser.setName("John Doe");
        savedUser.setEmail("john@example.com");
        savedUser.setPassword("encoded-password");
        savedUser.setRole(UserRole.DONOR);
    }

    @Test
    void registerUser_success() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO result = userService.registerUser(registerRequest);

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("John Doe");
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        assertThat(result.getRole()).isEqualTo(UserRole.DONOR);

        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_duplicateEmail_throwsBadRequestException() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.of(savedUser));

        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void getUserById_found_returnsDTO() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));

        UserDTO result = userService.getUserById(1L);

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("john@example.com");
    }

    @Test
    void getUserById_notFound_throwsResourceNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updateUser_updatesNameAndPhone() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setName("Jane Doe");
        request.setPhone("+1234567890");

        User updatedUser = new User();
        updatedUser.setUserId(1L);
        updatedUser.setName("Jane Doe");
        updatedUser.setEmail("john@example.com");
        updatedUser.setPhone("+1234567890");
        updatedUser.setRole(UserRole.DONOR);

        when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        UserDTO result = userService.updateUser(1L, request);

        assertThat(result.getName()).isEqualTo("Jane Doe");
        assertThat(result.getPhone()).isEqualTo("+1234567890");
    }
}
