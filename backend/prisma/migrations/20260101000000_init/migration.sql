-- Migration: Initial schema
-- Created: 2026-01-01

BEGIN;

CREATE TABLE "roles" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL UNIQUE,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" INT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "customers" (
    "id" SERIAL PRIMARY KEY,
    "customer_code" VARCHAR(50) NOT NULL UNIQUE,
    "name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "contact_person" VARCHAR(100),
    "created_by" INT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "warehouses" (
    "id" SERIAL PRIMARY KEY,
    "warehouse_code" VARCHAR(50) NOT NULL UNIQUE,
    "name" VARCHAR(200) NOT NULL,
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "products" (
    "id" SERIAL PRIMARY KEY,
    "sku" VARCHAR(50) NOT NULL UNIQUE,
    "name" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(30) NOT NULL DEFAULT 'cái',
    "category" VARCHAR(100),
    "sale_price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "production_receipts" (
    "id" SERIAL PRIMARY KEY,
    "receipt_no" VARCHAR(50) NOT NULL UNIQUE,
    "warehouse_id" INT NOT NULL,
    "receipt_date" DATE NOT NULL,
    "notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_by" INT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "production_receipt_items" (
    "id" SERIAL PRIMARY KEY,
    "receipt_id" INT NOT NULL,
    "product_id" INT NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL
);

CREATE TABLE "sales_orders" (
    "id" SERIAL PRIMARY KEY,
    "order_no" VARCHAR(50) NOT NULL UNIQUE,
    "customer_id" INT NOT NULL,
    "order_date" DATE NOT NULL,
    "delivery_date" DATE,
    "notes" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "created_by" INT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "sales_order_items" (
    "id" SERIAL PRIMARY KEY,
    "sales_order_id" INT NOT NULL,
    "product_id" INT NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "unit_price" DECIMAL(15,2) NOT NULL DEFAULT 0
);

CREATE TABLE "delivery_requests" (
    "id" SERIAL PRIMARY KEY,
    "sales_order_id" INT NOT NULL UNIQUE,
    "received_by" INT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending'
);

CREATE TABLE "stock_outbound_notes" (
    "id" SERIAL PRIMARY KEY,
    "note_no" VARCHAR(50) NOT NULL UNIQUE,
    "sales_order_id" INT,
    "warehouse_id" INT NOT NULL,
    "export_date" DATE NOT NULL,
    "notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_by" INT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "stock_outbound_note_items" (
    "id" SERIAL PRIMARY KEY,
    "outbound_note_id" INT NOT NULL,
    "product_id" INT NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL
);

CREATE TABLE "inventory_balances" (
    "id" SERIAL PRIMARY KEY,
    "warehouse_id" INT NOT NULL,
    "product_id" INT NOT NULL,
    "on_hand_qty" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("warehouse_id", "product_id")
);

CREATE TABLE "inventory_transactions" (
    "id" SERIAL PRIMARY KEY,
    "warehouse_id" INT NOT NULL,
    "product_id" INT NOT NULL,
    "transaction_type" VARCHAR(10) NOT NULL,
    "quantity" DECIMAL(15,3) NOT NULL,
    "reference_type" VARCHAR(50) NOT NULL,
    "reference_id" INT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INT,
    "notes" TEXT
);

-- Foreign Keys
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id");
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
ALTER TABLE "production_receipts" ADD CONSTRAINT "production_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");
ALTER TABLE "production_receipts" ADD CONSTRAINT "production_receipts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
ALTER TABLE "production_receipt_items" ADD CONSTRAINT "production_receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "production_receipts"("id") ON DELETE CASCADE;
ALTER TABLE "production_receipt_items" ADD CONSTRAINT "production_receipt_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE;
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id");
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id");
ALTER TABLE "stock_outbound_notes" ADD CONSTRAINT "stock_outbound_notes_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");
ALTER TABLE "stock_outbound_notes" ADD CONSTRAINT "stock_outbound_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");
ALTER TABLE "stock_outbound_notes" ADD CONSTRAINT "stock_outbound_notes_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id");
ALTER TABLE "stock_outbound_note_items" ADD CONSTRAINT "stock_outbound_note_items_outbound_note_id_fkey" FOREIGN KEY ("outbound_note_id") REFERENCES "stock_outbound_notes"("id") ON DELETE CASCADE;
ALTER TABLE "stock_outbound_note_items" ADD CONSTRAINT "stock_outbound_note_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");
ALTER TABLE "inventory_balances" ADD CONSTRAINT "inventory_balances_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");

COMMIT;
