package com.foodorder.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "FoodOrderingSystemSecretKey2024!!SuperSecure";
    private static final long   EXPIRY = 24 * 60 * 60 * 1000;
    private static final Key    KEY    = Keys.hmacShaKeyFor(SECRET.getBytes());

    public static String generateToken(int customerId, String name, String email, String role) {
        return Jwts.builder()
                .setSubject(String.valueOf(customerId))
                .claim("name",  name)
                .claim("email", email)
                .claim("role",  role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY))
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(KEY)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static int getCustomerId(String token) {
        return Integer.parseInt(getClaims(token).getSubject());
    }

    public static String getCustomerName(String token) {
        return (String) getClaims(token).get("name");
    }

    public static String getCustomerEmail(String token) {
        return (String) getClaims(token).get("email");
    }

    public static String getCustomerRole(String token) {
        return (String) getClaims(token).get("role");
    }

    public static String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}