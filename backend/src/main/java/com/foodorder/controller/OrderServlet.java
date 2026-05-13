package com.foodorder.controller;

import com.foodorder.model.Order;
import com.foodorder.service.OrderService;
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

public class OrderServlet extends HttpServlet {
    private OrderService orderService;

    @Override
    public void init() throws ServletException {
        orderService = new OrderService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/place":
                placeOrder(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/my":
                getMyOrders(request, response);
                break;
            case "/item":
                getOrder(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void placeOrder(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;

        Order order = new Gson().fromJson(readBody(request), Order.class);
        order.setCustomerId(JwtUtil.getCustomerId(token));
        String[] result = orderService.placeOrder(order, JwtUtil.getCustomerName(token));

        JsonObject json = new JsonObject();
        json.addProperty("status", result[0]);
        json.addProperty("message", result[1]);
        if (result.length > 2) {
            json.addProperty("orderId", Integer.parseInt(result[2]));
        }
        sendJson(response, result[0].equals("success") ? 201 : 400, json);
    }

    private void getMyOrders(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        sendData(response, 200, orderService.getCustomerOrders(JwtUtil.getCustomerId(token)));
    }

    private void getOrder(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String token = requireToken(request, response);
        if (token == null) return;
        int orderId = parseId(request.getParameter("id"));
        if (orderId <= 0) {
            sendResponse(response, 400, "error", "Order ID is required");
            return;
        }
        Order order = orderService.getOrder(orderId);
        if (order == null) {
            sendResponse(response, 404, "error", "Order not found");
            return;
        }
        if (!"admin".equals(JwtUtil.getCustomerRole(token)) && order.getCustomerId() != JwtUtil.getCustomerId(token)) {
            sendResponse(response, 403, "error", "You cannot view this order");
            return;
        }
        sendData(response, 200, order);
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
