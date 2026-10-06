const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.PORT = '5001';

async function runTests() {
  console.log('=== STARTING TRIPVAULT BACKEND VERIFICATION SUITE ===\n');

  // 1. Start MongoDB In-Memory Server for isolated testing
  console.log('[1/8] Initializing MongoDB Test Instance...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('      MongoDB Connected to test URI');
  await mongoose.connect(uri);

  // 2. Setup Express test server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  const server = app.listen(5001);
  const baseUrl = 'http://127.0.0.1:5001/api/auth';

  try {
   
    // TEST 1: Register API - Invalid Data Types & Format
   
    console.log('\n[2/8] Testing POST /api/auth/register (Invalid Input Types) ...');
    const badInputRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 123, email: { nested: 'bad' }, password: true })
    });
    console.log('      Status:', badInputRes.status);
    if (badInputRes.status !== 400) {
      throw new Error('Type validation failed to return 400 Bad Request');
    }
    console.log('      >> PASSED: Non-string inputs rejected with 400.');

    // ----------------------------------------------------------------
    // TEST 2: Register API - Valid Registration
    // ----------------------------------------------------------------
    console.log('\n[3/8] Testing POST /api/auth/register (Valid Payload) ...');
    const registerPayload = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'StrongPass123!'
    };

    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });

    const regData = await regRes.json();
    console.log('      Status:', regRes.status);
    console.log('      Response:', JSON.stringify(regData, null, 2));

    if (regRes.status !== 201 || !regData.success) {
      throw new Error(`Register failed with status ${regRes.status}`);
    }

    // ----------------------------------------------------------------
    // TEST 3: Duplicate Registration (409 Conflict)
    // ----------------------------------------------------------------
    console.log('\n[4/8] Testing POST /api/auth/register (Duplicate Email) ...');
    const dupRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    console.log('      Status:', dupRes.status);
    if (dupRes.status !== 409) {
      throw new Error(`Duplicate registration expected 409, got ${dupRes.status}`);
    }
    console.log('      >> PASSED: Duplicate registration correctly rejected with 409 Conflict.');

    // ----------------------------------------------------------------
    // TEST 4: Verify Password Hashing in MongoDB
    // ----------------------------------------------------------------
    console.log('\n[5/8] Verifying Password Hashing in MongoDB directly ...');
    const dbUser = await User.findOne({ email: 'john.doe@example.com' });
    console.log('      Raw User in Database:');
    console.log('        _id:', dbUser._id.toString());
    console.log('        name:', dbUser.name);
    console.log('        email:', dbUser.email);
    console.log('        password hash:', dbUser.password);

    if (dbUser.password === 'StrongPass123!') {
      throw new Error('SECURITY VIOLATION: Password is stored in plain text!');
    }
    if (!dbUser.password.startsWith('$2a$') && !dbUser.password.startsWith('$2b$')) {
      throw new Error('SECURITY VIOLATION: Password is not a valid bcrypt hash!');
    }
    console.log('      >> PASSED: Password is cryptographically hashed with bcrypt.');

    // ----------------------------------------------------------------
    // TEST 5: Login with Invalid Password
    // ----------------------------------------------------------------
    console.log('\n[6/8] Testing POST /api/auth/login (Invalid Password) ...');
    const badLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'wrongpassword' })
    });
    const badLoginData = await badLoginRes.json();
    console.log('      Status:', badLoginRes.status);
    if (badLoginRes.status !== 400 || badLoginData.success !== false) {
      throw new Error('Bad password login did not fail properly!');
    }
    console.log('      >> PASSED: Invalid login rejected with 400.');

    // ----------------------------------------------------------------
    // TEST 6: Login with Valid Password
    // ----------------------------------------------------------------
    console.log('\n[7/8] Testing POST /api/auth/login (Valid Credentials) ...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'StrongPass123!' })
    });
    const loginData = await loginRes.json();
    console.log('      Status:', loginRes.status);

    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const token = loginData.token;
    console.log('      >> PASSED: Valid login succeeded and issued JWT token.');

    // ----------------------------------------------------------------
    // TEST 7: Protected Route (GET /api/auth/me)
    // ----------------------------------------------------------------
    console.log('\n[8/8] Testing GET /api/auth/me (With Valid & Invalid Tokens) ...');
    const noTokenRes = await fetch(`${baseUrl}/me`);
    if (noTokenRes.status !== 401) {
      throw new Error('Protected route allowed access without token!');
    }

    const meRes = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('      Status:', meRes.status);
    console.log('      Response:', JSON.stringify(meData, null, 2));

    if (meRes.status !== 200 || !meData.user || meData.user.email !== 'john.doe@example.com') {
      throw new Error('Protected /me route failed to return authenticated user!');
    }
    if (meData.user.password) {
      throw new Error('SECURITY VIOLATION: Password hash leaked in /me response!');
    }
    console.log('      >> PASSED: Authenticated user profile retrieved securely.');

    console.log('\n========================================================');
    console.log('ALL BACKEND API TESTS AND SECURITY CHECKS PASSED 100%!');
    console.log('========================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
