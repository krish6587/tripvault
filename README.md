# TripVault ✈️

> A secure, full-stack travel memory journal built as part of the **CodGen Full Stack Internship Week 1**.

TripVault provides authentication architecture for travelers to safely create accounts, sign in, and access their personalized protected travel dashboard using JSON Web Tokens (JWT) and MongoDB.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (with [Mongoose ODM](https://mongoosejs.com/))
- **Password Hashing:** [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Authentication:** [jsonwebtoken (JWT)](https://www.npmjs.com/package/jsonwebtoken)
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)
- **CORS Support:** [cors](https://www.npmjs.com/package/cors)

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Client Routing:** [React Router DOM (v6)](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Styling:** Custom Modern Vanilla CSS (Inter typography, responsive cards, glassmorphic accents)

---

## ✨ Features

- **Secure User Registration:** Validates input data, prevents duplicate accounts, and safely hashes passwords with bcrypt before saving.
- **JWT-Based Authentication:** Authenticates credentials and issues signed JSON Web Tokens for session management.
- **Protected Dashboard Route:** Frontend and backend route guarding—unauthenticated users are redirected to login.
- **Automatic Token Handling:** Securely stores token in browser `localStorage`, includes it in request headers, and wipes it upon logout or expiration.
- **Responsive & Modern UI:** Clean, mobile-friendly interface with loading states and user-friendly error banners.

---

## 📁 Folder Structure

```text
tripvault/
├── .gitignore
├── README.md
│
├── client/
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Login.jsx
│           └── Register.jsx
│
└── server/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── index.js
    ├── package.json
    ├── test-backend.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   └── User.js
    └── routes/
        └── auth.js
```

---

## 🔐 Environment Variables

The backend requires the following environment variables. Create a `.env` file in the `server/` directory using the provided `server/.env.example` template:

```env
# server/.env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tripvault?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

> **Security Note:** `.env` files are added to `.gitignore` and are never committed to version control.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- A MongoDB Atlas database connection string (or local MongoDB)

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
Create your `.env` configuration file in `server/`:
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

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private (Bearer Token) |
| `GET` | `/` | Health check & server status | Public |

### Example API Payloads

#### 1. Register: `POST /api/auth/register`
**Request Body:**
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
**Request Body:**
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
[ POST /api/auth/register ] ───► Hashes Password with bcryptjs ───► Saves User to MongoDB
         │
         ▼
[ POST /api/auth/login ]    ───► Compares Hashes ───► Generates & Returns JWT Token
         │
         ▼
[ Client / Browser ]        ───► Stores JWT Token in localStorage
         │
         ▼
[ GET /api/auth/me ]        ───► Sends "Authorization: Bearer <token>"
         │
         ├──► Token Valid?   ───► Returns User Info ──► Renders Dashboard
         └──► Token Invalid? ───► 401 Unauthorized   ──► Redirects to /login
```

---

## 🧪 Running Backend Automated Verification

The backend includes an automated test verification suite:
```bash
cd server
npm test
```

---

## 🛡️ Security Best Practices Implemented

1. **Password Hashing:** Passwords are never stored in plaintext. `bcryptjs` salts and hashes passwords before database insertion.
2. **JWT Route Guard:** Protected backend routes use `authMiddleware` to verify signatures and expiration.
3. **Information Hiding:** Password fields are explicitly excluded when querying profiles with `.select('-password')`.
4. **Environment Isolation:** Secrets (`MONGO_URI`, `JWT_SECRET`) are kept in unversioned `.env` files.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
