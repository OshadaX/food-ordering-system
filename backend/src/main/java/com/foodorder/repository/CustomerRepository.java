package com.foodorder.repository;

import com.foodorder.model.Customer;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CustomerRepository {

    private Connection connection;

    public CustomerRepository() {
        this.connection = DBConnection.getInstance().getConnection();
    }

    // ── helper ───────────────────────────────────────────────────────
    // maps one ResultSet row to one Customer object
    // same DRY principle as MenuRepository
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
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, customer.getName());
        stmt.setString(2, customer.getEmail());
        stmt.setString(3, customer.getPassword());
        stmt.setString(4, customer.getPhone());
        stmt.setString(5, customer.getRole() != null ? customer.getRole() : "customer");
        return stmt.executeUpdate() > 0;
    }

    // ── READ ─────────────────────────────────────────────────────────
    // find by ID — used after login to get full profile
    public Customer findById(int id) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM customers WHERE id = ?");
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();
        return rs.next() ? mapRow(rs) : null;
    }

    // find by email — used during login
    // email is unique so this returns one customer or null
    public Customer findByEmail(String email) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM customers WHERE email = ?");
        stmt.setString(1, email);
        ResultSet rs = stmt.executeQuery();
        return rs.next() ? mapRow(rs) : null;
    }

    // check if email already exists — used during registration
    // returns true if email is taken
    public boolean emailExists(String email) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT id FROM customers WHERE email = ?");
        stmt.setString(1, email);
        ResultSet rs = stmt.executeQuery();
        return rs.next();
    }

    // get all customers — admin use only
    public List<Customer> findAll() throws SQLException {
        List<Customer> customers = new ArrayList<>();
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM customers ORDER BY created_at DESC");
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) customers.add(mapRow(rs));
        return customers;
    }

    // ── UPDATE ───────────────────────────────────────────────────────
    // update profile — name and phone only
    // email and password have separate methods for security
    public boolean updateProfile(int id, String name, String phone) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "UPDATE customers SET name=?, phone=? WHERE id=?");
        stmt.setString(1, name);
        stmt.setString(2, phone);
        stmt.setInt   (3, id);
        return stmt.executeUpdate() > 0;
    }

    // update password — separate method because it needs special handling
    public boolean updatePassword(int id, String hashedPassword) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "UPDATE customers SET password=? WHERE id=?");
        stmt.setString(1, hashedPassword);
        stmt.setInt   (2, id);
        return stmt.executeUpdate() > 0;
    }

    // ── DELETE ───────────────────────────────────────────────────────
    public boolean delete(int id) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "DELETE FROM customers WHERE id=?");
        stmt.setInt(1, id);
        return stmt.executeUpdate() > 0;
    }
}