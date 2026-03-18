package com.foodorder.service;

import com.foodorder.model.MenuItem;
import com.foodorder.repository.MenuRepository;

import java.sql.SQLException;
import java.util.List;

public class MenuService {

    private MenuRepository menuRepository;

    public MenuService() {
        this.menuRepository = new MenuRepository();
    }

    public String[] addItem(MenuItem item) {
        String[] result = new String[2];
        if (item.getName() == null || item.getName().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Item name is required"; return result;
        }
        if (item.getPrice() <= 0) {
            result[0] = "error"; result[1] = "Price must be greater than zero"; return result;
        }
        if (item.getCategoryId() <= 0) {
            result[0] = "error"; result[1] = "Please select a valid category"; return result;
        }
        try {
            boolean saved = menuRepository.save(item);
            result[0] = saved ? "success" : "error";
            result[1] = saved ? "Menu item added successfully" : "Failed to add menu item";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public List<MenuItem> getAllItems() {
        try {
            return menuRepository.findAll();
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }

    public MenuItem getItemById(int id) {
        if (id <= 0) return null;
        try {
            return menuRepository.findById(id);
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }

    public List<MenuItem> getItemsByCategory(int categoryId) {
        if (categoryId <= 0) return null;
        try {
            return menuRepository.findByCategory(categoryId);
        } catch (SQLException e) {
            e.printStackTrace(); return null;
        }
    }

    public String[] updateItem(MenuItem item) {
        String[] result = new String[2];
        if (item.getId() <= 0) {
            result[0] = "error"; result[1] = "Invalid item ID"; return result;
        }
        if (item.getName() == null || item.getName().trim().isEmpty()) {
            result[0] = "error"; result[1] = "Item name is required"; return result;
        }
        if (item.getPrice() <= 0) {
            result[0] = "error"; result[1] = "Price must be greater than zero"; return result;
        }
        try {
            MenuItem existing = menuRepository.findById(item.getId());
            if (existing == null) {
                result[0] = "error"; result[1] = "Menu item not found"; return result;
            }
            boolean updated = menuRepository.update(item);
            result[0] = updated ? "success" : "error";
            result[1] = updated ? "Menu item updated successfully" : "Failed to update menu item";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] toggleAvailability(int id, boolean status) {
        String[] result = new String[2];
        if (id <= 0) {
            result[0] = "error"; result[1] = "Invalid item ID"; return result;
        }
        try {
            boolean toggled = menuRepository.toggleAvailability(id, status);
            result[0] = toggled ? "success" : "error";
            result[1] = toggled ? (status ? "Item marked as available" : "Item marked as unavailable") : "Item not found";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }

    public String[] deleteItem(int id) {
        String[] result = new String[2];
        if (id <= 0) {
            result[0] = "error"; result[1] = "Invalid item ID"; return result;
        }
        try {
            MenuItem existing = menuRepository.findById(id);
            if (existing == null) {
                result[0] = "error"; result[1] = "Menu item not found"; return result;
            }
            boolean deleted = menuRepository.delete(id);
            result[0] = deleted ? "success" : "error";
            result[1] = deleted ? "Menu item deleted successfully" : "Failed to delete menu item";
        } catch (SQLException e) {
            result[0] = "error"; result[1] = "Database error: " + e.getMessage();
        }
        return result;
    }
}