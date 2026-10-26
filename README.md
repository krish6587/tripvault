# TripVault ✈️

> A modern, full-stack travel memory journal built with the **MERN Stack** (MongoDB, Express, React 18, Node.js) featuring Cloudinary photo storage, public traveler profiles, Google OAuth, and secure JWT authentication.

TripVault enables travelers to record and share their adventures: create trips with rich destinations, dates, notes, and star ratings; upload photos directly to Cloudinary; showcase cover images and interactive photo galleries with lightbox view; and share public user profile pages where anyone can explore a traveler's logged journeys without requiring an account.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose ODM](https://mongoosejs.com/)
- **Cloud Storage:** [Cloudinary](https://cloudinary.com/) (Node.js SDK v2)
- **File Upload Parsing:** [Multer](https://github.com/expressjs/multer) & [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)
- **Authentication:** [jsonwebtoken (JWT)](https://www.npmjs.com/package/jsonwebtoken) & [Google Auth Library](https://www.npmjs.com/package/google-auth-library)
- **Security:** [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Testing:** [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) (isolated 17-check test suite)
- **Environment & CORS:** [dotenv](https://www.npmjs.com/package/dotenv), [cors](https://www.npmjs.com/package/cors)

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router DOM (v6)](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) (with centralized interceptors & dynamic LAN host detection)
- **Styling:** Premium Vanilla CSS (Responsive design, photo grid, lightbox modal, public profile hero banner, cover badges, and form previews)
- **Icons:** Modern UTF-8 vector icons & accessible micro-interactions

---

## ✨ Feature Highlights

### 📸 Cloudinary Photo Uploads & Galleries
- **Direct Cloud Uploads:** Upload high-resolution trip photos directly to Cloudinary via Multer with 5MB file-size limits and image mime-type validation.
- **Instant Client Previews:** Instant client-side photo previews (`URL.createObjectURL`) on Create and Edit Trip forms before submission.
- **Cover Image & Badges:** Automatically assigns the first uploaded image as the trip's cover banner, with photo count badges (`📸 3 photos`) and star ratings.
- **Lightbox Photo Gallery:** Dedicated Trip Detail page (`/trips/:id`) featuring an interactive responsive photo grid with a full-screen lightbox modal and direct photo uploader.

### 🌐 Public Traveler Profiles
- **Public Profile Page (`/profile/:username`):** Anyone can view a traveler's public profile and adventures without logging in or having an account.
- **Strict Privacy Safeguards:** Public profile endpoints strictly expose safe public fields (`name`, `username`, `bio`, `avatar`, and trip list), completely stripping sensitive data (`password`, `email`).
- **Profile Management:** Logged-in users can update their bio (up to 300 characters), name, and unique username handle directly from their dashboard modal with automatic uniqueness checks.
- **Travel Stats:** Automatically calculates destinations visited, total trips logged, and photos shared.

### 🔐 Authentication & Security
- **JWT & Password Security:** Strong password enforcement regex, bcrypt hashing (10 salt rounds), and HTTP Bearer token verification.
- **Google OAuth 2.0:** One-tap sign in / sign up with Google authentication.
- **Data Isolation & Route Guards:** Strict database-level query isolation (`user: req.user.id`) and 403 Forbidden enforcement preventing unauthorized cross-user modifications.
- **Security Headers & Rate Limiting:** Helmet security headers and IP rate limiting on API endpoints.

---

## 🔌 API Routes Reference

### Authentication Endpoints
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user with username, name, email, password |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT token |
| `POST` | `/api/auth/google` | No | Sign in / register using Google OAuth ID token |
| `GET` | `/api/auth/me` | **Yes** | Fetch current authenticated user's profile |
| `GET` | `/` | No | Server health check |

### Trip Management Endpoints
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/trips` | **Yes** | Create a new trip for logged-in user |
| `GET` | `/api/trips` | **Yes** | Fetch all trips belonging to logged-in user (newest first) |
| `GET` | `/api/trips/:id` | **Yes** | Fetch single trip by ID (ownership verified) |
| `PUT` | `/api/trips/:id` | **Yes** | Update trip details (ownership verified) |
| `DELETE` | `/api/trips/:id` | **Yes** | Delete trip (ownership verified) |
| `POST` | `/api/trips/:id/upload` | **Yes** | Upload photo to Cloudinary and attach URL to trip |

### User & Public Profile Endpoints
| Method | Route | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/users/:username/profile` | No | Public profile: user info + trips (safe fields only) |
| `PUT` | `/api/users/profile` | **Yes** | Update logged-in user's username, bio, or name |

---

## 🧪 Automated Test Suite (17 Verification Checks)

TripVault includes an automated test verification suite running on an isolated in-memory MongoDB server. To execute all 17 tests:

```bash
# Run from root:
npm test

# Or run from server directory:
cd server
npm test
```

All 17 checks verify:
1. Isolated MongoDB In-Memory Server Initialization
2. User Registration (User 1 & User 2 with unique handles)
3. Unauthenticated Trip Access Prevention (`401 Unauthorized`)
4. Empty Title/Destination Validation (`400 Bad Request`)
5. Invalid Rating Validation (`400 Bad Request`)
6. Valid Trip Creation for User 1
7. User Trips Sorting (Newest First)
8. User Data Isolation (User 2 sees 0 of User 1's trips)
9. Single Trip Retrieval by Owner
10. Cross-User Read Access Forbidden (`403 Forbidden`)
11. Cross-User Update Access Forbidden (`403 Forbidden`)
12. Cross-User Delete Access Forbidden (`403 Forbidden`)
13. Owner Trip Update (`200 OK`)
14. Owner Trip Deletion & 404/400 Validation
15. **Photo Upload to Trip via Multer + Cloudinary (`POST /api/trips/:id/upload`)**
16. **Public Profile Route (`GET /api/users/:username/profile`) — No Auth, Safe Fields Only, Passwords & Emails Excluded**
17. **Profile Update (`PUT /api/users/profile`) — Unauthenticated 401 & Authenticated Bio/Username Update**

---

## 📁 Project Folder Structure

```text
tripvault/
├── package.json                         # Root package with concurrently dev script
├── .gitignore                           # Git ignore rules
├── LICENSE                              # ISC License
├── README.md                            # Comprehensive project documentation
│
├── client/                              # Frontend React + Vite application
│   ├── .env.example                     # Client environment template
│   ├── index.html                       # HTML template with Google Fonts & Meta tags
│   ├── package.json                     # Client dependencies & scripts
│   ├── vite.config.js                   # Vite configuration (server port 5173)
│   └── src/
│       ├── api.js                       # Axios client with JWT interceptor & LAN detection
│       ├── App.jsx                      # Client router (/login, /register, /dashboard, /trips/:id, /profile/:username)
│       ├── index.css                    # Design system, responsive grid, profile banner & lightbox modal
│       ├── main.jsx                     # React DOM entry point
│       ├── components/
│       │   ├── ProtectedRoute.jsx       # Route guard for authenticated pages
│       │   ├── TripCard.jsx             # Card with cover image, photo count badge & rating
│       │   └── TripForm.jsx             # Create/Edit modal with photo upload & preview
│       └── pages/
│           ├── Dashboard.jsx            # Main dashboard with trip grid, "My Profile" & "Edit Profile"
│           ├── PublicProfile.jsx        # Public traveler profile (accessible without login)
│           ├── TripDetails.jsx          # Trip detail view with photo gallery grid & lightbox modal
│           ├── Login.jsx                # User login page with standard & Google login
│           └── Register.jsx             # User registration with username handle selection
│
└── server/                              # Backend Node.js + Express API
    ├── .env.example                     # Backend environment template
    ├── index.js                         # Express server entry point & route registration
    ├── package.json                     # Server dependencies & test script
    ├── test-backend.js                  # 17-step automated in-memory verification suite
    ├── controllers/
    │   ├── tripController.js            # Trip CRUD + uploadTripPhoto controller
    │   └── userController.js            # Public profile & user profile update controller
    ├── middleware/
    │   ├── authMiddleware.js            # JWT verification & req.user attachment
    │   └── upload.js                    # Multer + Cloudinary storage upload middleware
    ├── models/
    │   ├── Trip.js                      # Trip schema (coverImage, photos array, ratings, dates)
    │   └── User.js                      # User schema (username, bio, avatar, bcrypt hashing)
    └── routes/
        ├── auth.js                      # Register, login, me, and Google OAuth routes
        ├── tripRoutes.js                # Protected CRUD + POST /:id/upload route
        └── userRoutes.js                # GET /:username/profile & PUT /profile routes
```

---

## 🔐 Environment Variables

### 1. Backend (`server/.env`)
Create a `.env` file in the `server/` directory from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tripvault?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Frontend (`client/.env`)
Create a `.env` file in the `client/` directory from `client/.env.example`:

```env
# Optional: defaults to http://localhost:5000/api in development
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> **Security Note:** `.env` files are included in `.gitignore` and are never committed to version control.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) database connection URI
- A free [Cloudinary](https://cloudinary.com/) account (Cloud Name, API Key, API Secret)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd tripvault
```

### 2. Install Dependencies
You can install dependencies for root, server, and client:

```bash
# Install root concurrently tool
npm install

# Install server dependencies
cd server
npm install
cp .env.example .env
# Edit server/.env with your MongoDB & Cloudinary credentials

# Install client dependencies
cd ../client
npm install
cp .env.example .env
# Edit client/.env (if needed)
cd ..
```

---

## 🏃 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root `tripvault/` directory:

```bash
npm run dev
```
> This starts both the Express API server (on port `5000`) and the Vite client (on port `5173`) simultaneously using `concurrently`.

### Option B: Run Individually in Separate Terminals

#### Terminal 1 — Backend:
```bash
cd server
npm run dev
```
> The API server will start on **`http://localhost:5000`**.

#### Terminal 2 — Frontend:
```bash
cd client
npm run dev
```
> The Vite development server will start on **`http://localhost:5173`**.

---

## 📱 Mobile & LAN Access (Same Wi-Fi)

TripVault has built-in dynamic local network discovery:
1. Connect your computer and mobile device/tablet to the same Wi-Fi network.
2. Find your computer's local network IP address (`192.168.x.x` or `10.x.x.x` via `ipconfig` or `ifconfig`).
3. Open your mobile browser and navigate to:
   ```text
   http://<YOUR_LOCAL_IP>:5173/
   ```
4. The client automatically detects the network hostname and directs API calls to `http://<YOUR_LOCAL_IP>:5000/api`, with backend CORS configured to allow seamless cross-device communication.

---

## 📬 Example API Requests & Payloads

### 1. User Registration: `POST /api/auth/register`
**Body (`JSON`):**
```json
{
  "name": "Jane Traveler",
  "username": "janetravels",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "6ac7575ff4d99a0920b58980",
    "name": "Jane Traveler",
    "username": "janetravels",
    "email": "jane@example.com",
    "avatar": ""
  }
}
```

### 2. User Login: `POST /api/auth/login`
**Body (`JSON`):**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "6ac7575ff4d99a0920b58980",
    "name": "Jane Traveler",
    "username": "janetravels",
    "email": "jane@example.com"
  }
}
```

### 3. Create Trip: `POST /api/trips`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Body (`JSON`):**
```json
{
  "title": "Summer Vacation in Kyoto",
  "destination": "Kyoto, Japan",
  "startDate": "2026-06-10",
  "endDate": "2026-06-20",
  "description": "Explored Fushimi Inari Shrine and bamboo grove in Arashiyama.",
  "rating": 5
}
```
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
    "description": "Explored Fushimi Inari Shrine and bamboo grove in Arashiyama.",
    "rating": 5,
    "coverImage": "",
    "photos": [],
    "user": "6ac7575ff4d99a0920b58980",
    "createdAt": "2026-10-22T08:30:00.000Z"
  }
}
```

### 4. Upload Trip Photo: `POST /api/trips/:id/upload`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Content-Type:** `multipart/form-data`  
**Form Field:** `image`: `[Binary Image File]` (e.g. JPG, PNG, WebP)  
**Optional Form Field:** `isCover`: `true`

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully.",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v1234567890/tripvault/trip_photo.jpg",
  "trip": {
    "_id": "6ac7575ff4d99a0920b58991",
    "title": "Summer Vacation in Kyoto",
    "coverImage": "https://res.cloudinary.com/demo/image/upload/v1234567890/tripvault/trip_photo.jpg",
    "photos": [
      "https://res.cloudinary.com/demo/image/upload/v1234567890/tripvault/trip_photo.jpg"
    ]
  }
}
```

### 5. Fetch Public Profile: `GET /api/users/:username/profile`
**Auth Required:** None (Public)  
**Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "6ac7575ff4d99a0920b58980",
    "name": "Jane Traveler",
    "username": "janetravels",
    "bio": "Passionate backpacker exploring hidden gems across Asia & Europe 🌏🎒",
    "avatar": "",
    "createdAt": "2026-10-15T10:00:00.000Z"
  },
  "trips": [
    {
      "_id": "6ac7575ff4d99a0920b58991",
      "title": "Summer Vacation in Kyoto",
      "destination": "Kyoto, Japan",
      "startDate": "2026-06-10T00:00:00.000Z",
      "endDate": "2026-06-20T00:00:00.000Z",
      "description": "Explored Fushimi Inari Shrine...",
      "rating": 5,
      "coverImage": "https://res.cloudinary.com/demo/image/upload/...",
      "photos": ["https://res.cloudinary.com/demo/image/upload/..."],
      "createdAt": "2026-10-22T08:30:00.000Z"
    }
  ]
}
```

### 6. Update Profile: `PUT /api/users/profile`
**Header:** `Authorization: Bearer <your_jwt_token>`  
**Body (`JSON`):**
```json
{
  "username": "janetravels_official",
  "bio": "Backpacker, coffee enthusiast & travel photographer 📷☕",
  "name": "Jane Traveler"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "user": {
    "id": "6ac7575ff4d99a0920b58980",
    "name": "Jane Traveler",
    "username": "janetravels_official",
    "bio": "Backpacker, coffee enthusiast & travel photographer 📷☕",
    "email": "jane@example.com",
    "avatar": ""
  }
}
```

---

## 🛡️ Security & Architecture

1. **Strict User Data Isolation:** Queries on `GET /api/trips` filter strictly by `{ user: req.user.id }`.
2. **Ownership Validation:** `GET /:id`, `PUT /:id`, `DELETE /:id`, and `POST /:id/upload` verify `trip.user.toString() === req.user.id`, returning `403 Forbidden` on unauthorized access attempts.
3. **Public Route Sanitization:** Public profile routes explicitly whitelist safe fields (`name`, `username`, `bio`, `avatar`, and public trips), ensuring sensitive data (`email`, `password`) is never exposed.
4. **Mongoose Schema Safeguards:** Constraints on required fields, regex enforcement on usernames (`^[a-zA-Z0-9_-]{3,30}$`), and `min: 1`, `max: 5` validation on ratings when provided.
5. **JWT Bearer Token Guard:** Protected endpoints verify token signature and validity through `authMiddleware`.
6. **Axios Centralized Interceptor:** Frontend client automatically attaches Bearer tokens, dynamically resolves LAN host IPs, and handles automatic session expiration.
7. **Cloudinary Media Pipeline:** Secure direct stream uploading via `multer-storage-cloudinary` with automatic format validation and file-size guardrails (5MB limit).

---

## 🎨 Week 4: Polish, Responsive Design & Mobile Navigation

- **Modern Toast Notifications:** Non-intrusive floating feedback toasts powered by `react-toastify` for authentication, trip CRUD actions, photo uploads, and profile edits.
- **Collapsible Mobile Hamburger Menu:** Fully responsive navigation on mobile screens (<860px) with custom hamburger toggle drawer.
- **Editorial Luxury Theme:** Cohesive aesthetic inspired by high-end travel journals with Cormorant Garamond serif headers, DM Sans typography, polaroid photography cards, and custom scrollbar styling.
- **Responsive Adaptability:** Tested and optimized for 375px+ viewports with dynamic 1–2 column photo galleries.
- **Global Footer & Attribution:** Professional footer attribution with direct GitHub repository links.

---

## 👨‍💻 Author

Crafted by **Krish Kumar**  
- **GitHub:** [@krish6587](https://github.com/krish6587)  
- **Repository:** [tripvault](https://github.com/krish6587/tripvault)

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).

