package com.foodorder.util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

/**
 * DBConnection — creates a fresh JDBC connection on every call to getConnection().
 *
 * WHY: All repositories use try-with-resources, which closes the connection
 * after each query. Storing a single shared Connection meant it was closed
 * after the first request and every subsequent call got a dead connection → 500.
 * The singleton now only holds the credentials; the connection itself is
 * opened fresh per-request and closed by the caller's try-with-resources.
 */
public class DBConnection {

    private static DBConnection instance;

    private String url;
    private String username;
    private String password;

    private DBConnection() {
        try {
            Properties props = new Properties();
            InputStream input = getClass().getClassLoader()
                    .getResourceAsStream("db.properties");
            props.load(input);

            Class.forName(props.getProperty("db.driver"));
            this.url      = props.getProperty("db.url");
            this.username = props.getProperty("db.username");
            this.password = props.getProperty("db.password");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("DB init failed: " + e.getMessage());
        }
    }

    /** Singleton — only the credentials are shared, not the connection. */
    public static synchronized DBConnection getInstance() {
        if (instance == null) {
            instance = new DBConnection();
        }
        return instance;
    }

    /**
     * Returns a NEW connection each time.
     * Callers are responsible for closing it (use try-with-resources).
     */
    public Connection getConnection() throws java.sql.SQLException {
        return DriverManager.getConnection(url, username, password);
    }
}