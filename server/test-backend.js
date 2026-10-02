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

  // 1. Start MongoDB In-Memory Server
  console.log('[1/7] Initializing MongoDB Test Instance...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('      MongoDB Connected to:', uri);
  await mongoose.connect(uri);

  // 2. Setup Express test server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  const server = app.listen(5001);
  const baseUrl = 'http://127.0.0.1:5001/api/auth';

  try {
    // ----------------------------------------------------------------
    // TEST 1: Register API (POST /api/auth/register)
    // ----------------------------------------------------------------
    console.log('\n[2/7] Testing POST /api/auth/register ...');
    const registerPayload = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'mypassword123'
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
    // TEST 2: Verify Password Hashing in MongoDB
    // ----------------------------------------------------------------
    console.log('\n[3/7] Verifying Password Hashing in MongoDB directly ...');
    const dbUser = await User.findOne({ email: 'john.doe@example.com' });
    console.log('      Raw User in Database:');
    console.log('        _id:', dbUser._id.toString());
    console.log('        name:', dbUser.name);
    console.log('        email:', dbUser.email);
    console.log('        password hash:', dbUser.password);

    if (dbUser.password === 'mypassword123') {
      throw new Error('SECURITY VIOLATION: Password is stored in plain text!');
    }
    if (!dbUser.password.startsWith('$2a$') && !dbUser.password.startsWith('$2b$')) {
      throw new Error('SECURITY VIOLATION: Password is not a valid bcrypt hash!');
    }
    console.log('      >> PASSED: Password is cryptographically hashed with bcrypt.');

    // ----------------------------------------------------------------
    // TEST 3: Login with Invalid Password
    // ----------------------------------------------------------------
    console.log('\n[4/7] Testing POST /api/auth/login (Invalid Password) ...');
    const badLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'wrongpassword' })
    });
    const badLoginData = await badLoginRes.json();
    console.log('      Status:', badLoginRes.status);
    console.log('      Response:', JSON.stringify(badLoginData, null, 2));
    if (badLoginRes.status !== 400 || badLoginData.success !== false) {
      throw new Error('Bad password login did not fail properly!');
    }
    console.log('      >> PASSED: Invalid login rejected with 400.');

    // ----------------------------------------------------------------
    // TEST 4: Login with Valid Password (POST /api/auth/login)
    // ----------------------------------------------------------------
    console.log('\n[5/7] Testing POST /api/auth/login (Valid Credentials) ...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john.doe@example.com', password: 'mypassword123' })
    });
    const loginData = await loginRes.json();
    console.log('      Status:', loginRes.status);
    console.log('      Response:', JSON.stringify(loginData, null, 2));

    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const token = loginData.token;
    console.log('      >> PASSED: Valid login succeeded and issued JWT token.');

    // ----------------------------------------------------------------
    // TEST 5: Protected Route Without Token (GET /api/auth/me)
    // ----------------------------------------------------------------
    console.log('\n[6/7] Testing GET /api/auth/me (Missing Token) ...');
    const noTokenRes = await fetch(`${baseUrl}/me`);
    const noTokenData = await noTokenRes.json();
    console.log('      Status:', noTokenRes.status);
    console.log('      Response:', JSON.stringify(noTokenData, null, 2));
    if (noTokenRes.status !== 401 || noTokenData.success !== false) {
      throw new Error('Protected route allowed access without token!');
    }
    console.log('      >> PASSED: Missing token correctly rejected with 401 Unauthorized.');

    // ----------------------------------------------------------------
    // TEST 6: Protected Route With Valid Token (GET /api/auth/me)
    // ----------------------------------------------------------------
    console.log('\n[7/7] Testing GET /api/auth/me (With Valid JWT Token) ...');
    const meRes = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
    console.log('      >> PASSED: Authenticated user profile retrieved securely (password excluded).');

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
