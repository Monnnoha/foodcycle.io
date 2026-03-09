package com.foodredistribution.foodredistribution.controller;

import com.foodredistribution.foodredistribution.entity.User;
import com.foodredistribution.foodredistribution.repository.UserRepository;
import com.foodredistribution.foodredistribution.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }
    }

