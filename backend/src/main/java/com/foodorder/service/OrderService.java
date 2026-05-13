package com.foodorder.service;

import com.foodorder.model.Order;
import com.foodorder.model.OrderItem;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.TrackingRepository;

import java.sql.SQLException;
import java.util.List;

public class OrderService {
    private final OrderRepository orderRepository = new OrderRepository();
    private final TrackingRepository trackingRepository = new TrackingRepository();

    public String[] placeOrder(Order order, String customerName) {
        try {
            if (order.getCustomerId() <= 0) {
                return new String[]{"error", "Customer is required"};
            }
            if (order.getItems() == null || order.getItems().isEmpty()) {
                return new String[]{"error", "Order must contain at least one item"};
            }
            double computedTotal = 0;
            for (OrderItem item : order.getItems()) {
                if (item.getMenuItemId() <= 0 || item.getQuantity() <= 0 || item.getUnitPrice() < 0) {
                    return new String[]{"error", "Invalid order item"};
                }
                computedTotal += item.getQuantity() * item.getUnitPrice();
            }
            if (order.getTotalAmount() <= 0) {
                order.setTotalAmount(Math.max(0, computedTotal - order.getDiscount()));
            }

            int orderId = orderRepository.create(order);
            trackingRepository.createStatusLog(orderId, "Received", customerName, "Order placed");
            trackingRepository.createNotification(
                    orderId,
                    order.getCustomerId(),
                    "Your order has been received.");
            return new String[]{"success", "Order placed successfully", String.valueOf(orderId)};
        } catch (SQLException e) {
            e.printStackTrace();
            return new String[]{"error", "Failed to place order: " + e.getMessage()};
        }
    }

    public List<Order> getCustomerOrders(int customerId) {
        try {
            return orderRepository.findByCustomerId(customerId);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public Order getOrder(int orderId) {
        try {
            return orderRepository.findById(orderId);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
}
