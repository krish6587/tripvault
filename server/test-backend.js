const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/tripRoutes');
const User = require('./models/User');
const Trip = require('./models/Trip');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.PORT = '5001';

async function runTests() {
  console.log('=== STARTING TRIPVAULT BACKEND VERIFICATION SUITE ===\n');

  // 1. Start MongoDB In-Memory Server for isolated testing
  console.log('[1/14] Initializing MongoDB Test Instance...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('       MongoDB Connected to test URI');
  await mongoose.connect(uri);

  // 2. Setup Express test server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);

  const server = app.listen(5001);
  const authUrl = 'http://127.0.0.1:5001/api/auth';
  const tripUrl = 'http://127.0.0.1:5001/api/trips';

  try {
    // ----------------------------------------------------------------
    // TEST 1: Register User 1 & User 2
    // ----------------------------------------------------------------
    console.log('\n[2/14] Registering Test Users (User 1 & User 2) ...');
    await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Explorer',
        email: 'alice@example.com',
        password: 'Password123!'
      })
    });

    await fetch(`${authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Traveler',
        email: 'bob@example.com',
        password: 'Password123!'
      })
    });

    // Login Alice (User 1)
    const loginRes1 = await fetch(`${authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', password: 'Password123!' })
    });
    const loginData1 = await loginRes1.json();
    const token1 = loginData1.token;

    // Login Bob (User 2)
    const loginRes2 = await fetch(`${authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.com', password: 'Password123!' })
    });
    const loginData2 = await loginRes2.json();
    const token2 = loginData2.token;

    console.log('       >> PASSED: Test users created & JWT tokens issued.');

    // ----------------------------------------------------------------
    // TEST 2: Trip Protection without Token (401)
    // ----------------------------------------------------------------
    console.log('\n[3/14] Testing GET /api/trips without Token (401 Unauthorized) ...');
    const noAuthRes = await fetch(tripUrl);
    if (noAuthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized without token, got ${noAuthRes.status}`);
    }
    console.log('       >> PASSED: Unauthenticated access rejected with 401.');

    // ----------------------------------------------------------------
    // TEST 3: Create Trip - Input Validation (Missing required title/destination)
    // ----------------------------------------------------------------
    console.log('\n[4/14] Testing POST /api/trips (Missing Title/Destination 400 Bad Request) ...');
    const badTripRes = await fetch(tripUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({ title: '', destination: '' })
    });
    if (badTripRes.status !== 400) {
      throw new Error(`Expected 400 for empty fields, got ${badTripRes.status}`);
    }
    console.log('       >> PASSED: Empty fields rejected with 400.');

    // ----------------------------------------------------------------
    // TEST 4: Create Trip - Rating Boundary Validation (min 1, max 5)
    // ----------------------------------------------------------------
    console.log('\n[5/14] Testing POST /api/trips (Invalid Rating 400) ...');
    const badRatingRes = await fetch(tripUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Kyoto Trip',
        destination: 'Kyoto, Japan',
        rating: 6
      })
    });
    if (badRatingRes.status !== 400) {
      throw new Error(`Expected 400 for rating > 5, got ${badRatingRes.status}`);
    }
    console.log('       >> PASSED: Rating > 5 rejected with 400.');

    // ----------------------------------------------------------------
    // TEST 5: Create Trip - Valid Creation (User 1)
    // ----------------------------------------------------------------
    console.log('\n[6/14] Testing POST /api/trips (Valid Creation for User 1) ...');
    const tripPayload1 = {
      title: 'Summer in Paris',
      destination: 'Paris, France',
      startDate: '2026-06-10',
      endDate: '2026-06-20',
      description: 'Visited Eiffel Tower and Louvre.',
      rating: 5
    };

    const createRes1 = await fetch(tripUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify(tripPayload1)
    });
    const createData1 = await createRes1.json();
    if (createRes1.status !== 201 || !createData1.success || !createData1.trip._id) {
      throw new Error(`Trip creation failed: ${JSON.stringify(createData1)}`);
    }
    const user1TripId = createData1.trip._id;
    console.log('       >> PASSED: Trip created with ID:', user1TripId);

    // Create a 2nd trip for User 1 to test newest first sorting
    const tripPayload2 = {
      title: 'Autumn in Tokyo',
      destination: 'Tokyo, Japan',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      description: 'Shibuya crossing and ramen tour.',
      rating: 4
    };
    await fetch(tripUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify(tripPayload2)
    });

    // ----------------------------------------------------------------
    // TEST 6: Get Trips for User 1 (Should return 2 trips, newest first)
    // ----------------------------------------------------------------
    console.log('\n[7/14] Testing GET /api/trips (User 1 Trips & Sort Order) ...');
    const getTripsRes1 = await fetch(tripUrl, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const getTripsData1 = await getTripsRes1.json();
    if (getTripsRes1.status !== 200 || getTripsData1.trips.length !== 2) {
      throw new Error(`Expected 2 trips for User 1, got ${getTripsData1.trips?.length}`);
    }
    if (getTripsData1.trips[0].title !== 'Autumn in Tokyo') {
      throw new Error('Trips not sorted newest first!');
    }
    console.log('       >> PASSED: Returned exactly 2 trips sorted newest first.');

    // ----------------------------------------------------------------
    // TEST 7: Data Isolation - User 2 gets 0 trips initially
    // ----------------------------------------------------------------
    console.log('\n[8/14] Testing GET /api/trips (User 2 Data Isolation) ...');
    const getTripsRes2 = await fetch(tripUrl, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const getTripsData2 = await getTripsRes2.json();
    if (getTripsRes2.status !== 200 || getTripsData2.trips.length !== 0) {
      throw new Error(`Data isolation violation: User 2 saw User 1's trips! Count: ${getTripsData2.trips.length}`);
    }
    console.log('       >> PASSED: User 2 sees 0 trips (perfect isolation).');

    // ----------------------------------------------------------------
    // TEST 8: GET /api/trips/:id (Single Trip Fetch by Owner)
    // ----------------------------------------------------------------
    console.log('\n[9/14] Testing GET /api/trips/:id (Owner Fetch) ...');
    const getSingleRes = await fetch(`${tripUrl}/${user1TripId}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const getSingleData = await getSingleRes.json();
    if (getSingleRes.status !== 200 || getSingleData.trip._id !== user1TripId) {
      throw new Error('Failed to fetch single trip by ID');
    }
    console.log('       >> PASSED: Single trip retrieved successfully.');

    // ----------------------------------------------------------------
    // TEST 9: Ownership Check on GET - User 2 cannot access User 1's trip (403 Forbidden)
    // ----------------------------------------------------------------
    console.log('\n[10/14] Testing GET /api/trips/:id Ownership Check (User 2 accessing User 1 trip -> 403) ...');
    const forbiddenGetRes = await fetch(`${tripUrl}/${user1TripId}`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    if (forbiddenGetRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got ${forbiddenGetRes.status}`);
    }
    console.log('       >> PASSED: Unauthorized trip read rejected with 403 Forbidden.');

    // ----------------------------------------------------------------
    // TEST 10: Ownership Check on PUT - User 2 cannot update User 1's trip (403 Forbidden)
    // ----------------------------------------------------------------
    console.log('\n[11/14] Testing PUT /api/trips/:id Ownership Check (User 2 updating User 1 trip -> 403) ...');
    const forbiddenPutRes = await fetch(`${tripUrl}/${user1TripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({ title: 'Hacked Trip Title' })
    });
    if (forbiddenPutRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden on unauthorized PUT, got ${forbiddenPutRes.status}`);
    }
    console.log('       >> PASSED: Unauthorized update blocked with 403 Forbidden.');

    // ----------------------------------------------------------------
    // TEST 11: Ownership Check on DELETE - User 2 cannot delete User 1's trip (403 Forbidden)
    // ----------------------------------------------------------------
    console.log('\n[12/14] Testing DELETE /api/trips/:id Ownership Check (User 2 deleting User 1 trip -> 403) ...');
    const forbiddenDelRes = await fetch(`${tripUrl}/${user1TripId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` }
    });
    if (forbiddenDelRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden on unauthorized DELETE, got ${forbiddenDelRes.status}`);
    }
    console.log('       >> PASSED: Unauthorized delete blocked with 403 Forbidden.');

    // ----------------------------------------------------------------
    // TEST 12: PUT /api/trips/:id - Valid Update by Owner
    // ----------------------------------------------------------------
    console.log('\n[13/14] Testing PUT /api/trips/:id (Owner updating trip) ...');
    const updateRes = await fetch(`${tripUrl}/${user1TripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Summer in Paris & Versailles',
        rating: 5,
        description: 'Updated with Versailles palace visit.'
      })
    });
    const updateData = await updateRes.json();
    if (updateRes.status !== 200 || updateData.trip.title !== 'Summer in Paris & Versailles') {
      throw new Error(`Trip update failed: ${JSON.stringify(updateData)}`);
    }
    console.log('       >> PASSED: Trip updated successfully.');

    // ----------------------------------------------------------------
    // TEST 13: DELETE /api/trips/:id - Valid Delete by Owner
    // ----------------------------------------------------------------
    console.log('\n[14/14] Testing DELETE /api/trips/:id (Owner deleting trip) & 404 checks ...');
    const delRes = await fetch(`${tripUrl}/${user1TripId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` }
    });
    if (delRes.status !== 200) {
      throw new Error(`Delete failed with status ${delRes.status}`);
    }

    // Verify trip is truly gone (404)
    const checkGoneRes = await fetch(`${tripUrl}/${user1TripId}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    if (checkGoneRes.status !== 404) {
      throw new Error(`Deleted trip expected 404, got ${checkGoneRes.status}`);
    }

    // Test Invalid ObjectId format (400)
    const badIdRes = await fetch(`${tripUrl}/invalid-id-123`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    if (badIdRes.status !== 400) {
      throw new Error(`Invalid ObjectId expected 400, got ${badIdRes.status}`);
    }
    console.log('       >> PASSED: Trip deleted cleanly and 404/400 checks verified.');

    console.log('\n================================================================');
    console.log('ALL 14 BACKEND AUTH & TRIP CRUD TESTS PASSED WITH 100% SUCCESS!');
    console.log('================================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
