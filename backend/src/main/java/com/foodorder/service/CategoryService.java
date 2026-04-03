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

    public List<Category> getAllCategories() {
        try {
            return categoryRepository.findAll();
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }
}
