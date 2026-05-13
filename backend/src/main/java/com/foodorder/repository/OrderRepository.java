package com.foodorder.repository;

import com.foodorder.model.Order;
import com.foodorder.model.OrderItem;
import com.foodorder.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class OrderRepository {

    private Order mapOrder(ResultSet rs) throws SQLException {
        Order order = new Order();
        order.setId(rs.getInt("id"));
        order.setCustomerId(rs.getInt("customer_id"));
        order.setCustomerName(rs.getString("customer_name"));
        order.setAddressId(rs.getInt("address_id"));
        order.setPromoCode(rs.getString("promo_code"));
        order.setDiscount(rs.getDouble("discount"));
        order.setTotalAmount(rs.getDouble("total_amount"));
        order.setStatus(rs.getString("status"));
        order.setArchived(rs.getBoolean("archived"));
        order.setCreatedAt(rs.getString("created_at"));
        return order;
    }

    private OrderItem mapItem(ResultSet rs) throws SQLException {
        OrderItem item = new OrderItem();
        item.setId(rs.getInt("id"));
        item.setOrderId(rs.getInt("order_id"));
        item.setMenuItemId(rs.getInt("menu_item_id"));
        item.setMenuItemName(rs.getString("menu_item_name"));
        item.setQuantity(rs.getInt("quantity"));
        item.setUnitPrice(rs.getDouble("unit_price"));
        return item;
    }

    public int create(Order order) throws SQLException {
        String orderSql = "INSERT INTO orders (customer_id, address_id, promo_code, discount, total_amount, status) "
                + "VALUES (?, ?, ?, ?, ?, 'Received')";
        String itemSql = "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getInstance().getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement orderStmt = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS)) {
                orderStmt.setInt(1, order.getCustomerId());
                if (order.getAddressId() > 0) {
                    orderStmt.setInt(2, order.getAddressId());
                } else {
                    orderStmt.setNull(2, Types.INTEGER);
                }
                orderStmt.setString(3, order.getPromoCode());
                orderStmt.setDouble(4, order.getDiscount());
                orderStmt.setDouble(5, order.getTotalAmount());
                orderStmt.executeUpdate();

                int orderId;
                try (ResultSet keys = orderStmt.getGeneratedKeys()) {
                    if (!keys.next()) {
                        conn.rollback();
                        throw new SQLException("Order ID was not generated");
                    }
                    orderId = keys.getInt(1);
                }

                try (PreparedStatement itemStmt = conn.prepareStatement(itemSql)) {
                    for (OrderItem item : order.getItems()) {
                        itemStmt.setInt(1, orderId);
                        itemStmt.setInt(2, item.getMenuItemId());
                        itemStmt.setInt(3, item.getQuantity());
                        itemStmt.setDouble(4, item.getUnitPrice());
                        itemStmt.addBatch();
                    }
                    itemStmt.executeBatch();
                }

                conn.commit();
                return orderId;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public Order findById(int id) throws SQLException {
        String sql = "SELECT o.*, c.name AS customer_name FROM orders o "
                + "JOIN customers c ON c.id = o.customer_id WHERE o.id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                Order order = mapOrder(rs);
                order.setItems(findItemsByOrderId(id));
                return order;
            }
        }
    }

    public List<Order> findByCustomerId(int customerId) throws SQLException {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT o.*, c.name AS customer_name FROM orders o "
                + "JOIN customers c ON c.id = o.customer_id "
                + "WHERE o.customer_id = ? AND o.archived = FALSE ORDER BY o.created_at DESC";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, customerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    orders.add(mapOrder(rs));
                }
            }
        }
        return orders;
    }

    public List<Order> findAll(boolean activeOnly) throws SQLException {
        List<Order> orders = new ArrayList<>();
        String filter = activeOnly
                ? "WHERE o.status NOT IN ('Delivered', 'Cancelled') AND o.archived = FALSE "
                : "WHERE o.archived = FALSE ";
        String sql = "SELECT o.*, c.name AS customer_name FROM orders o "
                + "JOIN customers c ON c.id = o.customer_id "
                + filter
                + "ORDER BY o.created_at DESC";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                orders.add(mapOrder(rs));
            }
        }
        return orders;
    }

    public List<OrderItem> findItemsByOrderId(int orderId) throws SQLException {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT oi.*, mi.name AS menu_item_name FROM order_items oi "
                + "JOIN menu_items mi ON mi.id = oi.menu_item_id WHERE oi.order_id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    items.add(mapItem(rs));
                }
            }
        }
        return items;
    }

    public boolean updateStatus(int orderId, String status) throws SQLException {
        String sql = "UPDATE orders SET status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, orderId);
            return stmt.executeUpdate() > 0;
        }
    }

    public boolean archive(int orderId) throws SQLException {
        String sql = "UPDATE orders SET archived = TRUE WHERE id = ?";
        try (Connection conn = DBConnection.getInstance().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, orderId);
            return stmt.executeUpdate() > 0;
        }
    }
}
