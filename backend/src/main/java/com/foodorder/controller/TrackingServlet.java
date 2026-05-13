package com.foodorder.controller;

import com.foodorder.model.Order;
import com.foodorder.service.TrackingService;
import com.foodorder.util.JwtUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

public class TrackingServlet extends HttpServlet {
    private TrackingService trackingService;

    @Override
    public void init() throws ServletException {
        trackingService = new TrackingService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/my-orders":
                getMyOrders(request, response);
                break;
            case "/status":
                getStatus(request, response);
                break;
            case "/history":
                getHistory(request, response);
                break;
            case "/active":
                getActiveOrders(request, response);
                break;
            case "/all":
                getAllOrders(request, response);
                break;
            case "/notifications":
                getNotifications(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/status":
                updateStatus(request, response);
                break;
            case "/cancel":
                cancelOrder(request, response);
                break;
            case "/notifications/read":
                markNotificationsRead(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/archive":
                archiveOrder(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void getMyOrders(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        sendData(response, 200, trackingService.getCustomerOrders(JwtUtil.getCustomerId(token)));
    }

    private void getStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        int orderId = parseId(request.getParameter("orderId"));
        if (orderId <= 0) {
            sendResponse(response, 400, "error", "Order ID is required");
            return;
        }
        Map<String, Object> details = trackingService.getTrackingDetails(orderId);
        if (details == null) {
            sendResponse(response, 404, "error", "Order not found");
            return;
        }
        Order order = (Order) details.get("order");
        if (!isStaffRole(JwtUtil.getCustomerRole(token)) && order.getCustomerId() != JwtUtil.getCustomerId(token)) {
            sendResponse(response, 403, "error", "You cannot track this order");
            return;
        }
        sendData(response, 200, details);
    }

    private void getHistory(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        int orderId = parseId(request.getParameter("orderId"));
        if (orderId <= 0) {
            sendResponse(response, 400, "error", "Order ID is required");
            return;
        }
        Map<String, Object> details = trackingService.getTrackingDetails(orderId);
        if (details == null) {
            sendResponse(response, 404, "error", "Order not found");
            return;
        }
        Order order = (Order) details.get("order");
        if (!isStaffRole(JwtUtil.getCustomerRole(token)) && order.getCustomerId() != JwtUtil.getCustomerId(token)) {
            sendResponse(response, 403, "error", "You cannot view this history");
            return;
        }
        sendData(response, 200, trackingService.getHistory(orderId));
    }

    private void getActiveOrders(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireStaff(request, response)) return;
        sendData(response, 200, trackingService.getActiveOrders());
    }

    private void getAllOrders(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireStaff(request, response)) return;
        sendData(response, 200, trackingService.getAllOrders());
    }

    private void getNotifications(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        sendData(response, 200, trackingService.getNotifications(JwtUtil.getCustomerId(token)));
    }

    private void updateStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireStaffToken(request, response);
        if (token == null) return;
        JsonObject body = new Gson().fromJson(readBody(request), JsonObject.class);
        int orderId = body.has("orderId") ? body.get("orderId").getAsInt() : -1;
        String status = body.has("status") ? body.get("status").getAsString() : "";
        String note = body.has("note") ? body.get("note").getAsString() : "";
        String[] result = trackingService.updateStatus(orderId, status, JwtUtil.getCustomerName(token), note);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    private void cancelOrder(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireStaffToken(request, response);
        if (token == null) return;
        JsonObject body = new Gson().fromJson(readBody(request), JsonObject.class);
        int orderId = body.has("orderId") ? body.get("orderId").getAsInt() : -1;
        String note = body.has("note") ? body.get("note").getAsString() : "Cancelled by staff";
        String[] result = trackingService.cancelOrder(orderId, JwtUtil.getCustomerName(token), note);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    private void archiveOrder(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!requireAdmin(request, response)) return;
        int orderId = parseId(request.getParameter("orderId"));
        String[] result = trackingService.archiveOrder(orderId);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    private void markNotificationsRead(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        boolean ok = trackingService.markNotificationsRead(JwtUtil.getCustomerId(token));
        sendResponse(response, ok ? 200 : 500, ok ? "success" : "error",
                ok ? "Notifications marked as read" : "Failed to update notifications");
    }

    private boolean requireAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return requireAdminToken(request, response) != null;
    }

    private boolean requireStaff(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return requireStaffToken(request, response) != null;
    }

    private String requireAdminToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return null;
        if (!"admin".equals(JwtUtil.getCustomerRole(token))) {
            sendResponse(response, 403, "error", "Admin access required");
            return null;
        }
        return token;
    }

    private String requireStaffToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return null;
        String role = JwtUtil.getCustomerRole(token);
        if (!isStaffRole(role)) {
            sendResponse(response, 403, "error", "Staff access required");
            return null;
        }
        return token;
    }

    private boolean isStaffRole(String role) {
        return "admin".equals(role) || "kitchen".equals(role);
    }

    private String requireToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = JwtUtil.extractToken(request.getHeader("Authorization"));
        if (token == null || !JwtUtil.validateToken(token)) {
            sendResponse(response, 401, "error", "Unauthorized - please login");
            return null;
        }
        return token;
    }

    private int parseId(String value) {
        try {
            return value == null ? -1 : Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private String readBody(HttpServletRequest request) throws IOException {
        BufferedReader reader = request.getReader();
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) body.append(line);
        return body.toString();
    }

    private void sendResponse(HttpServletResponse response, int statusCode, String status, String message)
            throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("status", status);
        json.addProperty("message", message);
        sendJson(response, statusCode, json);
    }

    private void sendData(HttpServletResponse response, int statusCode, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(data));
        out.flush();
    }

    private void sendJson(HttpServletResponse response, int statusCode, JsonObject json) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        PrintWriter out = response.getWriter();
        out.print(json.toString());
        out.flush();
    }
}
