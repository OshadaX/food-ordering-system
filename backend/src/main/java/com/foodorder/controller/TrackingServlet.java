package com.foodorder.controller;

import com.foodorder.model.Order;
import com.foodorder.service.TrackingService;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

public class TrackingServlet extends HttpServlet {
    private final transient TrackingService trackingService = new TrackingService();
    private final transient Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setJsonResponse(resp);

        String pathInfo = req.getPathInfo();
        try {
            if (pathInfo == null || "/".equals(pathInfo) || "/active".equals(pathInfo)) {
                gson.toJson(trackingService.getActiveOrders(), resp.getWriter());
                return;
            }

            long orderId = parseOrderId(pathInfo);
            gson.toJson(trackingService.getOrderTracking(orderId), resp.getWriter());
        } catch (IllegalArgumentException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to fetch order tracking details.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setJsonResponse(resp);

        try {
            JsonObject body = readBody(req);
            Order order = new Order();
            order.setOrderId(body.get("orderId").getAsLong());
            if (body.has("customerId") && !body.get("customerId").isJsonNull()) {
                order.setCustomerId(body.get("customerId").getAsLong());
            }
            if (body.has("customerName") && !body.get("customerName").isJsonNull()) {
                order.setCustomerName(body.get("customerName").getAsString());
            }

            String updatedBy = body.has("updatedBy") && !body.get("updatedBy").isJsonNull()
                    ? body.get("updatedBy").getAsString()
                    : "System";

            Order created = trackingService.createTrackingRecord(order, updatedBy);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            gson.toJson(created, resp.getWriter());
        } catch (IllegalArgumentException | NullPointerException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (JsonSyntaxException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload.");
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create tracking record.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setJsonResponse(resp);

        try {
            long orderId = parseOrderId(req.getPathInfo());
            JsonObject body = readBody(req);
            String status = body.get("status").getAsString();
            String updatedBy = body.has("updatedBy") && !body.get("updatedBy").isJsonNull()
                    ? body.get("updatedBy").getAsString()
                    : "Kitchen Staff";
            String note = body.has("note") && !body.get("note").isJsonNull()
                    ? body.get("note").getAsString()
                    : null;

            gson.toJson(trackingService.updateStatus(orderId, status, updatedBy, note), resp.getWriter());
        } catch (IllegalArgumentException | NullPointerException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (JsonSyntaxException e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload.");
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update order status.");
        }
    }

    private JsonObject readBody(HttpServletRequest req) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return gson.fromJson(builder.toString(), JsonObject.class);
    }

    private long parseOrderId(String pathInfo) {
        if (pathInfo == null || pathInfo.isBlank() || "/".equals(pathInfo)) {
            throw new IllegalArgumentException("Order ID is required.");
        }

        String trimmed = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
        return Long.parseLong(trimmed);
    }

    private void setJsonResponse(HttpServletResponse resp) {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
    }

    private void sendError(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        gson.toJson(Map.of("error", message), resp.getWriter());
    }
}
