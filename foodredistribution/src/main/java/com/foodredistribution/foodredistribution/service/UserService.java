package com.foodredistribution.foodredistribution.service;

import com.foodredistribution.foodredistribution.aspect.Auditable;
import com.foodredistribution.foodredistribution.dto.RegisterRequest;
import com.foodredistribution.foodredistribution.dto.UpdateUserRequest;
import com.foodredistribution.foodredistribution.dto.UserDTO;
import com.foodredistribution.foodredistribution.entity.AuditAction;
import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.exception.BadRequestException;
import com.foodredistribution.foodredistribution.exception.ResourceNotFoundException;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Auditable(action = AuditAction.USER_REGISTERED, entity = "User")
    @Transactional
    public UserDTO registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        return toDTO(userRepository.save(user));
    }

    public UserDTO getUserById(Long id) {
        return toDTO(findById(id));
    }

    @Auditable(action = AuditAction.USER_UPDATED, entity = "User")
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = findById(id);
        user.setName(request.getName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        return toDTO(userRepository.save(user));
    }

    public Page<UserDTO> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).map(this::toDTO);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserDTO toDTO(User user) {
        return new UserDTO(user.getUserId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    /** Used by @PreAuthorize SpEL to check ownership without an extra service call */
    public String getEmailById(Long id) {
        return findById(id).getEmail();
    }
}
