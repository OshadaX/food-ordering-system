package com.foodorder.repository;

import com.foodorder.model.Category;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoryRepository {

    private Connection connection;

    public CategoryRepository() {
        this.connection = DBConnection.getInstance().getConnection();
    }

    private Category mapRow(ResultSet rs) throws SQLException {
        Category category = new Category();
        category.setId(rs.getInt("id"));
        category.setName(rs.getString("name"));
        category.setCreatedAt(rs.getString("created_at"));
        return category;
    }

    public boolean save(Category category) throws SQLException {
        String sql = "INSERT INTO categories (name) VALUES (?)";
        PreparedStatement stmt = connection.prepareStatement(sql);
        stmt.setString(1, category.getName());
        return stmt.executeUpdate() > 0;
    }

    public List<Category> findAll() throws SQLException {
        List<Category> categories = new ArrayList<>();
        PreparedStatement stmt = connection.prepareStatement("SELECT * FROM categories ORDER BY name ASC");
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) categories.add(mapRow(rs));
        return categories;
    }

    public Category findById(int id) throws SQLException {
        PreparedStatement stmt = connection.prepareStatement("SELECT * FROM categories WHERE id = ?");
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();
        return rs.next() ? mapRow(rs) : null;
    }
}
