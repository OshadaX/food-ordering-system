CREATE TABLE IF NOT EXISTS order_tracking (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT DEFAULT 0,
    customer_name VARCHAR(120),
    current_status VARCHAR(40) NOT NULL,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL,
    updated_by VARCHAR(120),
    note VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tracking_history_order
        FOREIGN KEY (order_id) REFERENCES order_tracking(order_id)
        ON DELETE CASCADE
);

MERGE INTO order_tracking (order_id, customer_id, customer_name, current_status, archived)
KEY (order_id)
VALUES
    (1001, 1, 'Kasun Perera', 'RECEIVED', FALSE),
    (1002, 2, 'Nadeesha Silva', 'PREPARING', FALSE);

INSERT INTO order_status_history (order_id, status, updated_by, note)
SELECT 1001, 'RECEIVED', 'System', 'Order received.'
WHERE NOT EXISTS (
    SELECT 1 FROM order_status_history WHERE order_id = 1001 AND status = 'RECEIVED'
);

INSERT INTO order_status_history (order_id, status, updated_by, note)
SELECT 1002, 'RECEIVED', 'System', 'Order received.'
WHERE NOT EXISTS (
    SELECT 1 FROM order_status_history WHERE order_id = 1002 AND status = 'RECEIVED'
);

INSERT INTO order_status_history (order_id, status, updated_by, note)
SELECT 1002, 'PREPARING', 'Kitchen Staff', 'Status updated to Preparing.'
WHERE NOT EXISTS (
    SELECT 1 FROM order_status_history WHERE order_id = 1002 AND status = 'PREPARING'
);
