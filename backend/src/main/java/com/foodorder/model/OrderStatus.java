package com.foodorder.model;

import com.google.gson.annotations.SerializedName;

public enum OrderStatus {
    @SerializedName("Received")
    RECEIVED("Received"),
    @SerializedName("Preparing")
    PREPARING("Preparing"),
    @SerializedName("Ready")
    READY("Ready"),
    @SerializedName("Out for Delivery")
    OUT_FOR_DELIVERY("Out for Delivery"),
    @SerializedName("Delivered")
    DELIVERED("Delivered"),
    @SerializedName("Cancelled")
    CANCELLED("Cancelled");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static OrderStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Order status is required.");
        }

        String normalized = value.trim()
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase();

        for (OrderStatus status : values()) {
            if (status.name().equals(normalized)
                    || status.displayName.replace(' ', '_').toUpperCase().equals(normalized)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Invalid order status: " + value);
    }
}
