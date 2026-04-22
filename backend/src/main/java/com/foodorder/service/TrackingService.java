package com.foodorder.service;

import com.foodorder.model.Order;
import com.foodorder.model.OrderStatus;
import com.foodorder.repository.TrackingRepository;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

public class TrackingService {
    private final TrackingRepository trackingRepository = new TrackingRepository();
    private final Map<OrderStatus, List<OrderStatus>> allowedTransitions = new EnumMap<>(OrderStatus.class);

    public TrackingService() {
        allowedTransitions.put(OrderStatus.RECEIVED, List.of(OrderStatus.PREPARING, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.PREPARING, List.of(OrderStatus.READY, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.READY, List.of(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.OUT_FOR_DELIVERY, List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED));
        allowedTransitions.put(OrderStatus.DELIVERED, List.of());
        allowedTransitions.put(OrderStatus.CANCELLED, List.of());
    }

    public Order createTrackingRecord(Order order, String updatedBy) {
        if (order.getOrderId() <= 0) {
            throw new IllegalArgumentException("Order ID is required.");
        }

        order.setCurrentStatus(OrderStatus.RECEIVED);
        order.setArchived(false);
        return trackingRepository.createOrder(order, updatedBy, "Order received.");
    }

    public Order getOrderTracking(long orderId) {
        return trackingRepository.findOrderById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found."));
    }

    public List<Order> getActiveOrders() {
        return trackingRepository.findAllActiveOrders();
    }

    public Order updateStatus(long orderId, String nextStatusValue, String updatedBy, String note) {
        Order order = getOrderTracking(orderId);
        OrderStatus nextStatus = OrderStatus.fromValue(nextStatusValue);
        validateTransition(order.getCurrentStatus(), nextStatus);
        boolean archive = nextStatus == OrderStatus.DELIVERED || nextStatus == OrderStatus.CANCELLED;

        return trackingRepository.updateOrderStatus(orderId, nextStatus, normalizeActor(updatedBy), note, archive);
    }

    private void validateTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == nextStatus) {
            throw new IllegalArgumentException("Order is already in status " + currentStatus.getDisplayName() + ".");
        }

        List<OrderStatus> nextStates = allowedTransitions.getOrDefault(currentStatus, List.of());
        if (!nextStates.contains(nextStatus)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from "
                            + currentStatus.getDisplayName()
                            + " to "
                            + nextStatus.getDisplayName()
                            + "."
            );
        }
    }

    private String normalizeActor(String updatedBy) {
        return updatedBy == null || updatedBy.isBlank() ? "System" : updatedBy.trim();
    }
}
