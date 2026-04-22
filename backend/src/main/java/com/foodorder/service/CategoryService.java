package com.foodorder.service;

import com.foodorder.model.Category;
import com.foodorder.repository.CategoryRepository;

import java.sql.SQLException;
import java.util.List;

public class CategoryService {

    private CategoryRepository categoryRepository;

    public CategoryService() {
        this.categoryRepository = new CategoryRepository();
    }

    public String[] addCategory(Category category) {
        String[] result = new String[2];
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Category name is required"; return result;
        }
        try {
            boolean saved = categoryRepository.save(category);
            result[0] = saved ? "success" : "error";
            result[1] = saved ? "Category added successfully" : "Failed to add category";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] updateCategory(Category category) {
        String[] result = new String[2];
        if (category.getId() <= 0) {
            result[0] = "error"; result[1] = "Invalid category ID"; return result;
        }
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Category name is required"; return result;
        }
        try {
            boolean updated = categoryRepository.update(category);
            result[0] = updated ? "success" : "error";
            result[1] = updated ? "Category updated successfully" : "Failed to update category";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] deleteCategory(int id) {
        String[] result = new String[2];
        if (id <= 0) {
            result[0] = "error"; result[1] = "Invalid category ID"; return result;
        }
        try {
            boolean deleted = categoryRepository.delete(id);
            result[0] = deleted ? "success" : "error";
            result[1] = deleted ? "Category deleted successfully" : "Category not found";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public List<Category> getAllCategories() {
        try {
            return categoryRepository.findAll();
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }
}
