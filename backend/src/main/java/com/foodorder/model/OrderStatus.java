package com.foodorder.model;

import java.util.Arrays;
import java.util.List;

public enum OrderStatus {
    RECEIVED("Received"),
    PREPARING("Preparing"),
    READY("Ready"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean isTerminal() {
        return this == DELIVERED || this == CANCELLED;
    }

    public static OrderStatus fromLabel(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Status is required");
        }
        for (OrderStatus status : values()) {
            if (status.label.equalsIgnoreCase(value.trim())
                    || status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unsupported order status: " + value);
    }

    public static List<OrderStatus> normalFlow() {
        return Arrays.asList(RECEIVED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED);
    }
}
