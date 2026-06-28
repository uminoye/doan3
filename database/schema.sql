-- ================================================================
-- HỆ THỐNG QUẢN LÝ XUẤT NHẬP TỒN
-- Database Schema - PostgreSQL (Neon)
-- ================================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(100),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(30) DEFAULT 'cái',
    category VARCHAR(100),
    sale_price DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCTION_RECEIPTS (Phiếu nhập thành phẩm từ nhà máy)
CREATE TABLE IF NOT EXISTS production_receipts (
    id SERIAL PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCTION_RECEIPT_ITEMS (Chi tiết phiếu nhập)
CREATE TABLE IF NOT EXISTS production_receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES production_receipts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(15, 3) NOT NULL CHECK (quantity > 0)
);

-- 8. SALES_ORDERS (Đơn hàng từ Sales)
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'logistics_received',
        'warehouse_processing', 'completed', 'cancelled'
    )),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. SALES_ORDER_ITEMS (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS sales_order_items (
    id SERIAL PRIMARY KEY,
    sales_order_id INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(15, 3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) DEFAULT 0
);

-- 10. DELIVERY_REQUESTS (Logistics tiếp nhận đơn)
CREATE TABLE IF NOT EXISTS delivery_requests (
    id SERIAL PRIMARY KEY,
    sales_order_id INTEGER NOT NULL UNIQUE REFERENCES sales_orders(id) ON DELETE RESTRICT,
    received_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'transferred', 'cancelled'))
);

-- 11. STOCK_OUTBOUND_NOTES (Phiếu xuất kho)
CREATE TABLE IF NOT EXISTS stock_outbound_notes (
    id SERIAL PRIMARY KEY,
    note_no VARCHAR(50) NOT NULL UNIQUE,
    sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE SET NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    export_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. STOCK_OUTBOUND_NOTE_ITEMS (Chi tiết phiếu xuất)
CREATE TABLE IF NOT EXISTS stock_outbound_note_items (
    id SERIAL PRIMARY KEY,
    outbound_note_id INTEGER NOT NULL REFERENCES stock_outbound_notes(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(15, 3) NOT NULL CHECK (quantity > 0)
);

-- 13. INVENTORY_BALANCES (Tồn kho hiện tại)
CREATE TABLE IF NOT EXISTS inventory_balances (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    on_hand_qty DECIMAL(15, 3) DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, product_id)
);

-- 14. INVENTORY_TRANSACTIONS (Lịch sử giao dịch kho)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
    quantity DECIMAL(15, 3) NOT NULL CHECK (quantity > 0),
    reference_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_production_receipts_warehouse ON production_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_production_receipts_date ON production_receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_production_receipts_status ON production_receipts(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_creator ON sales_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_order ON delivery_requests(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_outbound_notes_warehouse ON stock_outbound_notes(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_outbound_notes_date ON stock_outbound_notes(export_date);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_warehouse ON inventory_balances(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_product ON inventory_balances(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_warehouse_product ON inventory_transactions(warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
