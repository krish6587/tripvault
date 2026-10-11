# TripVault ✈️

> A full-stack travel memory journal built as part of the **CodGen Full Stack (MERN) Internship — Week 2 (Trip Management & CRUD Operations)**.

TripVault enables travelers to securely manage their journeys: creating trips with destinations, dates, notes, and optional ratings; viewing their personal travel history; updating trip details; and removing unwanted entries. All operations are secured using JWT authentication, user-specific data isolation, and strict ownership validation.

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
- **CORS Support:** [cors](https://www.npmjs.com/package/cors) (supports localhost, custom client URLs, and local network devices)

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) (with `--host` network broadcasting enabled)
- **Client Routing:** [React Router DOM (v6)](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) (with centralized interceptors & dynamic LAN host detection in `src/api.js`)
- **Styling:** Clean Vanilla CSS (Responsive cards, modal dialogs, star ratings, empty states, and loading spinners)

---

## ✨ Features

### Week 1 — Authentication & Security Engine
- **Secure User Registration:** Validates field types and email formats with regex, enforces strong passwords, prevents duplicate accounts (409 Conflict), and safely hashes passwords with bcrypt before saving.
- **JWT-Based Authentication:** Authenticates credentials, verifies passwords against bcrypt hashes, and issues signed JSON Web Tokens for session management.
- **Route Guarding:** Frontend protected route wrapper (`ProtectedRoute.jsx`) and backend `authMiddleware.js`.
- **Centralized API Client:** Automatic Bearer token attachment on every authenticated request and global 401 interceptor handling.
- **Security Headers & Rate Limiting:** Helmet security headers and rate limiting on sensitive routes.

### Week 2 — Trip Management (CRUD Operations)
- **Trip Data Model:** Mongoose schema supporting `title`, `destination`, `startDate`, `endDate`, `description`, `rating` (1–5 or unrated), and `user` reference (`ObjectId` ref: `'User'`) with automatic timestamps.
- **Create Trip (`POST /api/trips`):** Creates a trip linked to the authenticated user's ID with field validation and date chronology validation.
- **Read All Trips (`GET /api/trips`):** Returns only the trips owned by the logged-in user, sorted newest first (`createdAt: -1`).
- **Read Single Trip (`GET /api/trips/:id`):** Fetches single trip by MongoDB ID with strict ownership verification (403 Forbidden for unauthorized access, 404 for missing trips, 400 for invalid ID format).
- **Update Trip (`PUT /api/trips/:id`):** Updates existing trip fields with ownership check before saving.
- **Delete Trip (`DELETE /api/trips/:id`):** Permanently removes a trip after verifying ownership.
- **Optional Star Rating:** Supports 1 to 5 star ratings as well as a "No rating (Unrated)" option.
- **Responsive Dashboard:** Lists trips as responsive cards with star ratings or unrated tags, destination badges, formatted date ranges, loading spinners, and error alerts.
- **Reusable TripForm Modal:** Single reusable form component for both Create and Edit operations with automatic input pre-filling in edit mode.
- **Deletion Confirmation:** Interactive prompt (`window.confirm()`) before trip removal with automatic UI refresh.
- **Empty State UI:** Friendly call-to-action view when the user has no trips logged yet.
- **Multi-Device & Mobile Access:** Vite is preconfigured with `host: true` and Axios dynamically resolves local network IPs, allowing phones, tablets, and laptops on the same Wi-Fi to test seamlessly.

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
│   ├── vite.config.js                   # Host broadcasting enabled
│   └── src/
│       ├── api.js                       # Centralized Axios client with dynamic LAN host detection
│       ├── App.jsx                      # App routes & dynamic route guards
│       ├── index.css                    # Design system & responsive styles
│       ├── main.jsx                     # React entry point
│       ├── components/
│       │   ├── ProtectedRoute.jsx       # Route protection guard
│       │   ├── TripCard.jsx             # Card display with ratings and actions
│       │   └── TripForm.jsx             # Reusable Create/Edit modal with optional rating
│       └── pages/
│           ├── Dashboard.jsx            # Trip management dashboard & user greeting
│           ├── Login.jsx                # User login page
│           └── Register.jsx             # User registration page with strength indicator
│
└── server/
    ├── .env                             # Environment secrets (ignored in git)
    ├── .env.example                     # Environment template
    ├── .gitignore
    ├── index.js                         # Express server, Helmet, CORS, Rate Limiting
    ├── package.json
    ├── test-backend.js                  # 14-step automated test verification suite
    ├── controllers/
    │   └── tripController.js            # Clean Trip CRUD logic & shared ownership validation
    ├── middleware/
    │   └── authMiddleware.js            # JWT verification middleware
    ├── models/
    │   ├── Trip.js                      # Trip Mongoose schema
    │   └── User.js                      # User Mongoose model
    └── routes/
        ├── auth.js                      # Register, Login, and Me route handlers
        └── tripRoutes.js                # Protected Trip CRUD routes
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

## 📱 Accessing from Mobile or Any Device (Same Wi-Fi)

1. Make sure your computer and mobile phone/tablet are connected to the same Wi-Fi network.
2. Find your computer's local IP address (e.g., `10.174.101.242` or `192.168.1.x`).
3. Open the browser on your phone and visit:
   ```text
   http://<YOUR_LOCAL_IP>:5173/
   # Example: http://10.174.101.242:5173/
   ```
4. The client automatically routes API requests to `http://<YOUR_LOCAL_IP>:5000/api`, and backend CORS permits LAN requests seamlessly.

---

## 📡 API Endpoints Reference

### Authentication Endpoints
| Method | Endpoint | Description | Status Code | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | `201 Created` / `400` / `409` | No (Public) |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | `200 OK` / `400` | No (Public) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | `200 OK` / `401` | **Yes (`Bearer <token>`)** |
| `GET` | `/` | Health check & server status | `200 OK` | No (Public) |

### Trip Management Endpoints (Week 2)
| Method | Endpoint | Description | Status Code | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/trips` | Create a new trip for authenticated user | `201 Created` / `400` | **Yes (`Bearer <token>`)** |
| `GET` | `/api/trips` | Get all trips for logged-in user (newest first) | `200 OK` | **Yes (`Bearer <token>`)** |
| `GET` | `/api/trips/:id` | Get single trip by ID (must belong to user) | `200 OK` / `400` / `403` / `404` | **Yes (`Bearer <token>`)** |
| `PUT` | `/api/trips/:id` | Update trip fields (owner only) | `200 OK` / `400` / `403` / `404` | **Yes (`Bearer <token>`)** |
| `DELETE` | `/api/trips/:id` | Delete a trip (owner only) | `200 OK` / `400` / `403` / `404` | **Yes (`Bearer <token>`)** |

---

## 📬 Example API Requests & Payloads

### 1. Create Trip: `POST /api/trips`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Body (`JSON`):**
```json
{
  "title": "Summer Vacation in Kyoto",
  "destination": "Kyoto, Japan",
  "startDate": "2026-06-10",
  "endDate": "2026-06-20",
  "description": "Explored Fushimi Inari Shrine, bamboo grove in Arashiyama, and enjoyed authentic matcha tea.",
  "rating": 5
}
```
*(Note: `rating` is optional. Pass `null` or omit it to save an unrated trip).*

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Trip created successfully.",
  "trip": {
    "_id": "6ac7575ff4d99a0920b58991",
    "title": "Summer Vacation in Kyoto",
    "destination": "Kyoto, Japan",
    "startDate": "2026-06-10T00:00:00.000Z",
    "endDate": "2026-06-20T00:00:00.000Z",
    "description": "Explored Fushimi Inari Shrine, bamboo grove in Arashiyama, and enjoyed authentic matcha tea.",
    "rating": 5,
    "user": "69ddda08e9ca85d0db2d64f0",
    "createdAt": "2026-10-08T08:30:00.000Z",
    "updatedAt": "2026-10-08T08:30:00.000Z"
  }
}
```

### 2. Get All Trips: `GET /api/trips`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 1,
  "trips": [
    {
      "_id": "6ac7575ff4d99a0920b58991",
      "title": "Summer Vacation in Kyoto",
      "destination": "Kyoto, Japan",
      "startDate": "2026-06-10T00:00:00.000Z",
      "endDate": "2026-06-20T00:00:00.000Z",
      "description": "Explored Fushimi Inari Shrine...",
      "rating": 5,
      "user": "69ddda08e9ca85d0db2d64f0",
      "createdAt": "2026-10-08T08:30:00.000Z"
    }
  ]
}
```

### 3. Get Single Trip: `GET /api/trips/:id`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Response (`200 OK`):**
```json
{
  "success": true,
  "trip": {
    "_id": "6ac7575ff4d99a0920b58991",
    "title": "Summer Vacation in Kyoto",
    "destination": "Kyoto, Japan",
    "startDate": "2026-06-10T00:00:00.000Z",
    "endDate": "2026-06-20T00:00:00.000Z",
    "description": "Explored Fushimi Inari Shrine...",
    "rating": 5,
    "user": "69ddda08e9ca85d0db2d64f0"
  }
}
```

### 4. Update Trip: `PUT /api/trips/:id`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Body (`JSON`):**
```json
{
  "title": "Summer in Kyoto & Osaka",
  "destination": "Kyoto & Osaka, Japan",
  "rating": 5,
  "description": "Added Osaka food tour in Dotonbori."
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Trip updated successfully.",
  "trip": {
    "_id": "6ac7575ff4d99a0920b58991",
    "title": "Summer in Kyoto & Osaka",
    "destination": "Kyoto & Osaka, Japan",
    "rating": 5,
    "description": "Added Osaka food tour in Dotonbori."
  }
}
```

### 5. Delete Trip: `DELETE /api/trips/:id`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Trip deleted successfully."
}
```

---

## 🧪 Running Automated Backend Tests

The repository includes a comprehensive 14-step automated verification suite testing Auth, protected routes, CRUD lifecycle, data isolation, and ownership security:

```bash
cd server
npm test
```

---

## 🛡️ Security & Architecture

1. **Strict User Data Isolation:** Queries on `GET /api/trips` filter strictly by `{ user: req.user.id }`.
2. **Ownership Validation:** `GET /:id`, `PUT /:id`, and `DELETE /:id` verify `trip.user.toString() === req.user.id` returning `403 Forbidden` on unauthorized access attempts.
3. **Mongoose Schema Safeguards:** Required constraints on title, destination, user ID, and `min: 1`, `max: 5` validation on ratings when provided.
4. **JWT Bearer Token Guard:** Every trip endpoint is protected by `authMiddleware` rejecting requests without valid Bearer tokens (`401 Unauthorized`).
5. **Axios Centralized Interceptor:** Frontend client automatically attaches Bearer tokens, dynamically resolves LAN host IPs, and handles automatic session expiration.
6. **Optimized DRY Architecture:** Shared validation and authorization helpers avoid code duplication and keep business logic modular and maintainable.

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
