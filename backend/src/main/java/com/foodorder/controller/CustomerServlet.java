package com.foodorder.controller;

import com.foodorder.model.Customer;
import com.foodorder.service.CustomerService;
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

public class CustomerServlet extends HttpServlet {

    private CustomerService customerService;

    @Override
    public void init() throws ServletException {
        customerService = new CustomerService();
    }

    private void sendResponse(HttpServletResponse response, int statusCode,
                              String status, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        JsonObject json = new JsonObject();
        json.addProperty("status",  status);
        json.addProperty("message", message);
        PrintWriter out = response.getWriter();
        out.print(json.toString());
        out.flush();
    }

    private void sendData(HttpServletResponse response, int statusCode,
                          Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        PrintWriter out = response.getWriter();
        out.print(new Gson().toJson(data));
        out.flush();
    }

    private String readBody(HttpServletRequest request) throws IOException {
        BufferedReader reader = request.getReader();
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) body.append(line);
        return body.toString();
    }

    private int getAuthenticatedCustomerId(HttpServletRequest request,
                                           HttpServletResponse response) throws IOException {
        String authHeader = request.getHeader("Authorization");
        String token = JwtUtil.extractToken(authHeader);
        if (token == null || !JwtUtil.validateToken(token)) {
            sendResponse(response, 401, "error", "Unauthorized — please login");
            return -1;
        }
        return JwtUtil.getCustomerId(token);
    }

    // ── POST ─────────────────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/register": register(request, response); break;
            case "/login":    login(request, response);    break;
            default: sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void register(HttpServletRequest request,
                          HttpServletResponse response) throws IOException {
        Customer customer = new Gson().fromJson(readBody(request), Customer.class);
        String[] result = customerService.register(customer);
        sendResponse(response, result[0].equals("success") ? 201 : 400, result[0], result[1]);
    }

    private void login(HttpServletRequest request,
                       HttpServletResponse response) throws IOException {
        JsonObject body  = new Gson().fromJson(readBody(request), JsonObject.class);
        String email     = body.has("email")    ? body.get("email").getAsString()    : "";
        String password  = body.has("password") ? body.get("password").getAsString() : "";
        String[] result  = customerService.login(email, password);
        if (result[0].equals("success")) {
            JsonObject json = new JsonObject();
            json.addProperty("status",  result[0]);
            json.addProperty("message", result[1]);
            json.addProperty("token",   result[2]);
            json.addProperty("name",    JwtUtil.getCustomerName(result[2]));
            json.addProperty("role",    JwtUtil.getCustomerRole(result[2]));
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(200);
            PrintWriter out = response.getWriter();
            out.print(json.toString());
            out.flush();
        } else {
            sendResponse(response, 401, result[0], result[1]);
        }
    }

    // ── GET ──────────────────────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/profile": getProfile(request, response); break;
            default: sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void getProfile(HttpServletRequest request,
                             HttpServletResponse response) throws IOException {
        int customerId = getAuthenticatedCustomerId(request, response);
        if (customerId == -1) return;
        Customer customer = customerService.getProfile(customerId);
        if (customer == null) {
            sendResponse(response, 404, "error", "Customer not found");
            return;
        }
        // Build a safe view (no password hash) and send as JSON
        JsonObject safe = new JsonObject();
        safe.addProperty("id",        customer.getId());
        safe.addProperty("name",      customer.getName());
        safe.addProperty("email",     customer.getEmail());
        safe.addProperty("phone",     customer.getPhone());
        safe.addProperty("createdAt", customer.getCreatedAt());
        sendData(response, 200, safe);
    }

    // ── PUT ──────────────────────────────────────────────────────────
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/update":   updateProfile(request, response);  break;
            case "/password": changePassword(request, response); break;
            default: sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void updateProfile(HttpServletRequest request,
                               HttpServletResponse response) throws IOException {
        int customerId = getAuthenticatedCustomerId(request, response);
        if (customerId == -1) return;
        JsonObject body = new Gson().fromJson(readBody(request), JsonObject.class);
        String name  = body.has("name")  ? body.get("name").getAsString()  : "";
        String phone = body.has("phone") ? body.get("phone").getAsString() : "";
        String[] result = customerService.updateProfile(customerId, name, phone);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    private void changePassword(HttpServletRequest request,
                                HttpServletResponse response) throws IOException {
        int customerId = getAuthenticatedCustomerId(request, response);
        if (customerId == -1) return;
        JsonObject body = new Gson().fromJson(readBody(request), JsonObject.class);
        String currentPassword = body.has("currentPassword") ? body.get("currentPassword").getAsString() : "";
        String newPassword     = body.has("newPassword")     ? body.get("newPassword").getAsString()     : "";
        String[] result = customerService.changePassword(customerId, currentPassword, newPassword);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    // ── DELETE ───────────────────────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/delete": deleteAccount(request, response); break;
            default: sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void deleteAccount(HttpServletRequest request,
                               HttpServletResponse response) throws IOException {
        int customerId = getAuthenticatedCustomerId(request, response);
        if (customerId == -1) return;
        String[] result = customerService.deleteAccount(customerId);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }
}