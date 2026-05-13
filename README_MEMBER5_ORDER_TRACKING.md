# Member 5 - Order Tracking & Status Management Guide

This guide explains how to operate the Order Tracking & Status Management module for the Web-Based Food Ordering System.

## Feature Coverage

The module supports the requested functions:

| Requirement | Status |
| --- | --- |
| Create initial order status as `Received` when an order is placed | Available |
| Customer views live order progress | Available |
| Kitchen staff updates order status | Available |
| Admin monitors active and completed orders | Available |
| Status history is saved for every update | Available |
| Customer notifications are created on status changes | Available |
| Cancel orders and mark as `Cancelled` | Available |
| Archive delivered/cancelled orders from active tracking | Available for Admin |

Real-time updates are implemented using automatic polling every 5 seconds. This fits the current Java Servlet stack without adding WebSocket infrastructure.

## Primary Users

The application has all three required user types:

| User Type | Email | Password | Main Access |
| --- | --- | --- | --- |
| Customer | `custmer@gmail.com` | `1234` | Track own orders and read notifications |
| Kitchen Staff | `kitchen@gmail.com` | `123456` | View orders and update order status |
| Admin | `admin@gmail.com` | `123456` | Full order monitoring, status control, cancellation, and archiving |

## Start The Application

Start MySQL first, then run the backend:

```bat
scripts\start-food-backend.cmd
```

Keep that terminal open.

For the frontend, use the running frontend URL:

```text
http://localhost:5173
```

If the frontend is not running, start it from the frontend folder:

```bat
cd frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## Customer Flow

1. Open `http://localhost:5173/login`.
2. Login as:
   - Email: `custmer@gmail.com`
   - Password: `1234`
3. Open `Track Order` from the navbar.
4. Select an order from the order list.
5. The order timeline shows:
   - `Received`
   - `Preparing`
   - `Ready`
   - `Out for Delivery`
   - `Delivered`
6. The page refreshes automatically every 5 seconds.
7. New status notifications appear in the `Latest updates` section.

## Kitchen Staff Flow

1. Open `http://localhost:5173/login`.
2. Login as:
   - Email: `kitchen@gmail.com`
   - Password: `123456`
3. You will be redirected to `http://localhost:5173/admin/orders`.
4. Review incoming and active orders.
5. Use the status dropdown to move an order through the workflow:
   - `Received`
   - `Preparing`
   - `Ready`
   - `Out for Delivery`
   - `Delivered`
6. Select `History` to view the complete status lifecycle.
7. Kitchen staff can cancel an active order when necessary.

Kitchen Staff cannot access menu/category admin pages.

## Admin Flow

1. Open `http://localhost:5173/login`.
2. Login as:
   - Email: `admin@gmail.com`
   - Password: `123456`
3. Open `Orders` from the navbar or go to:

```text
http://localhost:5173/admin/orders
```

4. Use `Active` to show ongoing orders.
5. Use `All` to show active, delivered, and cancelled orders.
6. Update order status using the dropdown.
7. Use `Cancel` to mark an active order as `Cancelled`.
8. Use `History` to inspect all status changes.
9. Use `Archive` on delivered/cancelled orders to remove them from active tracking.

## Status Rules

Valid normal transition:

```text
Received -> Preparing -> Ready -> Out for Delivery -> Delivered
```

An active order can also be changed to:

```text
Cancelled
```

Delivered and Cancelled are terminal statuses. Once an order reaches either status, it cannot be moved back to an earlier status.

## Database Tables Used

| Table | Purpose |
| --- | --- |
| `orders` | Stores order header, customer, total, current status, and archive flag |
| `order_items` | Stores each item in an order |
| `order_status_log` | Stores full status history |
| `order_notifications` | Stores customer notifications for status changes |
| `customers` | Stores customer, kitchen staff, and admin accounts |

## API Endpoints

Customer:

```text
GET /food-ordering/api/tracking/my-orders
GET /food-ordering/api/tracking/status?orderId=1
GET /food-ordering/api/tracking/history?orderId=1
GET /food-ordering/api/tracking/notifications
PUT /food-ordering/api/tracking/notifications/read
```

Kitchen Staff and Admin:

```text
GET /food-ordering/api/tracking/active
GET /food-ordering/api/tracking/all
PUT /food-ordering/api/tracking/status
PUT /food-ordering/api/tracking/cancel
```

Admin only:

```text
DELETE /food-ordering/api/tracking/archive?orderId=1
```

## Sample Data

The local database includes sample order `#1` for `custmer@gmail.com`. Use it to test status updates, history, and notifications.
