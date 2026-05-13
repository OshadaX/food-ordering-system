package com.foodorder.repository;

import com.foodorder.model.OrderNotification;
import com.foodorder.model.OrderStatusLog;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TrackingRepository {

    private OrderStatusLog mapLog(ResultSet rs) throws SQLException {
        OrderStatusLog log = new OrderStatusLog();
        log.setId(rs.getInt("id"));
        log.setOrderId(rs.getInt("order_id"));
        log.setStatus(rs.getString("status"));
        log.setUpdatedBy(rs.getString("updated_by"));
        log.setNote(rs.getString("note"));
        log.setUpdatedAt(rs.getString("updated_at"));
        return log;
    }

    private OrderNotification mapNotification(ResultSet rs) throws SQLException {
        OrderNotification notification = new OrderNotification();
        notification.setId(rs.getInt("id"));
        notification.setOrderId(rs.getInt("order_id"));
        notification.setCustomerId(rs.getInt("customer_id"));
        notification.setMessage(rs.getString("message"));
        notification.setRead(rs.getBoolean("is_read"));
        notification.setCreatedAt(rs.getString("created_at"));
        return notification;
    }

    public void createStatusLog(int orderId, String status, String updatedBy, String note) throws SQLException {
        String sql = "INSERT INTO order_status_log (order_id, status, updated_by, note) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            stmt.setString(2, status);
            stmt.setString(3, updatedBy);
            stmt.setString(4, note);
            stmt.executeUpdate();
        }
    }

    public List<OrderStatusLog> findHistory(int orderId) throws SQLException {
        List<OrderStatusLog> history = new ArrayList<>();
        String sql = "SELECT * FROM order_status_log WHERE order_id = ? ORDER BY updated_at ASC, id ASC";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    history.add(mapLog(rs));
                }
            }
        }
        return history;
    }

    public void createNotification(int orderId, int customerId, String message) throws SQLException {
        String sql = "INSERT INTO order_notifications (order_id, customer_id, message) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            stmt.setInt(2, customerId);
            stmt.setString(3, message);
            stmt.executeUpdate();
        }
    }

    public List<OrderNotification> findNotifications(int customerId) throws SQLException {
        List<OrderNotification> notifications = new ArrayList<>();
        String sql = "SELECT * FROM order_notifications WHERE customer_id = ? ORDER BY created_at DESC LIMIT 20";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, customerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    notifications.add(mapNotification(rs));
                }
            }
        }
        return notifications;
    }

    public boolean markNotificationsRead(int customerId) throws SQLException {
        String sql = "UPDATE order_notifications SET is_read = TRUE WHERE customer_id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, customerId);
            return stmt.executeUpdate() >= 0;
        }
    }
}
