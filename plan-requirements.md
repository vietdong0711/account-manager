# Plan xây dựng Web quản lý Account

## 1. Tổng quan dự án

Xây dựng hệ thống quản lý tài khoản theo mô hình 3 layer, gồm Backend REST API, Frontend ReactJS + TypeScript, database MySQL và triển khai toàn bộ bằng Docker Compose.

### Mục tiêu

- Quản lý Account, Department và Position.
- Đăng nhập và phân quyền bằng JWT.
- Hỗ trợ quên mật khẩu và reset mật khẩu qua email SMTP.
- Cung cấp giao diện CRUD, tìm kiếm, lọc và phân trang.
- Có thể khởi chạy toàn bộ hệ thống bằng Docker Compose.

## 2. Công nghệ sử dụng

### Backend

- Java 17
- Spring Boot 3.x (có thể chọn phiên bản 3.5.x tương thích Java 17)
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security
- JWT
- Jakarta Validation
- JavaMailSender (SMTP)
- Maven
- Spring Boot Actuator (healthcheck)
- Flyway (khuyến nghị để quản lý phiên bản database)

> Lưu ý: Java 17 là phiên bản Java, không phải Spring 17. Spring Boot 3.x tương thích Java 17.

### Database

- MySQL 8.x
- Docker volume để lưu dữ liệu lâu dài

### Frontend

- ReactJS
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod hoặc Yup
- Ant Design hoặc Bootstrap

### Công cụ

- Docker Desktop
- Docker Compose
- IntelliJ IDEA
- VS Code
- Postman
- Git

## 3. Chức năng hệ thống

### Authentication

- Đăng nhập bằng username và password.
- Xác thực bằng JWT.
- Xem thông tin tài khoản hiện tại.
- Đổi mật khẩu khi đã đăng nhập.
- Quên mật khẩu bằng email.
- Reset mật khẩu bằng token một lần, có thời hạn.

### Quản lý Account

- Xem danh sách Account.
- Xem chi tiết Account.
- Thêm Account.
- Cập nhật Account.
- Xóa Account.
- Tìm kiếm theo username/fullname.
- Lọc theo Department, Position và Role.
- Phân trang.
- Kiểm tra username/email trùng lặp.

### Quản lý Department

- Xem danh sách và chi tiết Department.
- Thêm, sửa, xóa Department.
- Kiểm tra tên trùng.
- Không cho xóa nếu còn Account đang tham chiếu, trừ khi có quy tắc xử lý rõ ràng.

### Quản lý Position

- Xem danh sách và chi tiết Position.
- Thêm, sửa, xóa Position.
- Kiểm tra tên trùng.
- Không cho xóa nếu còn Account đang tham chiếu, trừ khi có quy tắc xử lý rõ ràng.

### Phân quyền

| Chức năng | ADMIN | USER |
|---|---|---|
| Đăng nhập | Có | Có |
| Xem thông tin cá nhân | Có | Có |
| Đổi mật khẩu | Có | Có |
| Quên/reset mật khẩu | Có | Có |
| CRUD Account | Có | Không |
| CRUD Department | Có | Không |
| CRUD Position | Có | Không |
| Xem danh sách Department/Position | Có | Có thể cho phép |

Quy tắc bảo mật:

- Backend phải kiểm tra quyền; ẩn nút trên Frontend không đủ để bảo vệ API.
- USER không được tự nâng quyền thành ADMIN.
- Không trả password hoặc password hash trong API response.
- Không cho phép xóa tài khoản ADMIN cuối cùng.
- Trả `401 Unauthorized` khi chưa xác thực hoặc token không hợp lệ; trả `403 Forbidden` khi đã xác thực nhưng không đủ quyền.

## 4. Mô hình kiến trúc Backend — 3 layer

```text
Controller Layer
    |
    v
Service Layer
    |
    v
Repository Layer
    |
    v
MySQL Database
```

### Controller Layer

Nhiệm vụ:

- Nhận HTTP request.
- Validate dữ liệu đầu vào.
- Gọi Service xử lý nghiệp vụ.
- Trả HTTP response và status code phù hợp.

Các controller dự kiến:

- `AuthController`
- `AccountController`
- `DepartmentController`
- `PositionController`
- `PasswordResetController` (có thể gộp chức năng reset vào `AuthController`)

### Service Layer

Nhiệm vụ:

- Xử lý nghiệp vụ.
- Kiểm tra điều kiện trước khi tạo, sửa hoặc xóa.
- Điều phối Repository và EmailService.
- Quản lý transaction bằng `@Transactional` khi cần.

Các service dự kiến:

- `AuthService`
- `AccountService`
- `DepartmentService`
- `PositionService`
- `PasswordResetService`
- `EmailService`

### Repository Layer

Dùng Spring Data JPA để truy cập database:

- `AccountRepository`
- `DepartmentRepository`
- `PositionRepository`
- `PasswordResetTokenRepository`

### Thành phần hỗ trợ

- `SecurityConfig`: cấu hình Spring Security và quyền truy cập.
- `JwtService`: tạo và xác thực JWT.
- `JwtAuthenticationFilter`: đọc và xác thực Bearer token.
- `CustomUserDetailsService`: tải thông tin người dùng.
- `GlobalExceptionHandler`: chuẩn hóa lỗi bằng `@RestControllerAdvice`.
- DTO: tách dữ liệu request/response khỏi Entity.
- Mapper: chuyển đổi Entity và DTO; ban đầu có thể map thủ công.

Nguyên tắc: Controller không truy vấn Repository trực tiếp; Service xử lý nghiệp vụ; Repository chỉ đảm nhiệm truy cập dữ liệu.

## 5. Thiết kế database

### 5.1. Bảng `accounts`

| Trường | Kiểu gợi ý | Quy tắc |
|---|---|---|
| `id` | BIGINT | Primary key, tự tăng |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE |
| `fullname` | VARCHAR(150) | NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL, lưu BCrypt hash |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `department_id` | BIGINT | Foreign key tới `departments.id` |
| `position_id` | BIGINT | Foreign key tới `positions.id` |
| `create_date` | DATETIME | Thời điểm tạo, không thay đổi khi cập nhật |
| `role` | VARCHAR(20) | `ADMIN` hoặc `USER` |

Email được bổ sung vì chức năng reset mật khẩu cần địa chỉ nhận email. Có thể dùng trường `password` trong Java Entity nhưng cột database nên đặt là `password_hash` để thể hiện rõ dữ liệu đã hash.

### 5.2. Bảng `departments`

| Trường | Kiểu gợi ý | Quy tắc |
|---|---|---|
| `id` | BIGINT | Primary key, tự tăng |
| `name` | VARCHAR(150) | NOT NULL, UNIQUE |

### 5.3. Bảng `positions`

| Trường | Kiểu gợi ý | Quy tắc |
|---|---|---|
| `id` | BIGINT | Primary key, tự tăng |
| `name` | VARCHAR(150) | NOT NULL, UNIQUE |

### 5.4. Bảng `password_reset_tokens`

| Trường | Kiểu gợi ý | Quy tắc |
|---|---|---|
| `id` | BIGINT | Primary key |
| `account_id` | BIGINT | Foreign key tới `accounts.id` |
| `token_hash` | VARCHAR(255) | Lưu hash token, không lưu token gốc |
| `expires_at` | DATETIME | Thời điểm hết hạn |
| `used_at` | DATETIME, nullable | Thời điểm token được sử dụng |
| `created_at` | DATETIME | Thời điểm tạo token |

### Quan hệ

- Một Department có nhiều Account.
- Một Position có nhiều Account.
- Một Account có thể có nhiều bản ghi reset token trong lịch sử.

### Quy tắc dữ liệu

- Username và email phải duy nhất.
- `create_date` được sinh tự động khi tạo Account.
- Dùng Java `Long` cho ID, `LocalDateTime` cho thời gian và enum `Role` cho role.
- Kiểm tra khóa ngoại trước khi xóa Department/Position.
- Khuyến nghị dùng Flyway để quản lý schema; ở môi trường triển khai nên đặt `spring.jpa.hibernate.ddl-auto=validate`.

## 6. REST API

Prefix: `/api/v1`.

### 6.1. Authentication

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/auth/login` | Đăng nhập, trả JWT |
| GET | `/auth/me` | Lấy thông tin tài khoản hiện tại |
| POST | `/auth/forgot-password` | Yêu cầu gửi email reset |
| POST | `/auth/reset-password` | Đặt mật khẩu mới bằng token |
| PUT | `/auth/change-password` | Đổi mật khẩu khi đã đăng nhập |

Ví dụ request login:

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

Ví dụ response:

```json
{
  "accessToken": "<jwt-token>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "account": {
    "id": 1,
    "username": "admin",
    "fullname": "Administrator",
    "role": "ADMIN"
  }
}
```

Đây là ví dụ cấu trúc response; thời hạn token thực tế phụ thuộc cấu hình. Không trả `password_hash` trong response.

### 6.2. Account CRUD — ADMIN

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/accounts` | Danh sách, tìm kiếm, phân trang |
| GET | `/accounts/{id}` | Chi tiết Account |
| POST | `/accounts` | Tạo Account |
| PUT | `/accounts/{id}` | Cập nhật Account |
| DELETE | `/accounts/{id}` | Xóa Account |

Ví dụ tìm kiếm:

```text
GET /api/v1/accounts?page=0&size=10&keyword=nguyen&departmentId=1&positionId=2
```

Response danh sách nên có `content`, `page`, `size`, `totalElements`, `totalPages`.

Khi tạo/cập nhật, Backend phải kiểm tra Department/Position có tồn tại, username/email có bị trùng, role hợp lệ và các trường đạt validation.

### 6.3. Department CRUD

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/departments` | Danh sách |
| GET | `/departments/{id}` | Chi tiết |
| POST | `/departments` | Tạo |
| PUT | `/departments/{id}` | Cập nhật |
| DELETE | `/departments/{id}` | Xóa |

### 6.4. Position CRUD

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/positions` | Danh sách |
| GET | `/positions/{id}` | Chi tiết |
| POST | `/positions` | Tạo |
| PUT | `/positions/{id}` | Cập nhật |
| DELETE | `/positions/{id}` | Xóa |

Chỉ ADMIN được gọi API ghi dữ liệu. Có thể cho USER gọi các API GET danh mục để hiển thị thông tin.

## 7. Luồng reset mật khẩu qua SMTP

1. Người dùng nhập email tại màn hình Forgot Password.
2. Backend tạo token ngẫu nhiên có độ an toàn cao.
3. Backend lưu hash token cùng thời hạn và trạng thái sử dụng vào database.
4. `EmailService` gửi link reset qua SMTP, ví dụ `https://your-domain/reset-password?token=...`.
5. Người dùng mở link, nhập mật khẩu mới.
6. Frontend gửi token và mật khẩu mới tới API reset.
7. Backend xác thực token, kiểm tra chưa hết hạn và chưa dùng.
8. Backend hash mật khẩu mới bằng BCrypt, cập nhật tài khoản và đánh dấu token đã dùng trong transaction.

Khuyến nghị bảo mật:

- Token hết hạn sau khoảng 15–30 phút.
- Chỉ dùng token một lần.
- Không gửi mật khẩu mới qua email.
- Response Forgot Password luôn dùng thông báo chung, tránh tiết lộ email có tồn tại hay không.
- Giới hạn số lần yêu cầu reset để tránh spam.
- SMTP password lưu trong biến môi trường hoặc secrets, không commit lên Git.
- Nếu dùng Gmail, có thể cần App Password tùy cấu hình tài khoản.

## 8. Frontend ReactJS + TypeScript

### Công nghệ

- React + TypeScript + Vite
- React Router
- Axios
- React Hook Form
- Zod hoặc Yup
- Ant Design hoặc Bootstrap

### Các màn hình

1. **Login — `/login`**
   - Nhập username/password, validate và đăng nhập.
   - Hiển thị lỗi đăng nhập.
   - Link Forgot Password.

2. **Dashboard — `/dashboard`**
   - Tổng số Account, Department, Position.
   - Thống kê Account theo role.

3. **Account Management — `/accounts`**
   - Bảng danh sách.
   - Tìm kiếm, lọc, phân trang.
   - Thêm, sửa, xem chi tiết và xóa.
   - Chỉ ADMIN nhìn thấy các nút CRUD.

4. **Department Management — `/departments`**
   - Danh sách, thêm, sửa, xóa.
   - Kiểm tra tên trùng và dữ liệu đang được sử dụng.

5. **Position Management — `/positions`**
   - Danh sách, thêm, sửa, xóa.
   - Kiểm tra tên trùng và dữ liệu đang được sử dụng.

6. **Forgot Password — `/forgot-password`**
   - Nhập email và yêu cầu gửi link.

7. **Reset Password — `/reset-password`**
   - Nhập mật khẩu mới và xác thực token.

8. **Profile — `/profile`**
   - Xem thông tin tài khoản hiện tại.

9. **Change Password — `/change-password`**
   - Đổi mật khẩu khi đã đăng nhập.

### Cấu trúc thư mục Frontend

```text
frontend/
├── src/
│   ├── api/
│   │   ├── axiosClient.ts
│   │   ├── authApi.ts
│   │   ├── accountApi.ts
│   │   ├── departmentApi.ts
│   │   └── positionApi.ts
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── departments/
│   │   ├── positions/
│   │   └── profile/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile
├── nginx.conf
└── .dockerignore
```

Nên định nghĩa TypeScript types cho `Account`, `Department`, `Position`, `LoginRequest`, `PageResponse<T>` và các response API. Dùng chung form Account cho cả tạo mới và chỉnh sửa để tránh lặp code.

Về JWT, phương án production nên cân nhắc access token ngắn hạn và refresh token trong cookie `HttpOnly`, `Secure`, `SameSite`, kèm cơ chế bảo vệ CSRF phù hợp. Với phiên bản học tập, có thể bắt đầu bằng access token ngắn hạn và yêu cầu đăng nhập lại khi hết hạn. Tránh lưu token dài hạn trong `localStorage` nếu có thể.

## 9. Docker hóa toàn bộ hệ thống

### 9.1. Kiến trúc Docker

```text
Browser
  |
  v
Frontend container (Nginx + React build) :3000
  |
  | /api/
  v
Backend container (Spring Boot + Java 17) :8080
  |
  v
MySQL container :3306
  |
  v
Docker volume (dữ liệu database)

Backend container ---> SMTP provider bên ngoài
```

Các container kết nối qua Docker network `account-network`.

- Backend kết nối MySQL bằng hostname `mysql`, không dùng `localhost`.
- Frontend được Nginx phục vụ ở cổng host `3000`.
- Nginx proxy `/api/` tới `http://backend:8080/api/`.
- MySQL dùng Docker volume để dữ liệu tồn tại sau khi container được tạo lại.
- SMTP là dịch vụ bên ngoài, được Backend truy cập bằng hostname và cổng cấu hình.

### 9.2. Cấu trúc project

```text
account-management/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── database/
│   └── migrations/
├── compose.yaml
├── .env
├── .env.example
└── .gitignore
```

### 9.3. File `compose.yaml`

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - account-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      SPRING_PROFILES_ACTIVE: docker
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: account_db
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      MAIL_HOST: ${MAIL_HOST}
      MAIL_PORT: ${MAIL_PORT:-587}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      MAIL_FROM: ${MAIL_FROM}
    depends_on:
      mysql:
        condition: service_healthy
    expose:
      - "8080"
    networks:
      - account-network
    healthcheck:
      test:
        - CMD-SHELL
        - curl -fsS http://localhost:8080/actuator/health | grep -q '"status":"UP"'
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 40s
    restart: unless-stopped

  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: account_db
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - account-network
    healthcheck:
      test:
        - CMD-SHELL
        - mysqladmin ping -h localhost -u root -p"$${MYSQL_ROOT_PASSWORD}" --silent
      interval: 10s
      timeout: 5s
      retries: 10
    restart: unless-stopped

networks:
  account-network:
    driver: bridge

volumes:
  mysql_data:
```

**Lưu ý:** Cấu hình healthcheck Backend yêu cầu thêm Spring Boot Actuator, bật endpoint health và cài `curl` trong image. `depends_on` theo healthcheck giúp kiểm soát thứ tự khởi động, nhưng ứng dụng vẫn nên có khả năng retry kết nối database khi cần.

Ở production, cân nhắc bỏ `ports` của MySQL để không mở database ra máy host hoặc mạng bên ngoài.

### 9.4. Dockerfile Backend

File `backend/Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 10001 appuser

COPY --from=build /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

Dockerfile sử dụng multi-stage build: giai đoạn build dùng Maven + JDK 17, giai đoạn chạy chỉ dùng JRE 17. Cần đảm bảo thư mục `target` chỉ có một JAR ứng dụng phù hợp để copy.

File `backend/.dockerignore`:

```text
target/
.git/
.idea/
*.iml
.env
```

### 9.5. Dockerfile Frontend

File `frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

File `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Frontend gọi API bằng URL tương đối, ví dụ `/api/v1/accounts`. Nginx sẽ chuyển tiếp request sang Backend trong Docker network.

File `frontend/.dockerignore`:

```text
node_modules/
dist/
.git/
.idea/
.env*
```

Nếu Frontend cần biến môi trường trong quá trình build, hãy điều chỉnh `.dockerignore` để đưa vào build context những file cấu hình cần thiết.

### 9.6. File `.env.example`

```dotenv
DB_USERNAME=account_user
DB_PASSWORD=change_me
MYSQL_ROOT_PASSWORD=change_root_password

JWT_SECRET=replace_with_a_long_random_secret

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_smtp_app_password
MAIL_FROM=your_email@example.com
```

Sao chép file này thành `.env` và thay bằng thông tin thực tế. Không commit `.env` lên Git. Dùng secrets phù hợp khi triển khai production.

### 9.7. Cấu hình `application-docker.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:mysql}:${DB_PORT:3306}/${DB_NAME:account_db}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: validate

  mail:
    host: ${MAIL_HOST}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

Cần bổ sung cấu hình JWT, Flyway và Actuator phù hợp với ứng dụng. Với Gmail SMTP, thường cần App Password nếu tài khoản đáp ứng điều kiện sử dụng; không dùng mật khẩu đăng nhập Gmail thông thường.

## 10. Lệnh chạy Docker

Tại thư mục gốc dự án:

```bash
# Kiểm tra cấu hình Compose
docker compose config

# Build image và chạy toàn bộ hệ thống
docker compose up -d --build

# Kiểm tra trạng thái container
docker compose ps

# Xem log Backend
docker compose logs -f backend

# Xem log Frontend
docker compose logs -f frontend

# Dừng container nhưng giữ database volume
docker compose down
```

### Địa chỉ truy cập

| Thành phần | Địa chỉ |
|---|---|
| React Web | `http://localhost:3000` |
| Backend API qua Nginx | `http://localhost:3000/api/v1` |
| Backend từ container cùng network | `http://backend:8080` |
| MySQL từ máy host | `localhost:3307` |

> `docker compose down -v` sẽ xóa volume database và có thể làm mất dữ liệu. Chỉ sử dụng khi bạn thực sự muốn xóa dữ liệu phát triển.

## 11. Kế hoạch triển khai theo giai đoạn

Ước tính cho một người làm: khoảng 10–15 ngày làm việc, chưa tính thời gian học các công nghệ chưa quen.

### Giai đoạn 1 — Khởi tạo dự án (0,5–1 ngày)

- [ ] Tạo Spring Boot project và React/Vite project.
- [ ] Cấu hình Java 17, MySQL, CORS và biến môi trường.
- [ ] Thiết kế ERD và tạo bảng database.
- [ ] Tạo Git repository và `.gitignore`.

### Giai đoạn 2 — CRUD cơ bản (2–3 ngày)

- [ ] Tạo Entity, Repository, Service và Controller.
- [ ] CRUD Department và Position.
- [ ] CRUD Account, validate và xử lý lỗi.
- [ ] Tìm kiếm, lọc, phân trang và kiểm tra khóa ngoại.

### Giai đoạn 3 — Authentication & Security (2–3 ngày)

- [ ] Đăng nhập và hash mật khẩu bằng BCrypt.
- [ ] Cấu hình Spring Security và JWT filter.
- [ ] Phân quyền ADMIN/USER ở Backend.
- [ ] API profile, đổi mật khẩu và xử lý 401/403.

### Giai đoạn 4 — SMTP reset password (1–2 ngày)

- [ ] Cấu hình JavaMailSender và SMTP.
- [ ] Sinh token reset an toàn và lưu hash token.
- [ ] Tạo API yêu cầu reset và đặt lại mật khẩu.
- [ ] Kiểm thử token hết hạn, dùng lại và giới hạn yêu cầu.

### Giai đoạn 5 — Frontend (3–4 ngày)

- [ ] Xây dựng layout, sidebar, header và routing.
- [ ] Màn hình login, dashboard và Account CRUD.
- [ ] Màn hình Department và Position CRUD.
- [ ] Màn hình quên mật khẩu, reset và profile.
- [ ] Tích hợp Axios, loading, validate và thông báo lỗi.

### Giai đoạn 6 — Docker (1–2 ngày, có thể làm song song)

- [ ] Cài Docker Desktop và kiểm tra Docker Compose.
- [ ] Viết Dockerfile multi-stage cho Backend Java 17.
- [ ] Viết Dockerfile và Nginx config cho React.
- [ ] Cấu hình Compose, network và MySQL volume.
- [ ] Thiết lập healthcheck và thứ tự khởi động.
- [ ] Chạy hệ thống bằng `docker compose up --build`.
- [ ] Kiểm tra SMTP, JWT, CRUD và dữ liệu sau khi restart container.

### Giai đoạn 7 — Kiểm thử & hoàn thiện (1–2 ngày)

- [ ] Test API bằng Postman và kiểm tra quyền.
- [ ] Test dữ liệu trùng, lỗi validation và xóa dữ liệu đang được sử dụng.
- [ ] Kiểm thử end-to-end trên giao diện.
- [ ] Viết README và hướng dẫn cấu hình SMTP, chạy Docker.

## 12. Tiêu chí nghiệm thu

- [ ] CRUD của Account, Department và Position hoạt động đầy đủ.
- [ ] Username/email trùng bị từ chối ở cả ứng dụng và database.
- [ ] Account không thể tham chiếu Department/Position không tồn tại.
- [ ] USER không gọi được API quản trị, kể cả khi dùng Postman.
- [ ] Password được hash bằng BCrypt và không xuất hiện trong response.
- [ ] JWT không hợp lệ hoặc hết hạn bị từ chối; phân biệt 401 và 403.
- [ ] Email reset password được gửi qua SMTP.
- [ ] Token reset hết hạn và chỉ sử dụng một lần.
- [ ] Đổi mật khẩu thành công khiến mật khẩu cũ không còn đăng nhập được.
- [ ] Frontend xử lý loading, lỗi API, phân trang và xác nhận trước khi xóa.
- [ ] Có README hướng dẫn chạy Backend, Frontend, database và SMTP.
- [ ] Toàn bộ hệ thống có thể khởi chạy bằng Docker Compose.
- [ ] Dữ liệu MySQL vẫn tồn tại sau khi container được tạo lại.

## 13. Thứ tự code khuyến nghị

1. Department CRUD: hoàn thiện một luồng từ Entity tới giao diện.
2. Position CRUD: tái sử dụng cấu trúc code.
3. Account CRUD: xử lý khóa ngoại, tìm kiếm và phân trang.
4. JWT + Spring Security: bảo vệ API và phân quyền.
5. SMTP reset password: hoàn thiện luồng quên mật khẩu.
6. Docker hóa toàn bộ hệ thống.
7. Kiểm thử, viết README và hoàn thiện UI.

Làm theo thứ tự này giúp hiểu rõ mô hình 3 layer, dependency injection, JPA, DTO, transaction và Spring Security thay vì chỉ ghép code có sẵn.

## 14. Ghi chú bảo mật và triển khai

- Không commit `.env`, SMTP password, JWT secret hoặc thông tin nhạy cảm.
- Không dùng cấu hình phát triển trực tiếp cho production.
- Không mở MySQL ra mạng công cộng nếu không cần.
- Dùng HTTPS khi triển khai có người dùng thực.
- Cân nhắc refresh token, cookie `HttpOnly`/`Secure`/`SameSite`, CSRF và chính sách thu hồi token trước khi đưa hệ thống lên production.
- Thêm logging nhưng không ghi password, JWT hoặc reset token nguyên bản vào log.
- Cấu hình backup database nếu dữ liệu quan trọng.
