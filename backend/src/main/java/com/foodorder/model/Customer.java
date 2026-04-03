package com.foodorder.model;

public class Customer {

    private int    id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String createdAt;

    // empty constructor — used by repository when reading from DB
    public Customer() {}

    // full constructor — used when you have all data ready
    public Customer(int id, String name, String email,
                    String password, String phone, String role, String createdAt) {
        this.id        = id;
        this.name      = name;
        this.email     = email;
        this.password  = password;
        this.phone     = phone;
        this.role      = role;
        this.createdAt = createdAt;
    }

    // getters
    public int    getId()        { return id; }
    public String getName()      { return name; }
    public String getEmail()     { return email; }
    public String getPassword()  { return password; }
    public String getPhone()     { return phone; }
    public String getRole()      { return role; }
    public String getCreatedAt() { return createdAt; }

    // setters
    public void setId(int id)               { this.id = id; }
    public void setName(String name)        { this.name = name; }
    public void setEmail(String email)      { this.email = email; }
    public void setPassword(String password){ this.password = password; }
    public void setPhone(String phone)      { this.phone = phone; }
    public void setRole(String role)        { this.role = role; }
    public void setCreatedAt(String c)      { this.createdAt = c; }

    @Override
    public String toString() {
        return "Customer{id=" + id + ", name='" + name + "', email='" + email + "'}";
    }
}