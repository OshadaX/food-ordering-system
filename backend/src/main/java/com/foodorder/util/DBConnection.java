package com.foodorder.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
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

    private static boolean isConnectionClosed() {
        try {
            return instance.connection == null || instance.connection.isClosed();
        } catch (Exception e) {
            return true;
        }
    }
}