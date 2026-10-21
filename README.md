# TripVault ✈️

> A full-stack travel memory journal built as part of the **CodGen Full Stack (MERN) Internship — Week 3 (Photo Uploads & Public Profiles)**.

TripVault enables travelers to securely manage their journeys: creating trips with destinations, dates, notes, and ratings; uploading photos to Cloudinary; showcasing cover images and photo grids; and sharing public user profile pages where anyone can explore a traveler's adventures without requiring an account.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (with [Mongoose ODM](https://mongoosejs.com/))
- **Cloud Storage:** [Cloudinary](https://cloudinary.com/) (Node.js SDK v2)
- **File Upload Parsing:** [Multer](https://github.com/expressjs/multer) & [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)
- **Security:** [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- **Password Hashing:** [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Authentication:** [jsonwebtoken (JWT)](https://www.npmjs.com/package/jsonwebtoken)
- **Environment Management:** [dotenv](https://www.npmjs.com/package/dotenv)
- **CORS Support:** [cors](https://www.npmjs.com/package/cors)

### Frontend
- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Client Routing:** [React Router DOM (v6)](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) (with centralized interceptors & dynamic LAN host detection)
- **Styling:** Premium Vanilla CSS (Photo grid, lightbox modal, public profile banner, responsive trip cards, and form previews)

---

## ✨ Features by Week

### Week 3 — Photo Uploads & Public Profiles (Current)
- **Cloud Media Storage with Cloudinary:** Seamlessly upload travel memories to Cloudinary using `multer` and `multer-storage-cloudinary` with a 5MB size limit and image format validation (`middleware/upload.js`).
- **Updated Trip Model:** Added `coverImage` (String) and `photos` (Array of Strings) fields to the Mongoose schema.
- **Trip Photo Upload Route (`POST /api/trips/:id/upload`):** Uploads an image, attaches the secure Cloudinary URL to the trip's `photos` array, and automatically sets `coverImage` if not yet assigned.
- **Frontend Photo Upload UI:** File input on Create Trip and Edit Trip forms with instant image previews (`URL.createObjectURL`), clear/remove options, and `FormData` upload.
- **Trip Card Cover Images:** Dashboard displays cover image banners with photo counter badges (`📸 3 photos`) and rating badges.
- **Single Trip Detail Page (`/trips/:id`):** Full trip detail page displaying hero cover banner, notes, destination, and a **photo grid gallery** with click-to-view lightbox modal and direct photo uploader.
- **User Model Enhancements:** Added `username` (unique, required) and `bio` (optional, max 300 characters) to the User schema.
- **Public Profile Route (`GET /api/users/:username/profile`):** Public API route viewable without authentication. Exposes safe fields only (`name`, `username`, `bio`, `avatar`, and trip list). **Strictly excludes sensitive fields (password, email)**.
- **Public Profile Page (`/profile/:username`):** Dedicated React page viewable without logging in. Shows avatar/initials, handle, bio, travel stats (trips logged, destinations visited, photos shared), and a public grid of trips.
- **Edit Profile Route (`PUT /api/users/profile`):** Allows authenticated users to update their bio and username with collision checks.
- **Dashboard Profile Link & Edit:** "My Profile" button in navbar linking to `/profile/:username`, and interactive "Edit Profile" modal to modify bio and handle directly from the dashboard.

### Week 2 — Trip Management (CRUD Operations)
- **Trip Model & Validation:** Title, destination, start/end dates, description, rating (1–5 or unrated), and user ownership.
- **Trip CRUD API:** Full CRUD routes with strict ownership checks (403 Forbidden for unauthorized access).
- **Dashboard & Modals:** Responsive card layout, reusable Create/Edit modal with pre-filled inputs, deletion confirmation.

### Week 1 — Authentication & Security Engine
- **Secure Registration & Login:** Validations with regex, strong password enforcement, bcrypt hashing, JWT tokens.
- **Route Guarding:** Protected route wrappers and `authMiddleware`.
- **Security:** Rate limiting and Helmet headers.

---

## 🔌 API Routes Reference

| Method | Route | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register new user with username, name, email, password |
| `POST` | `/api/auth/login` | No | Authenticate user & receive JWT token |
| `POST` | `/api/auth/google` | No | Verify Google ID token & authenticate |
| `GET` | `/api/auth/me` | Yes | Get authenticated user info |
| `POST` | `/api/trips` | Yes | Create a new trip |
| `GET` | `/api/trips` | Yes | Get all trips for the authenticated user |
| `GET` | `/api/trips/:id` | Yes | Get single trip by ID (ownership verified) |
| `PUT` | `/api/trips/:id` | Yes | Update trip details (ownership verified) |
| `DELETE` | `/api/trips/:id` | Yes | Delete trip (ownership verified) |
| `POST` | `/api/trips/:id/upload` | **Yes** | **Upload photo to Cloudinary and attach URL to trip** |
| `GET` | `/api/users/:username/profile` | **No** | **Public profile: user info + trips (safe fields only)** |
| `PUT` | `/api/users/profile` | **Yes** | **Update logged-in user's bio or username** |

---

## ☁️ Cloudinary Configuration

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.
3. Add them to `server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🧪 Automated Test Suite (17 Verification Checks)

TripVault includes an automated verification test suite running against an in-memory MongoDB server. To execute all 17 tests:

```bash
cd server
npm test
```

All 17 checks will run and verify:
1. Isolated MongoDB In-Memory Server Initialization
2. User Registration (User 1 & User 2 with usernames)
3. Unauthenticated Trip Access Prevention (401)
4. Empty Title/Destination Validation (400)
5. Invalid Rating Validation (400)
6. Valid Trip Creation for User 1
7. User Trips Sorting (Newest First)
8. User Data Isolation (User 2 sees 0 of User 1's trips)
9. Single Trip Retrieval by Owner
10. Cross-User Read Access Forbidden (403)
11. Cross-User Update Access Forbidden (403)
12. Cross-User Delete Access Forbidden (403)
13. Owner Trip Update (200)
14. Owner Trip Deletion & 404/400 Validation
15. **Photo Upload to Trip via Multer + Cloudinary (`POST /api/trips/:id/upload`)**
16. **Public Profile Route (`GET /api/users/:username/profile`) — No Auth, Safe Fields Only, Passwords/Emails Excluded**
17. **Profile Update (`PUT /api/users/profile`) — Unauthenticated 401 & Authenticated Bio/Username Update**

---

## 📁 Updated Folder Structure

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
│       ├── api.js                       # Axios client with JWT interceptor
│       ├── App.jsx                      # App routes (/profile/:username, /trips/:id)
│       ├── index.css                    # Design system, photo grid & profile styles
│       ├── main.jsx                     # Entry point
│       ├── components/
│       │   ├── ProtectedRoute.jsx       # Route guard
│       │   ├── TripCard.jsx             # Card with cover image & photo badge
│       │   └── TripForm.jsx             # Create/Edit modal with photo upload & preview
│       └── pages/
│           ├── Dashboard.jsx            # Dashboard with "My Profile" & "Edit Profile"
│           ├── PublicProfile.jsx        # Public profile page (accessible without login)
│           ├── TripDetails.jsx          # Trip detail view with photo grid & lightbox
│           ├── Login.jsx                # User login page
│           └── Register.jsx             # User registration with username selection
│
└── server/
    ├── .env                             # Environment variables & Cloudinary credentials
    ├── .env.example                     # Environment template
    ├── .gitignore
    ├── index.js                         # Express server with /api/users mounted
    ├── package.json
    ├── test-backend.js                  # 17-step automated test verification suite
    ├── controllers/
    │   ├── tripController.js            # Trip CRUD + uploadTripPhoto controller
    │   └── userController.js            # Public profile & profile update controller
    ├── middleware/
    │   ├── authMiddleware.js            # JWT verification middleware
    │   └── upload.js                    # Multer + Cloudinary upload middleware
    ├── models/
    │   ├── Trip.js                      # coverImage and photos array added
    │   └── User.js                      # username and bio added
    └── routes/
        ├── auth.js                      # Auth routes with username support
        ├── tripRoutes.js                # Protected CRUD + POST /:id/upload route
        └── userRoutes.js                # GET /:username/profile & PUT /profile routes
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
