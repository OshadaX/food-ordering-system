/*
steps

Block 1 — Package declaration
Block 2 — The class
Block 3 — Fields (the data)
Block 4 — Constructors
Block 5 — Getters and Setters
Block 6 — toString (optional but useful)

 */
package com.foodorder.model;

public class MenuItem {
    private int id;
    private int categoryId;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean isAvailable;
    private String createdAt;


    //construvtor 1 - empty constructor
    public MenuItem() {

    
    } 

    //constructor 2 - full constructor
    public MenuItem(int id, int categoryId, String name, String description, double price, String imageUrl, boolean isAvailable, String createdAt) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.isAvailable = isAvailable;
        this.createdAt = createdAt;
    }

    //getters
    public int getId() {return id;}
    public int getCategoryId() {return categoryId;}
    public String getName() {return name;}
    public String getDescription() {return description;}
    public double getPrice() {return price;}
    public String getImageUrl() {return imageUrl;}
    public boolean isAvailable() {return isAvailable;}
    public String getCreatedAt() {return createdAt;}

    //setters
    public void setId(int id) {this.id = id;}
    public void setCategoryId(int categoryId) {this.categoryId = categoryId;}
    public void setName(String name) {this.name = name;}
    public void setDescription(String description) {this.description = description;}
    public void setPrice(double price) {this.price = price;}
    public void setImageUrl(String imageUrl) {this.imageUrl = imageUrl;}
    public void setAvailable(boolean available) {this.isAvailable = available;}
    public void setCreatedAt(String createdAt) {this.createdAt = createdAt;}

    // toString — useful for debugging
    @Override
    public String toString() {
        return "MenuItem{" +
                "id=" + id +
                
                ", name='" + name + '\'' +
                
                ", price=" + price +
                
                ", isAvailable=" + isAvailable ;
               
    }



        
    
}
