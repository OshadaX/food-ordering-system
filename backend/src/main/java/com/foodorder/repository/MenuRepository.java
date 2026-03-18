package com.foodorder.repository;

import com.foodorder.model.MenuItem;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MenuRepository {

    private Connection connection;

    public MenuRepository() {
        this.connection = DBConnection.getInstance().getConnection();
    }

    // ── helper ───────────────────────────────
    private MenuItem mapRow(ResultSet rs) throws SQLException {
        MenuItem item = new MenuItem();
        item.setId          (rs.getInt    ("id"));
        item.setCategoryId  (rs.getInt    ("category_id"));
        item.setName        (rs.getString ("name"));
        item.setDescription (rs.getString ("description"));
        item.setPrice       (rs.getDouble ("price"));
        item.setImageUrl    (rs.getString ("image_url"));
        item.setAvailable   (rs.getBoolean("is_available"));
        item.setCreatedAt   (rs.getString ("created_at"));
        return item;
    }

    // ── CREATE ───────────────────────────────
    public boolean save(MenuItem item) throws SQLException {
        String sql = "INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setInt    (1, item.getCategoryId());
        stmt.setString (2, item.getName());
        stmt.setString (3, item.getDescription());
        stmt.setDouble (4, item.getPrice());
        stmt.setString (5, item.getImageUrl());
        stmt.setBoolean(6, item.isAvailable());
        return stmt.executeUpdate() > 0;
    }

    // ── READ ─────────────────────────────────
    public List<MenuItem> findAll() throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM menu_items ORDER BY created_at DESC");
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) items.add(mapRow(rs));
        return items;
    }

    public MenuItem findById(int id) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM menu_items WHERE id = ?");
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();
        return rs.next() ? mapRow(rs) : null;
    }

    public List<MenuItem> findByCategory(int categoryId) throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        PreparedStatement stmt = connection.prepareStatement(
            "SELECT * FROM menu_items WHERE category_id = ? AND is_available = TRUE");
        stmt.setInt(1, categoryId);
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) items.add(mapRow(rs));
        return items;
    }

    // ── UPDATE ───────────────────────────────
    public boolean update(MenuItem item) throws SQLException {
        String sql = "UPDATE menu_items SET category_id=?, name=?, description=?, " +
                     "price=?, image_url=?, is_available=? WHERE id=?";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setInt    (1, item.getCategoryId());
        stmt.setString (2, item.getName());
        stmt.setString (3, item.getDescription());
        stmt.setDouble (4, item.getPrice());
        stmt.setString (5, item.getImageUrl());
        stmt.setBoolean(6, item.isAvailable());
        stmt.setInt    (7, item.getId());
        return stmt.executeUpdate() > 0;
    }

    public boolean toggleAvailability(int id, boolean status) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "UPDATE menu_items SET is_available=? WHERE id=?");
        stmt.setBoolean(1, status);
        stmt.setInt    (2, id);
        return stmt.executeUpdate() > 0;
    }

    // ── DELETE ───────────────────────────────
    public boolean delete(int id) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement(
            "DELETE FROM menu_items WHERE id=?");
        stmt.setInt(1, id);
        return stmt.executeUpdate() > 0;
    }
}