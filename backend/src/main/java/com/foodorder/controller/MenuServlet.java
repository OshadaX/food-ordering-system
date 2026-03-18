package com.foodorder.controller;

import com.foodorder.model.MenuItem;
import com.foodorder.service.MenuService;
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

public class MenuServlet extends HttpServlet {

    private MenuService menuService;

    @Override
    public void init() throws ServletException {
        menuService = new MenuService();
    }

    // ── helpers ──────────────────────────────────────────────────────
    private void sendResponse(HttpServletResponse response, int statusCode,
                              String status, String message) throws IOException {
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

    private void sendData(HttpServletResponse response,
                          int statusCode, Object data) throws IOException {
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

    // ── GET ──────────────────────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "/all";
        switch (action) {
            case "/all":      getAllItems(response);                    break;
            case "/item":     getItemById(request, response);          break;
            case "/category": getItemsByCategory(request, response);   break;
            default:          sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void getAllItems(HttpServletResponse response) throws IOException {
        List<MenuItem> items = menuService.getAllItems();
        if (items == null) sendResponse(response, 500, "error", "Failed to fetch menu items");
        else               sendData(response, 200, items);
    }

    private void getItemById(HttpServletRequest request,
                             HttpServletResponse response) throws IOException {
        String idParam = request.getParameter("id");
        if (idParam == null) { sendResponse(response, 400, "error", "Item ID is required"); return; }
        MenuItem item = menuService.getItemById(Integer.parseInt(idParam));
        if (item == null) sendResponse(response, 404, "error", "Menu item not found");
        else              sendData(response, 200, item);
    }

    private void getItemsByCategory(HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        String categoryIdParam = request.getParameter("categoryId");
        if (categoryIdParam == null) { sendResponse(response, 400, "error", "Category ID is required"); return; }
        List<MenuItem> items = menuService.getItemsByCategory(Integer.parseInt(categoryIdParam));
        if (items == null) sendResponse(response, 500, "error", "Failed to fetch items");
        else               sendData(response, 200, items);
    }

    // ── POST ─────────────────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/add": addItem(request, response); break;
            default:     sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void addItem(HttpServletRequest request,
                         HttpServletResponse response) throws IOException {
        MenuItem item = new Gson().fromJson(readBody(request), MenuItem.class);
        String[] result = menuService.addItem(item);
        sendResponse(response, result[0].equals("success") ? 201 : 400, result[0], result[1]);
    }

    // ── PUT ──────────────────────────────────────────────────────────
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/update": updateItem(request, response);        break;
            case "/toggle": toggleAvailability(request, response); break;
            default:        sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void updateItem(HttpServletRequest request,
                            HttpServletResponse response) throws IOException {
        MenuItem item = new Gson().fromJson(readBody(request), MenuItem.class);
        String[] result = menuService.updateItem(item);
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    private void toggleAvailability(HttpServletRequest request,
                                    HttpServletResponse response) throws IOException {
        String idParam     = request.getParameter("id");
        String statusParam = request.getParameter("status");
        if (idParam == null || statusParam == null) {
            sendResponse(response, 400, "error", "ID and status are required"); return;
        }
        String[] result = menuService.toggleAvailability(
                Integer.parseInt(idParam), Boolean.parseBoolean(statusParam));
        sendResponse(response, result[0].equals("success") ? 200 : 400, result[0], result[1]);
    }

    // ── DELETE ───────────────────────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getPathInfo();
        if (action == null) action = "";
        switch (action) {
            case "/delete": deleteItem(request, response); break;
            default:        sendResponse(response, 404, "error", "Endpoint not found");
        }
    }

    private void deleteItem(HttpServletRequest request,
                            HttpServletResponse response) throws IOException {
        String idParam = request.getParameter("id");
        if (idParam == null) { sendResponse(response, 400, "error", "Item ID is required"); return; }
        String[] result = menuService.deleteItem(Integer.parseInt(idParam));
        sendResponse(response, result[0].equals("success") ? 200 : 404, result[0], result[1]);
    }
}