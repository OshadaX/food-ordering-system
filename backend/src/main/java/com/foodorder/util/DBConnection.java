package com.foodorder.util;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Properties;

public class DBConnection {

    private static DBConnection instance;
    private Connection connection;

    private DBConnection() {
        try {
            Properties props = new Properties();
            InputStream input = getClass().getClassLoader()
                    .getResourceAsStream("db.properties");
            props.load(input);

            Class.forName(props.getProperty("db.driver"));
            connection = DriverManager.getConnection(
                    props.getProperty("db.url"),
                    props.getProperty("db.username"),
                    props.getProperty("db.password")
            );
            runSchemaScriptIfPresent();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("DB connection failed: " + e.getMessage());
        }
    }

    // Singleton pattern — one connection shared across the app
    public static synchronized DBConnection getInstance() {
        if (instance == null || isConnectionClosed()) {
            instance = new DBConnection();
        }
        return instance;
    }

    public Connection getConnection() {
        return connection;
    }

    private void runSchemaScriptIfPresent() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("schema.sql")) {
            if (input == null) {
                return;
            }

            String script = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            String[] statements = script.split(";\\s*(\\r?\\n|$)");
            try (Statement statement = connection.createStatement()) {
                for (String sql : statements) {
                    String trimmed = sql.trim();
                    if (trimmed.isEmpty()) {
                        continue;
                    }
                    statement.execute(trimmed);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize database schema: " + e.getMessage(), e);
        }
    }

    private static boolean isConnectionClosed() {
        try {
            return instance.connection == null || instance.connection.isClosed();
        } catch (Exception e) {
            return true;
        }
    }
}
