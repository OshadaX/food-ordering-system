package com.foodorder.util;

import com.foodorder.model.Customer;
import com.foodorder.repository.CustomerRepository;
import org.mindrot.jbcrypt.BCrypt;
import java.sql.SQLException;

public class DatabaseSeeder {
    public static void main(String[] args) {
        CustomerRepository repo = new CustomerRepository();
        
        // Ensure Admin
        ensureUserExists(repo, "System Admin", "admin@gmail.com", "123456", "admin");

        // Ensure kitchen staff
        ensureUserExists(repo, "Kitchen Staff", "kitchen@gmail.com", "123456", "kitchen");
        
        // Ensure regular customer
        ensureUserExists(repo, "Test Customer", "custmer@gmail.com", "1234", "customer");
    }

    private static void ensureUserExists(CustomerRepository repo, String name, String email, String password, String role) {
        try {
            if (repo.emailExists(email)) {
                System.out.println("User " + email + " already exists. Ensuring role is " + role + "...");
                try (java.sql.Connection conn = DBConnection.getInstance().getConnection();
                     java.sql.PreparedStatement stmt = conn.prepareStatement(
                         "UPDATE customers SET role = ? WHERE email = ?")) {
                    stmt.setString(1, role);
                    stmt.setString(2, email);
                    stmt.executeUpdate();
                }
                System.out.println("User " + email + " role/check complete.");
            } else {
                Customer user = new Customer();
                user.setName(name);
                user.setEmail(email);
                user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
                user.setPhone("0770000000");
                user.setRole(role);
                repo.save(user);
                System.out.println("User account " + email + " created successfully.");
            }
        } catch (SQLException e) {
            System.err.println("Failed to seed user " + email + ": " + e.getMessage());
        }
    }
}
