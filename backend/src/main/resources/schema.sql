CREATE TABLE customers (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)        NOT NULL,
    email        VARCHAR(100)        NOT NULL UNIQUE,
    password     VARCHAR(255)        NOT NULL,
    phone        VARCHAR(15),
    created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT                 NOT NULL,
    label        VARCHAR(50),
    street       VARCHAR(255)        NOT NULL,
    city         VARCHAR(100)        NOT NULL,
    postal_code  VARCHAR(20),
    is_default   BOOLEAN             DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)        NOT NULL UNIQUE,
    created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    category_id  INT,
    name         VARCHAR(150)        NOT NULL,
    description  TEXT,
    price        DECIMAL(10, 2)      NOT NULL,
    image_url    VARCHAR(500),
    is_available BOOLEAN             DEFAULT TRUE,
    created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE orders (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    customer_id    INT                NOT NULL,
    address_id     INT,
    promo_code     VARCHAR(50),
    discount       DECIMAL(10, 2)     DEFAULT 0.00,
    total_amount   DECIMAL(10, 2)     NOT NULL,
    status         ENUM(
                     'Received',
                     'Preparing',
                     'Ready',
                     'Out for Delivery',
                     'Delivered',
                     'Cancelled'
                   )                  DEFAULT 'Received',
    created_at     TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id)  REFERENCES addresses(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT                 NOT NULL,
    menu_item_id INT                 NOT NULL,
    quantity     INT                 NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10, 2)      NOT NULL,
    FOREIGN KEY (order_id)     REFERENCES orders(id)     ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE promo_codes (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(50)        NOT NULL UNIQUE,
    discount_percent DECIMAL(5, 2)      NOT NULL,
    is_active        BOOLEAN            DEFAULT TRUE,
    expires_at       TIMESTAMP
);

CREATE TABLE payments (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    order_id       INT                NOT NULL UNIQUE,
    customer_id    INT                NOT NULL,
    method         ENUM(
                     'Cash on Delivery',
                     'Card',
                     'Online'
                   )                  NOT NULL,
    status         ENUM(
                     'Pending',
                     'Paid',
                     'Failed',
                     'Void'
                   )                  DEFAULT 'Pending',
    amount         DECIMAL(10, 2)     NOT NULL,
    paid_at        TIMESTAMP,
    created_at     TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id)    REFERENCES orders(id)    ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE order_status_log (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    order_id     INT                 NOT NULL,
    status       ENUM(
                   'Received',
                   'Preparing',
                   'Ready',
                   'Out for Delivery',
                   'Delivered',
                   'Cancelled'
                 )                   NOT NULL,
    updated_by   VARCHAR(100),
    note         VARCHAR(255),
    updated_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE delivery_persons (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)        NOT NULL,
    phone        VARCHAR(15)         NOT NULL UNIQUE,
    is_available BOOLEAN             DEFAULT TRUE,
    created_at   TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deliveries (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    order_id            INT                NOT NULL UNIQUE,
    delivery_person_id  INT,
    status              ENUM(
                          'Assigned',
                          'Picked Up',
                          'On the Way',
                          'Delivered'
                        )                  DEFAULT 'Assigned',
    assigned_at         TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    delivered_at        TIMESTAMP,
    FOREIGN KEY (order_id)           REFERENCES orders(id)           ON DELETE CASCADE,
    FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id) ON DELETE SET NULL
);