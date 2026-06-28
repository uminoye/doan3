# Hệ thống Quản lý Xuất Nhập Tồn

Hệ thống web quản lý sản phẩm, nhập kho thành phẩm từ nhà máy, tạo đơn hàng xuất cho khách, chuyển đơn qua logistics và kho để xuất hàng, tổng hợp báo cáo xuất - nhập - tồn theo thời gian.

## Công nghệ sử dụng

| Lớp | Công nghệ |
|------|-----------|
| Frontend | React + Vite + TailwindCSS + React Router + Axios |
| Backend | Node.js + Express + Prisma ORM |
| Database | PostgreSQL (Neon) |
| Deploy | Vercel (Frontend) + Render (Backend) |

## Cấu trúc thư mục

```
doan3/
├── backend/         # Node.js + Express API (deploy trên Render)
│   ├── src/
│   ├── prisma/
│   ├── render.yaml  # Cấu hình deploy Render
│   └── .env         # DATABASE_URL từ Neon (gitignore)
└── frontend/        # React + Vite SPA (deploy trên Vercel)
    ├── vercel.json  # Cấu hình deploy Vercel
    └── .env.example # Template biến môi trường
```

---

## Cách chạy local

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Deploy lên Production

### Bước 1: Cơ sở dữ liệu — Neon PostgreSQL

1. Truy cập [Neon console](https://console.neon.tech)
2. Tạo project mới → copy **Connection string** (Connection Details → Connection string)
3. Database URL có dạng:

```
postgresql://user:password@host/database?sslmode=require
```

### Bước 2: Backend API — Render

1. Truy cập [Render Dashboard](https://dashboard.render.com) → đăng nhập GitHub
2. Click **New → Blueprint** → kết nối repo GitHub
3. Chọn file `backend/render.yaml` (Render tự nhận diện)
4. Thêm các **Environment Variables** trong Render dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste connection string từ Neon |
| `JWT_SECRET` | Chuỗi secret ngẫu nhiên (VD: `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

5. Render sẽ tự chạy `prisma generate` và `prisma migrate deploy`
6. Sau khi deploy xong, copy URL backend: `https://inventory-backend.onrender.com` (hoặc tên bạn đặt)

> **Lưu ý:** Nếu không dùng Blueprint, vào **New → Web Service** → chọn repo → điền:
> - Root Directory: `backend`
> - Build Command: `npx prisma generate && npm install`
> - Start Command: `npm start`

### Bước 3: Cập nhật CORS Backend

Sau khi có URL Vercel (bước 4), thêm vào `allowedOrigins` trong `backend/src/index.js`:

```js
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://doan3.vercel.app',  // ← thay bằng URL Vercel thực tế
];
```

Commit & push để Render tự redeploy.

### Bước 4: Frontend — Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com) → New Project → import repo
2. Root Directory: `frontend`
3. Framework Preset: **Vite**
4. Thêm Environment Variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://inventory-backend.onrender.com/api` |

5. Click **Deploy**

Sau khi deploy xong, Vercel sẽ cung cấp URL như: `https://doan3.vercel.app`

### Bước 5: Cập nhật CORS cuối cùng

Thêm URL Vercel vào `allowedOrigins` trong `backend/src/index.js`, commit & push. Render sẽ tự redeploy.

---

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

## Tài khoản demo (mật khẩu: 123456)

| Email | Vai trò |
|-------|---------|
| admin@company.com | Admin |
| sales1@company.com | Sales |
| logistics@company.com | Logistics |
| warehouse@company.com | Kho |
| factory@company.com | Nhà máy |
