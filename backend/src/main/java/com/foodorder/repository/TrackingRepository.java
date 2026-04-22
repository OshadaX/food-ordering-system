package com.foodorder.repository;

import com.foodorder.model.Order;
import com.foodorder.model.OrderHistoryEntry;
import com.foodorder.model.OrderStatus;
import com.foodorder.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TrackingRepository {
    private final Connection connection;

    public TrackingRepository() {
        this.connection = DBConnection.getInstance().getConnection();
        initializeTables();
    }

    private void initializeTables() {
        String createOrders = """
                CREATE TABLE IF NOT EXISTS order_tracking (
                    order_id BIGINT PRIMARY KEY,
                    customer_id BIGINT DEFAULT 0,
                    customer_name VARCHAR(120),
                    current_status VARCHAR(40) NOT NULL,
                    archived BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """;

        String createHistory = """
                CREATE TABLE IF NOT EXISTS order_status_history (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    order_id BIGINT NOT NULL,
                    status VARCHAR(40) NOT NULL,
                    updated_by VARCHAR(120),
                    note VARCHAR(255),
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_tracking_history_order
                        FOREIGN KEY (order_id) REFERENCES order_tracking(order_id)
                        ON DELETE CASCADE
                )
                """;

        try (Statement statement = connection.createStatement()) {
            statement.execute(createOrders);
            statement.execute(createHistory);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to initialize tracking tables.", e);
        }
    }

    public Order createOrder(Order order, String updatedBy, String note) {
        String insertOrder = """
                INSERT INTO order_tracking(order_id, customer_id, customer_name, current_status, archived)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (PreparedStatement statement = connection.prepareStatement(insertOrder)) {
            statement.setLong(1, order.getOrderId());
            statement.setLong(2, order.getCustomerId());
            statement.setString(3, order.getCustomerName());
            statement.setString(4, order.getCurrentStatus().name());
            statement.setBoolean(5, order.isArchived());
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create tracking record.", e);
        }

        insertHistory(order.getOrderId(), order.getCurrentStatus(), updatedBy, note);
        return findOrderById(order.getOrderId())
                .orElseThrow(() -> new RuntimeException("Created order could not be loaded."));
    }

    public Optional<Order> findOrderById(long orderId) {
        String selectOrder = """
                SELECT order_id, customer_id, customer_name, current_status, archived, created_at, updated_at
                FROM order_tracking
                WHERE order_id = ?
                """;

        try (PreparedStatement statement = connection.prepareStatement(selectOrder)) {
            statement.setLong(1, orderId);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return Optional.empty();
                }

                Order order = mapOrder(resultSet);
                order.getHistory().addAll(findHistoryByOrderId(orderId));
                return Optional.of(order);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load order tracking record.", e);
        }
    }

    public List<Order> findAllActiveOrders() {
        String selectOrders = """
                SELECT order_id, customer_id, customer_name, current_status, archived, created_at, updated_at
                FROM order_tracking
                WHERE archived = FALSE AND current_status <> 'DELIVERED' AND current_status <> 'CANCELLED'
                ORDER BY updated_at DESC
                """;

        List<Order> orders = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(selectOrders);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                orders.add(mapOrder(resultSet));
            }
            return orders;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load active orders.", e);
        }
    }

    public Order updateOrderStatus(long orderId, OrderStatus status, String updatedBy, String note, boolean archived) {
        String updateOrder = """
                UPDATE order_tracking
                SET current_status = ?, archived = ?, updated_at = CURRENT_TIMESTAMP
                WHERE order_id = ?
                """;

        try (PreparedStatement statement = connection.prepareStatement(updateOrder)) {
            statement.setString(1, status.name());
            statement.setBoolean(2, archived);
            statement.setLong(3, orderId);

            int rows = statement.executeUpdate();
            if (rows == 0) {
                throw new IllegalArgumentException("Order not found.");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to update order status.", e);
        }

        insertHistory(orderId, status, updatedBy, note);
        return findOrderById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));
    }

    public List<OrderHistoryEntry> findHistoryByOrderId(long orderId) {
        String selectHistory = """
                SELECT id, order_id, status, updated_by, note, updated_at
                FROM order_status_history
                WHERE order_id = ?
                ORDER BY updated_at ASC, id ASC
                """;

        List<OrderHistoryEntry> history = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(selectHistory)) {
            statement.setLong(1, orderId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    OrderHistoryEntry entry = new OrderHistoryEntry();
                    entry.setId(resultSet.getLong("id"));
                    entry.setOrderId(resultSet.getLong("order_id"));
                    entry.setStatus(OrderStatus.valueOf(resultSet.getString("status")));
                    entry.setUpdatedBy(resultSet.getString("updated_by"));
                    entry.setNote(resultSet.getString("note"));
                    entry.setUpdatedAt(resultSet.getTimestamp("updated_at") == null
                            ? null
                            : resultSet.getTimestamp("updated_at").toInstant().toString());
                    history.add(entry);
                }
            }
            return history;
        } catch (SQLException e) {
            throw new RuntimeException("Failed to load status history.", e);
        }
    }

    private void insertHistory(long orderId, OrderStatus status, String updatedBy, String note) {
        String insertHistory = """
                INSERT INTO order_status_history(order_id, status, updated_by, note)
                VALUES (?, ?, ?, ?)
                """;

        try (PreparedStatement statement = connection.prepareStatement(insertHistory)) {
            statement.setLong(1, orderId);
            statement.setString(2, status.name());
            statement.setString(3, updatedBy);
            if (note == null || note.isBlank()) {
                statement.setNull(4, Types.VARCHAR);
            } else {
                statement.setString(4, note.trim());
            }
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Failed to save status history.", e);
        }
    }

    private Order mapOrder(ResultSet resultSet) throws SQLException {
        Order order = new Order();
        order.setOrderId(resultSet.getLong("order_id"));
        order.setCustomerId(resultSet.getLong("customer_id"));
        order.setCustomerName(resultSet.getString("customer_name"));
        order.setCurrentStatus(OrderStatus.valueOf(resultSet.getString("current_status")));
        order.setArchived(resultSet.getBoolean("archived"));
        order.setCreatedAt(resultSet.getTimestamp("created_at") == null
                ? null
                : resultSet.getTimestamp("created_at").toInstant().toString());
        order.setUpdatedAt(resultSet.getTimestamp("updated_at") == null
                ? null
                : resultSet.getTimestamp("updated_at").toInstant().toString());
        return order;
    }
}
