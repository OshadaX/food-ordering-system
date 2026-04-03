package com.foodorder.controller;

import com.foodorder.model.Category;
import com.foodorder.service.CategoryService;
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
import java.util.List;

public class CategoryServlet extends HttpServlet {

    private CategoryService categoryService;

    @Override
    public void init() throws ServletException {
        categoryService = new CategoryService();
    }

    private boolean isAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authHeader = request.getHeader("Authorization");
        String token = JwtUtil.extractToken(authHeader);

        if (token == null || !JwtUtil.validateToken(token)) {
            sendResponse(response, 401, "error", "Unauthorized — please login");
            return false;
        }

        String role = JwtUtil.getCustomerRole(token);
        if (!"admin".equals(role)) {
            sendResponse(response, 403, "error", "Forbidden — admin access required");
            return false;
        }

        return true;
    }

    private void sendResponse(HttpServletResponse response, int statusCode, String status, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);
        JsonObject json = new JsonObject();
        json.addProperty("status", status);
        json.addProperty("message", message);
        PrintWriter out = response.getWriter();
        out.print(json.toString());
        out.flush();
    }

    private void sendData(HttpServletResponse response, int statusCode, Object data) throws IOException {
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

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "/all";
        switch (action) {
            case "/all":
                getAllCategories(response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void getAllCategories(HttpServletResponse response) throws IOException {
        List<Category> categories = categoryService.getAllCategories();
        if (categories == null) sendResponse(response, 500, "error", "Failed to fetch categories");
        else sendData(response, 200, categories);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/add":
                addCategory(request, response);
                break;
            default:
                sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void addCategory(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAdmin(request, response)) return;

        Category category = new Gson().fromJson(readBody(request), Category.class);
        String[] result = categoryService.addCategory(category);
        sendResponse(response, result[0].equals("success") ? 201 : 400, result[0], result[1]);
    }
}
