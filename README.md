# Account Management System

Hệ thống quản lý Account, Department và Position theo mô hình 3-layer: Backend Spring Boot 3 (Java 17), Database PostgreSQL 16, Frontend ReactJS + TypeScript (Vite + Ant Design), triển khai toàn bộ bằng Docker Compose.

---

## 1. Yêu cầu môi trường & Cài đặt

- **Docker Desktop** (đang chạy)
- **Docker Compose**

---

## 2. Tài khoản mặc định

Hệ thống tự động khởi tạo 2 tài khoản khi chạy lần đầu:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| **ADMIN** | `admin` | `Admin@123` | `admin@example.com` |
| **USER** | `user` | `User@123` | `user@example.com` |

---

## 3. Khởi chạy với Docker Compose

### Bước 1: Chuẩn bị file `.env`
Đã tạo sẵn `.env` (dựa trên `.env.example`). Bạn có thể cập nhật các biến nếu muốn thay đổi mật khẩu database hoặc cấu hình SMTP:
```bash
cp .env.example .env
```

### Bước 2: Build & Khởi động containers
```bash
# Kiểm tra file cấu hình
docker-compose config

# Build các images và khởi chạy background
docker-compose up -d --build
```

### Bước 3: Kiểm tra trạng thái
```bash
# Xem trạng thái các container
docker-compose ps

# Xem log Backend
docker-compose logs -f backend

# Xem log Frontend
docker-compose logs -f frontend
```

### Bước 4: Dừng hệ thống
```bash
docker-compose down
```
*(Nếu muốn xóa cả database volume để reset dữ liệu: `docker-compose down -v`)*

---

## 4. Địa chỉ truy cập

| Thành phần | Địa chỉ URL | Ghi chú |
|------------|-------------|---------|
| **Giao diện Web (React)** | `http://localhost:3000` | Ant Design UI |
| **Backend REST API** | `http://localhost:3000/api/v1` hoặc `http://localhost:8080/api/v1` | Reverse proxy qua Nginx |
| **Health Check (Actuator)** | `http://localhost:8080/actuator/health` | Kiểm tra trạng thái backend |
| **PostgreSQL Database** | `localhost:5432` | Port map ra host |

---

## 5. Danh sách REST API chính (`/api/v1`)

### Authentication
- `POST /auth/login`: Đăng nhập, nhận JWT token.
- `GET /auth/me`: Lấy thông tin tài khoản đang đăng nhập.
- `PUT /auth/change-password`: Đổi mật khẩu tài khoản hiện tại.
- `POST /auth/forgot-password`: Yêu cầu gửi link đổi mật khẩu qua email.
- `POST /auth/reset-password`: Đặt lại mật khẩu mới thông qua token từ link email.

### Account Management (ADMIN)
- `GET /accounts`: Danh sách Account có tìm kiếm, lọc (department, position, role), phân trang.
- `GET /accounts/stats`: Thống kê tổng số lượng accounts, departments, positions và role breakdown.
- `GET /accounts/{id}`: Chi tiết Account.
- `POST /accounts`: Tạo Account mới (validate duplicate username/email).
- `PUT /accounts/{id}`: Cập nhật Account (ngăn không cho hạ quyền ADMIN cuối cùng).
- `DELETE /accounts/{id}`: Xóa Account (ngăn không cho xóa ADMIN cuối cùng).

### Department Management
- `GET /departments`: Xem danh sách Department kèm số lượng Account.
- `GET /departments/{id}`: Chi tiết Department.
- `POST /departments`: Tạo Department (ADMIN).
- `PUT /departments/{id}`: Cập nhật Department (ADMIN).
- `DELETE /departments/{id}`: Xóa Department (ADMIN - ngăn xóa nếu còn Account đang tham chiếu).

### Position Management
- `GET /positions`: Xem danh sách Position kèm số lượng Account.
- `GET /positions/{id}`: Chi tiết Position.
- `POST /positions`: Tạo Position (ADMIN).
- `PUT /positions/{id}`: Cập nhật Position (ADMIN).
- `DELETE /positions/{id}`: Xóa Position (ADMIN - ngăn xóa nếu còn Account đang tham chiếu).
