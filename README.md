# Hệ thống Quản lý Xuất Nhập Tồn

Hệ thống web quản lý sản phẩm, nhập kho thành phẩm từ nhà máy, tạo đơn hàng xuất cho khách, chuyển đơn qua logistics và kho để xuất hàng, tổng hợp báo cáo xuất - nhập - tồn theo thời gian.

## Công nghệ sử dụng

| Lớp | Công nghệ |
|------|-----------|
| Frontend | React + Vite + TailwindCSS + React Router + Axios |
| Backend | Node.js + Express + Prisma ORM |
| Database | PostgreSQL (Neon) |
| Deploy | Vercel (Frontend) + Render (Backend) |

## Cách chạy local

### 1. Clone repo
```bash
git clone https://github.com/uminoye/doan3.git
cd doan3
```

### 2. Backend
```bash
cd backend
npm install
# Tạo file .env từ .env.example và điền DATABASE_URL của bạn
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tài khoản demo (mật khẩu: 123456)

| Email | Vai trò |
|-------|---------|
| admin@company.com | Admin |
| sales1@company.com | Sales |
| logistics@company.com | Logistics |
| warehouse@company.com | Kho |
| factory@company.com | Nhà máy |

## Luồng nghiệp vụ

```
Nhà máy nhập hàng
    ↓
Sales tạo đơn → submitted
    ↓
Logistics tiếp nhận → logistics_received → transferred
    ↓
Kho xuất hàng → completed → hệ thống trừ tồn tự động
    ↓
Xem báo cáo xuất - nhập - tồn
```
