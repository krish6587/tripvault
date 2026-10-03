# TripVault ✈️

> A secure, full-stack travel memory journal built as part of the **CodGen Full Stack Internship Week 1**.

TripVault provides a production-grade authentication architecture for travelers to safely create accounts, sign in, and access their personalized protected travel dashboard using JSON Web Tokens (JWT) and MongoDB Atlas.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (with [Mongoose ODM](https://mongoosejs.com/))
- **Security:** [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- **Password Hashing:** [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Authentication:** [jsonwebtoken (JWT)](https://www.npmjs.com/package/jsonwebtoken)
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)
- **CORS Support:** [cors](https://www.npmjs.com/package/cors)

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Client Routing:** [React Router DOM (v6)](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) (with centralized interceptors in `src/api.js`)
- **Styling:** Modern Vanilla CSS (Inter typography, responsive cards, glassmorphic accents)

---

## ✨ Features

- **Secure User Registration:** Validates field types and email formats with regex, prevents duplicate accounts (409 Conflict), and safely hashes passwords with bcrypt before saving.
- **JWT-Based Authentication:** Authenticates credentials, verifies passwords against bcrypt hashes, and issues signed JSON Web Tokens for session management.
- **Protected Dashboard Route:** Frontend and backend route guarding—unauthenticated users or users with invalid tokens are automatically redirected to login.
- **Centralized API Client:** Automatic Bearer token attachment on every authenticated request and global 401 interceptor handling.
- **Production-Grade Security:** HTTP headers protection with `helmet`, IP rate limiting on auth routes, and strict CORS configuration.
- **Responsive & Modern UI:** Clean, mobile-friendly interface with loading states, active session indicators, and user-friendly error banners.

---

## 📁 Folder Structure

```text
tripvault/
├── .gitignore
├── LICENSE
├── README.md
│
├── client/
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api.js                       # Centralized Axios client with JWT interceptors
│       ├── App.jsx                      # App routes & dynamic route guards
│       ├── index.css                    # Design system & responsive styles
│       ├── main.jsx                     # React entry point
│       ├── components/
│       │   └── ProtectedRoute.jsx       # Route protection guard
│       └── pages/
│           ├── Dashboard.jsx            # Protected user dashboard & logout
│           ├── Login.jsx                # User login page
│           └── Register.jsx             # User registration page
│
└── server/
    ├── .env                             # Environment secrets (ignored in git)
    ├── .env.example                     # Environment template
    ├── .gitignore
    ├── index.js                         # Express server, Helmet, CORS, Rate Limiting
    ├── package.json
    ├── test-backend.js                  # Automated test verification suite
    ├── middleware/
    │   └── authMiddleware.js            # JWT verification middleware
    ├── models/
    │   └── User.js                      # User Mongoose model
    └── routes/
        └── auth.js                      # Register, Login, and Me route handlers
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory using the provided `server/.env.example` template:

```env
# server/.env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tripvault?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

> **Security Note:** `.env` files are included in `.gitignore` and are never committed to version control.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- A MongoDB Atlas database connection string

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd tripvault
```

### 2. Backend Setup
```bash
cd server
npm install
```
Configure your `.env` file in `server/`:
```bash
cp .env.example .env
```
*(Open `.env` and fill in your `MONGO_URI` and `JWT_SECRET`).*

### 3. Frontend Setup
```bash
cd ../client
npm install
```

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd server
npm run dev
```
> The API server will start on **`http://localhost:5000`**.

### Start Frontend Client
```bash
cd client
npm run dev
```
> The Vite development server will start on **`http://localhost:5173`**.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Status Code | Access |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `201 Created` / `400` / `409` | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | `200 OK` / `400` | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | `200 OK` / `401` | Private (Bearer Token) |
| `GET` | `/` | Health check & server status | `200 OK` | Public |

### Example Payloads

#### 1. Register: `POST /api/auth/register`
**Request:**
```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "mypassword123"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully! You can now log in.",
  "user": {
    "id": "69ddda08e9ca85d0db2d64f0",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-10-01T05:52:16.732Z"
  }
}
```

#### 2. Login: `POST /api/auth/login`
**Request:**
```json
{
  "email": "alex@example.com",
  "password": "mypassword123"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69ddda08e9ca85d0db2d64f0",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

#### 3. User Profile: `GET /api/auth/me`
**Header:** `Authorization: Bearer <token>`  
**Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "_id": "69ddda08e9ca85d0db2d64f0",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-10-01T05:52:16.732Z",
    "updatedAt": "2026-10-01T05:52:16.732Z"
  }
}
```

---

## 🔄 Authentication Flow

```text
[ User Enters Details ]
         │
         ▼
[ POST /api/auth/register ] ───► Hashes Password with bcryptjs ───► Saves User to MongoDB Atlas
         │
         ▼
[ POST /api/auth/login ]    ───► Compares Hashes ───► Generates & Returns JWT Token
         │
         ▼
[ Client / Browser ]        ───► Stores JWT Token in localStorage
         │
         ▼
[ GET /api/auth/me ]        ───► Axios Interceptor adds "Authorization: Bearer <token>"
         │
         ├──► Token Valid?   ───► Returns User Profile ──► Renders Dashboard
         └──► Token Invalid? ───► 401 Unauthorized     ──► Interceptor clears token & redirects to /login
```

---

## 🧪 Running Automated Tests

The backend includes an automated test verification suite:
```bash
cd server
npm test
```

---

## 🛡️ Security Best Practices

1. **Password Hashing:** Passwords are cryptographically salted and hashed using `bcryptjs` with salt rounds = 10.
2. **JWT Authentication:** Stateful user authentication via signed JWTs with expiration.
3. **Helmet Protection:** Standard security headers enabled to protect against common web vulnerabilities.
4. **Rate Limiting:** Auth endpoints are throttled using `express-rate-limit` to protect against brute-force attacks.
5. **CORS Restrictions:** Express only accepts requests from the designated client origin.
6. **Information Privacy:** Mongoose queries explicitly exclude password fields using `.select('-password')`.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
