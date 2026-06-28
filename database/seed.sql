-- ================================================================
-- SEED DATA - Dữ liệu mẫu để demo hệ thống
-- ================================================================

-- 1. ROLES
INSERT INTO roles (name, description) VALUES
('admin', 'Quản trị hệ thống - toàn quyền'),
('sales', 'Nhân viên kinh doanh - tạo đơn hàng'),
('logistics', 'Nhân viên logistics - điều phối giao hàng'),
('warehouse', 'Nhân viên kho - xuất nhập kho'),
('factory', 'Nhân viên nhà máy - tạo phiếu nhập thành phẩm');

-- 2. USERS (password: 123456 - bcrypt hash)
-- Hash: $2b$10$...
INSERT INTO users (full_name, email, password_hash, role_id, status) VALUES
('Nguyễn Văn Admin', 'admin@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 1, 'active'),
('Trần Thị Sales', 'sales1@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 2, 'active'),
('Lê Hoàng Sales', 'sales2@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 2, 'active'),
('Phạm Đình Logistics', 'logistics@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 3, 'active'),
('Hoàng Văn Kho', 'warehouse@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 4, 'active'),
('Ngô Thị Nhà Máy', 'factory@company.com', '$2b$10$rQZ9qKZxX8GqYv3K8pZ1XeK1L9mO4nR6tU5wX3yZ7aB2cD4eF6gH8', 5, 'active');

-- 3. WAREHOUSES
INSERT INTO warehouses (warehouse_code, name, location, is_active) VALUES
('WH001', 'Kho Tổng Hà Nội', 'Quận Long Biên, Hà Nội', TRUE),
('WH002', 'Kho Chi Nhánh Đà Nẵng', 'Quận Hải Châu, Đà Nẵng', TRUE);

-- 4. PRODUCTS
INSERT INTO products (sku, name, unit, category, sale_price) VALUES
('SKU001', 'Bánh Trung Thu Truyền Thống', 'hộp', 'Bánh Trung Thu', 85000.00),
('SKU002', 'Bánh Trung Thu Thập Cẩm', 'hộp', 'Bánh Trung Thu', 95000.00),
('SKU003', 'Bánh Trung Thu Đặc Biệt', 'hộp', 'Bánh Trung Thu', 120000.00),
('SKU004', 'Bánh Pía Sóc Trăng', 'hộp', 'Bánh Pía', 75000.00),
('SKU005', 'Bánh Pía Đặc Biệt', 'hộp', 'Bánh Pía', 98000.00),
('SKU006', 'Bánh Gai Nhài', 'hộp', 'Bánh Gai', 68000.00),
('SKU007', 'Bánh Cống Sóc Trăng', 'hộp', 'Bánh Đặc Sản', 88000.00),
('SKU008', 'Bánh Pía Mini', 'hộp', 'Bánh Pía', 45000.00);

-- 5. CUSTOMERS
INSERT INTO customers (customer_code, name, phone, address, contact_person, created_by) VALUES
('KH001', 'Cửa Hàng Bánh Ngọt Sài Gòn', '0901234567', '123 Nguyễn Trãi, Quận 1, TP.HCM', 'Chị Lan', 2),
('KH002', 'Siêu Thị Miền Bắc', '0912345678', '456 Trần Duy Hưng, Cầu Giấy, Hà Nội', 'Anh Tuấn', 2),
('KH003', 'Đại Lý Bánh Tân Phú', '0934567890', '78 Lê Văn Sỹ, Quận Tân Phú, TP.HCM', 'Chị Hương', 3),
('KH004', 'Cửa Hàng Đặc Sản Miền Trung', '0945678901', '32 Trần Phú, Đà Nẵng', 'Anh Hùng', 2),
('KH005', 'Chuỗi Bánh Ngon Việt', '0956789012', '88 Nguyễn Huệ, Quận 1, TP.HCM', 'Chị Mai', 3);

-- 6. PRODUCTION_RECEIPTS (Phiếu nhập - đã xác nhận)
INSERT INTO production_receipts (receipt_no, warehouse_id, receipt_date, notes, status, created_by) VALUES
('PN001', 1, CURRENT_DATE - INTERVAL '10 days', 'Nhập lô bánh tháng 6', 'confirmed', 6),
('PN002', 1, CURRENT_DATE - INTERVAL '7 days', 'Nhập bổ sung', 'confirmed', 6),
('PN003', 1, CURRENT_DATE - INTERVAL '3 days', 'Nhập lô mới Tết', 'confirmed', 6),
('PN004', 2, CURRENT_DATE - INTERVAL '5 days', 'Nhập cho kho Đà Nẵng', 'confirmed', 6);

-- 7. PRODUCTION_RECEIPT_ITEMS
INSERT INTO production_receipt_items (receipt_id, product_id, quantity) VALUES
(1, 1, 500), (1, 2, 400), (1, 3, 200),
(2, 1, 300), (2, 4, 250), (2, 5, 150),
(3, 1, 600), (3, 2, 500), (3, 3, 300), (3, 6, 400),
(4, 1, 200), (4, 2, 200), (4, 7, 150), (4, 8, 300);

-- 8. SALES_ORDERS
INSERT INTO sales_orders (order_no, customer_id, order_date, delivery_date, notes, status, created_by) VALUES
('DH001', 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days', 'Giao sớm', 'completed', 2),
('DH002', 2, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '1 day', 'Đơn lớn', 'completed', 2),
('DH003', 3, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'Khách cần gấp', 'logistics_received', 3),
('DH004', 4, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 'Giao tỉnh', 'submitted', 2),
('DH005', 5, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'Đơn thường', 'draft', 3);

-- 9. SALES_ORDER_ITEMS
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price) VALUES
(1, 1, 100, 85000), (1, 2, 80, 95000),
(2, 1, 200, 85000), (2, 3, 100, 120000), (2, 4, 150, 75000),
(3, 2, 120, 95000), (3, 5, 60, 98000),
(4, 1, 80, 85000), (4, 6, 100, 68000), (4, 7, 50, 88000),
(5, 1, 50, 85000), (5, 8, 100, 45000);

-- 10. DELIVERY_REQUESTS
INSERT INTO delivery_requests (sales_order_id, received_by, received_at, note, status) VALUES
(1, 4, CURRENT_DATE - INTERVAL '5 days' + INTERVAL '1 hour', 'Đơn ổn định, giao bình thường', 'confirmed'),
(2, 4, CURRENT_DATE - INTERVAL '4 days' + INTERVAL '1 hour', 'Đơn lớn, cần xe lớn', 'confirmed'),
(3, 4, CURRENT_DATE - INTERVAL '3 days' + INTERVAL '2 hours', 'Khách gần, giao nhanh', 'transferred');

-- 11. STOCK_OUTBOUND_NOTES (Phiếu xuất - đã xác nhận)
INSERT INTO stock_outbound_notes (note_no, sales_order_id, warehouse_id, export_date, notes, status, created_by) VALUES
('PX001', 1, 1, CURRENT_DATE - INTERVAL '2 days', 'Xuất cho DH001', 'confirmed', 5),
('PX002', 2, 1, CURRENT_DATE - INTERVAL '1 day', 'Xuất cho DH002', 'confirmed', 5);

-- 12. STOCK_OUTBOUND_NOTE_ITEMS
INSERT INTO stock_outbound_note_items (outbound_note_id, product_id, quantity) VALUES
(1, 1, 100), (1, 2, 80),
(2, 1, 200), (2, 3, 100), (2, 4, 150);
