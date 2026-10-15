




# SWIFT MT Message Generator and Management System

A full-stack banking web application for creating, previewing, saving, and inquiring **SWIFT MT103** (Single Customer Credit Transfer) messages.

---

## Architecture & Tech Stack

- **Frontend**: React 18 (JavaScript + CSS), React Router v6, Axios, React Hot Toast
- **Backend**: Java (Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, Jakarta Bean Validation)
- **Database**: MySQL 8.0+ (with automatic persistent file-based MySQL-mode fallback `./data/swift_mt_db` if a local MySQL daemon is not running on port 3306)
- **Build Tools**: Maven (`pom.xml`) & npm (`package.json`)

---

## Project Structure

```text
swift-mt-application/
├── backend/
│   ├── src/main/java/com/swiftmt/app/
│   │   ├── config/          # SecurityConfig, JwtUtil, JwtAuthFilter, DataInitializer, GlobalExceptionHandler
│   │   ├── controller/      # AuthController, SwiftMessageController
│   │   ├── dto/             # LoginRequest/Response, SwiftMessageRequest/Response, ApiResponse, PagedResponse
│   │   ├── entity/          # User, SwiftMessage, MessageType
│   │   ├── repository/      # UserRepository, SwiftMessageRepository, MessageTypeRepository
│   │   ├── service/         # AuthService, SwiftMessageService, Mt103GeneratorService, UserDetailsServiceImpl
│   │   └── SwiftMtApplication.java
│   ├── src/main/resources/application.properties
│   ├── src/test/java/com/swiftmt/app/SwiftMtApplicationTests.java
│   └── pom.xml
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── components/      # Layout.jsx, Layout.css
│   │   ├── pages/           # LoginPage, DashboardPage, CreateMessagePage, MessageInquiryPage, MessageDetailPage
│   │   ├── services/        # api.js, authService.js, messageService.js
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── database/
│   ├── schema.sql
│   └── sample-data.sql
└── README.md
```

---

## Quick Start (How to Run)

### Prerequisites
- **Java 17+** (tested up to Java 26)
- **Maven 3.8+**
- **Node.js 18+ & npm**
- **MySQL 8.0+** *(Optional for immediate local startup: if MySQL is running on `localhost:3306`, the backend connects to MySQL and auto-creates `swift_mt_db`. If MySQL is not running, the backend automatically uses a persistent local file store `./data/swift_mt_db` in MySQL compatibility mode so you can run the app immediately without errors.)*

### 1. Database Setup (When Using MySQL Server)
If you have MySQL running locally:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample-data.sql
```
*(Note: The Spring Boot `DataInitializer` also automatically seeds the demo users, message types, and sample MT103 messages on startup if the tables are empty.)*

### 2. Start the Spring Boot Backend (Port 8080)
Open a terminal in `swift-mt-application/backend`:
```bash
cd swift-mt-application/backend
mvn spring-boot:run
```

### 3. Start the React Frontend (Port 3000)
Open a second terminal in `swift-mt-application/frontend`:
```bash
cd swift-mt-application/frontend
npm install
npm start
```
Then open **http://localhost:3000** in your browser.

---

## Demo Login Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` |
| **SWIFT Operator** | `operator` | `Operator@123` |

---

## Environment Variables (Optional)

You can customize the backend connection via environment variables:
- `MYSQL_HOST` (default: `localhost`)
- `MYSQL_PORT` (default: `3306`)
- `MYSQL_USER` (default: `root`)
- `MYSQL_PASSWORD` (default: `root`)
- `SPRING_DATASOURCE_URL` (overrides the full JDBC URL)
- `JWT_SECRET` (256-bit HMAC-SHA256 secret key)
- `CORS_ALLOWED_ORIGINS` (default: `http://localhost:3000`)

---

## REST API Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT |
| `POST` | `/api/auth/logout` | No | Stateless logout endpoint |
| `GET` | `/api/messages/dashboard` | Yes (Bearer JWT) | Dashboard summary counts and message types |
| `GET` | `/api/messages/types` | Yes (Bearer JWT) | Enabled SWIFT MT message types |
| `POST` | `/api/messages/preview` | Yes (Bearer JWT) | Validate fields & generate MT103 preview text |
| `POST` | `/api/messages` | Yes (Bearer JWT) | Validate, generate, and save MT103 message |
| `GET` | `/api/messages` | Yes (Bearer JWT) | Paginated inquiry (`reference`, `messageType`, `fromDate`, `toDate`, `page`, `size`) |
| `GET` | `/api/messages/{id}` | Yes (Bearer JWT) | Retrieve full message details by database ID |
| `GET` | `/api/messages/search?reference=...` | Yes (Bearer JWT) | Retrieve a message by exact `:20:` reference |

---

## Sample Generated MT103 Message

```text
{1:F01DEUTDEDBXXXAXXX0000000000}
{2:I103CHASUS33XXXAXXXN}
{3:{108:REF20261012001}}
{4:
:20:REF20261012001
:23B:CRED
:32A:261012USD15000,00
:50K:/DE89370400440532013000
JOHN DOE
123 MAIN ST
BERLIN GERMANY
:59:/US33CHAS0002012345678901
JANE SMITH
456 PARK AVE
NEW YORK US
:70:INVOICE INV-2026-001 PAYMENT
:71A:SHA
-}

*** EDUCATIONAL PREVIEW — NOT VALIDATED FOR ACTUAL SWIFT NETWORK TRANSMISSION ***
*** This message format is for demonstration purposes only. ***
```

---

## Troubleshooting

- **Port 8080 or 3000 already in use**: Stop any existing process on that port or set `SERVER_PORT` / `PORT`.
- **MySQL Connection Refused**: Ensure MySQL Server is running on `localhost:3306` and credentials match `MYSQL_USER`/`MYSQL_PASSWORD`. If MySQL is not running, the backend automatically falls back to `./data/swift_mt_db` on disk so you can still use and test all features with full persistence.
