package com.foodorder.service;

import com.foodorder.model.Customer;
import com.foodorder.repository.CustomerRepository;
import com.foodorder.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.SQLException;
import java.util.List;

public class CustomerService {

    private CustomerRepository customerRepository;

    public CustomerService() {
        this.customerRepository = new CustomerRepository();
    }

    public String[] register(Customer customer) {
        String[] result = new String[2];
        if (customer.getName() == null || customer.getName().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Name is required"; return result;
        }
        if (customer.getEmail() == null || customer.getEmail().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Email is required"; return result;
        }
        if (!customer.getEmail().contains("@")) {
            result[0] = "error"; result[1] = "Please enter a valid email address"; return result;
        }
        if (customer.getPassword() == null || customer.getPassword().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Password is required"; return result;
        }
        if (customer.getPassword().length() < 6) {
            result[0] = "error"; result[1] = "Password must be at least 6 characters"; return result;
        }
        try {
            if (customerRepository.emailExists(customer.getEmail())) {
                result[0] = "error"; result[1] = "Email is already registered"; return result;
            }
            String hashedPassword = BCrypt.hashpw(customer.getPassword(), BCrypt.gensalt());
            customer.setPassword(hashedPassword);
            boolean saved = customerRepository.save(customer);
            result[0] = saved ? "success" : "error";
            result[1] = saved ? "Registration successful. Please login." : "Registration failed. Please try again.";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] login(String email, String password) {
        String[] result = new String[3];
        if (email == null || email.trim().isEmpty()) {
            result[0] = "error"; result[1] = "Email is required"; return result;
        }
        if (password == null || password.trim().isEmpty()) {
            result[0] = "error"; result[1] = "Password is required"; return result;
        }
        try {
            Customer customer = customerRepository.findByEmail(email);
            if (customer == null) {
                result[0] = "error"; result[1] = "Invalid email or password"; return result;
            }
            if (!BCrypt.checkpw(password, customer.getPassword())) {
                result[0] = "error"; result[1] = "Invalid email or password"; return result;
            }
            String token = JwtUtil.generateToken(
                customer.getId(), customer.getName(), customer.getEmail());
            result[0] = "success";
            result[1] = "Login successful";
            result[2] = token;
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public Customer getProfile(int customerId) {
        if (customerId <= 0) return null;
        try {
            return customerRepository.findById(customerId);
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }

    public String[] updateProfile(int customerId, String name, String phone) {
        String[] result = new String[2];
        if (name == null || name.trim().isEmpty()) {
            result[0] = "error"; result[1] = "Name is required"; return result;
        }
        try {
            boolean updated = customerRepository.updateProfile(customerId, name, phone);
            result[0] = updated ? "success" : "error";
            result[1] = updated ? "Profile updated successfully" : "Failed to update profile";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] changePassword(int customerId, String currentPassword, String newPassword) {
        String[] result = new String[2];
        if (newPassword == null || newPassword.length() < 6) {
            result[0] = "error"; result[1] = "New password must be at least 6 characters"; return result;
        }
        try {
            Customer customer = customerRepository.findById(customerId);
            if (customer == null) {
                result[0] = "error"; result[1] = "Customer not found"; return result;
            }
            if (!BCrypt.checkpw(currentPassword, customer.getPassword())) {
                result[0] = "error"; result[1] = "Current password is incorrect"; return result;
            }
            String hashedNew = BCrypt.hashpw(newPassword, BCrypt.gensalt());
            boolean updated = customerRepository.updatePassword(customerId, hashedNew);
            result[0] = updated ? "success" : "error";
            result[1] = updated ? "Password changed successfully" : "Failed to change password";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] deleteAccount(int customerId) {
        String[] result = new String[2];
        if (customerId <= 0) {
            result[0] = "error"; result[1] = "Invalid customer ID"; return result;
        }
        try {
            Customer existing = customerRepository.findById(customerId);
            if (existing == null) {
                result[0] = "error"; result[1] = "Customer not found"; return result;
            }
            boolean deleted = customerRepository.delete(customerId);
            result[0] = deleted ? "success" : "error";
            result[1] = deleted ? "Account deleted successfully" : "Failed to delete account";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }
}