package com.foodorder.service;

import com.foodorder.model.Order;
import com.foodorder.model.OrderNotification;
import com.foodorder.model.OrderStatus;
import com.foodorder.model.OrderStatusLog;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.TrackingRepository;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TrackingService {
    private final OrderRepository orderRepository = new OrderRepository();
    private final TrackingRepository trackingRepository = new TrackingRepository();

    public List<Order> getCustomerOrders(int customerId) {
        try {
            return orderRepository.findByCustomerId(customerId);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Order> getActiveOrders() {
        try {
            return orderRepository.findAll(true);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Order> getAllOrders() {
        try {
            return orderRepository.findAll(false);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public Map<String, Object> getTrackingDetails(int orderId) {
        try {
            Order order = orderRepository.findById(orderId);
            if (order == null) {
                return null;
            }
            Map<String, Object> details = new HashMap<>();
            details.put("order", order);
            details.put("history", trackingRepository.findHistory(orderId));
            details.put("statuses", OrderStatus.normalFlow().stream().map(OrderStatus::getLabel).toArray());
            return details;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public String[] updateStatus(int orderId, String nextStatusValue, String updatedBy, String note) {
        try {
            Order order = orderRepository.findById(orderId);
            if (order == null) {
                return new String[]{"error", "Order not found"};
            }

            OrderStatus current = OrderStatus.fromLabel(order.getStatus());
            OrderStatus next = OrderStatus.fromLabel(nextStatusValue);
            if (!isValidTransition(current, next)) {
                return new String[]{"error", "Invalid status transition from " + current.getLabel() + " to " + next.getLabel()};
            }

            orderRepository.updateStatus(orderId, next.getLabel());
            trackingRepository.createStatusLog(orderId, next.getLabel(), updatedBy, note);
            trackingRepository.createNotification(orderId, order.getCustomerId(), notificationMessage(next));
            return new String[]{"success", "Order status updated to " + next.getLabel()};
        } catch (IllegalArgumentException e) {
            return new String[]{"error", e.getMessage()};
        } catch (SQLException e) {
            e.printStackTrace();
            return new String[]{"error", "Failed to update order status: " + e.getMessage()};
        }
    }

    public String[] cancelOrder(int orderId, String updatedBy, String note) {
        try {
            Order order = orderRepository.findById(orderId);
            if (order == null) {
                return new String[]{"error", "Order not found"};
            }
            OrderStatus current = OrderStatus.fromLabel(order.getStatus());
            if (current.isTerminal()) {
                return new String[]{"error", "Completed or cancelled orders cannot be cancelled"};
            }
            orderRepository.updateStatus(orderId, OrderStatus.CANCELLED.getLabel());
            trackingRepository.createStatusLog(orderId, OrderStatus.CANCELLED.getLabel(), updatedBy, note);
            trackingRepository.createNotification(orderId, order.getCustomerId(), "Your order has been cancelled.");
            return new String[]{"success", "Order cancelled successfully"};
        } catch (SQLException e) {
            e.printStackTrace();
            return new String[]{"error", "Failed to cancel order: " + e.getMessage()};
        }
    }

    public String[] archiveOrder(int orderId) {
        try {
            Order order = orderRepository.findById(orderId);
            if (order == null) {
                return new String[]{"error", "Order not found"};
            }
            OrderStatus status = OrderStatus.fromLabel(order.getStatus());
            if (!status.isTerminal()) {
                return new String[]{"error", "Only delivered or cancelled orders can be archived"};
            }
            orderRepository.archive(orderId);
            return new String[]{"success", "Order removed from active tracking"};
        } catch (SQLException e) {
            e.printStackTrace();
            return new String[]{"error", "Failed to archive order: " + e.getMessage()};
        }
    }

    public List<OrderStatusLog> getHistory(int orderId) {
        try {
            return trackingRepository.findHistory(orderId);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<OrderNotification> getNotifications(int customerId) {
        try {
            return trackingRepository.findNotifications(customerId);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public boolean markNotificationsRead(int customerId) {
        try {
            return trackingRepository.markNotificationsRead(customerId);
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }
        if (current.isTerminal()) {
            return false;
        }
        if (next == OrderStatus.CANCELLED) {
            return true;
        }
        List<OrderStatus> flow = OrderStatus.normalFlow();
        return flow.indexOf(next) == flow.indexOf(current) + 1;
    }

    private String notificationMessage(OrderStatus status) {
        switch (status) {
            case PREPARING:
                return "Your order is now being prepared.";
            case READY:
                return "Your order is ready.";
            case OUT_FOR_DELIVERY:
                return "Your order is out for delivery.";
            case DELIVERED:
                return "Your order has been delivered successfully.";
            case CANCELLED:
                return "Your order has been cancelled.";
            default:
                return "Your order status changed to " + status.getLabel() + ".";
        }
    }
}
