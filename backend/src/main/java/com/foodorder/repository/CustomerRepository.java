package com.foodorder.repository;

import com.foodorder.model.Customer;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CustomerRepository {

    public CustomerRepository() {
        // No longer storing connection in constructor to avoid stale references
    }

    // ── helper ───────────────────────────────────────────────────────
    private Customer mapRow(ResultSet rs) throws SQLException {
        Customer c = new Customer();
        c.setId        (rs.getInt    ("id"));
        c.setName      (rs.getString ("name"));
        c.setEmail     (rs.getString ("email"));
        c.setPassword  (rs.getString ("password"));
        c.setPhone     (rs.getString ("phone"));
        c.setRole      (rs.getString ("role"));
        c.setCreatedAt (rs.getString ("created_at"));
        return c;
    }

    // ── CREATE ───────────────────────────────────────────────────────
    public boolean save(Customer customer) throws SQLException {
        String sql = "INSERT INTO customers (name, email, password, phone, role) " +
                     "VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, customer.getName());
            stmt.setString(2, customer.getEmail());
            stmt.setString(3, customer.getPassword());
            stmt.setString(4, customer.getPhone());
            stmt.setString(5, customer.getRole() != null ? customer.getRole() : "customer");
            return stmt.executeUpdate() > 0;
        }
    }

    // ── READ ─────────────────────────────────────────────────────────
    public Customer findById(int id) throws SQLException {
        String sql = "SELECT * FROM customers WHERE id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    public Customer findByEmail(String email) throws SQLException {
        String sql = "SELECT * FROM customers WHERE email = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    public boolean emailExists(String email) throws SQLException {
        String sql = "SELECT id FROM customers WHERE email = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public List<Customer> findAll() throws SQLException {
        List<Customer> customers = new ArrayList<>();
        String sql = "SELECT * FROM customers ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                customers.add(mapRow(rs));
            }
        }
        return customers;
    }

    // ── UPDATE ───────────────────────────────────────────────────────
    public boolean updateProfile(int id, String name, String phone) throws SQLException {
        String sql = "UPDATE customers SET name=?, phone=? WHERE id=?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setString(2, phone);
            stmt.setInt   (3, id);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean updatePassword(int id, String hashedPassword) throws SQLException {
        String sql = "UPDATE customers SET password=? WHERE id=?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, hashedPassword);
            stmt.setInt   (2, id);
            return stmt.executeUpdate() > 0;
        }
    }

    // ── DELETE ───────────────────────────────────────────────────────
    public boolean delete(int id) throws SQLException {
        String sql = "DELETE FROM customers WHERE id=?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        }
    }
}