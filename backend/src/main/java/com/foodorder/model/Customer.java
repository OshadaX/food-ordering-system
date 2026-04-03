package com.foodorder.model;

public class Customer {

    private int    id;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String createdAt;

    // empty constructor — used by repository when reading from DB
    public Customer() {}

    // full constructor — used when you have all data ready
    public Customer(int id, String name, String email,
                    String password, String phone, String createdAt) {
        this.id        = id;
        this.name      = name;
        this.email     = email;
        this.password  = password;
        this.phone     = phone;
        this.createdAt = createdAt;
    }

    // getters
    public int    getId()        { return id; }
    public String getName()      { return name; }
    public String getEmail()     { return email; }
    public String getPassword()  { return password; }
    public String getPhone()     { return phone; }
    public String getCreatedAt() { return createdAt; }

    // setters
    public void setId(int id)               { this.id = id; }
    public void setName(String name)        { this.name = name; }
    public void setEmail(String email)      { this.email = email; }
    public void setPassword(String password){ this.password = password; }
    public void setPhone(String phone)      { this.phone = phone; }
    public void setCreatedAt(String c)      { this.createdAt = c; }

    @Override
    public String toString() {
        return "Customer{id=" + id + ", name='" + name + "', email='" + email + "'}";
    }
}