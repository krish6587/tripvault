import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';
import Footer from '../components/Footer';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Check if current visitor has a logged-in session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.success && res.data?.user) {
            setCurrentUser(res.data.user);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Fetch public user profile and trips (no auth token required)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/users/${username}/profile`);
      if (res.data?.success) {
        setProfileData(res.data);
      } else {
        setError('User profile not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load profile. The user may not exist.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8d949b', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontStyle: 'italic' }}>
          Opening @{username}'s public vault...
        </p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={{ minHeight: '100vh', background: '#07090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#efe9df', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#0e1217', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '44px 32px', borderRadius: '16px', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#efe9df', margin: '14px 0 8px' }}>
            Traveler Not Found
          </h2>
          <p style={{ color: '#8d949b', fontSize: '13.5px', marginBottom: '24px' }}>
            {error || `We couldn't find a public profile for @${username}.`}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/login"
              style={{ border: '1px solid rgba(255, 255, 255, 0.18)', background: 'transparent', color: '#efe9df', borderRadius: '9999px', padding: '9px 20px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '9px 22px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
            >
              Join TripVault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, trips = [] } = profileData;
  const isOwner = currentUser && (currentUser.username?.toLowerCase() === user.username?.toLowerCase() || currentUser._id === user.id);

  const initials = (user.name || user.username || 'T')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#07090b', color: '#efe9df', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', color: '#efe9df', textDecoration: 'none' }}>
          TripVault
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentUser ? (
            <Link
              to="/dashboard"
              style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '8px 22px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{ border: '1px solid rgba(255, 255, 255, 0.18)', background: 'transparent', color: '#efe9df', borderRadius: '9999px', padding: '8px 20px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '8px 20px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Profile Header Banner */}
      <section style={{ background: '#0e1217', padding: '48px 48px 40px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#efe9df', color: '#07090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, flexShrink: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4.5vw, 46px)', fontWeight: 300, color: '#efe9df', margin: 0, lineHeight: 1.1 }}>
                {user.name}
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '3px 12px', borderRadius: '9999px', fontSize: '11px', letterSpacing: '0.1em', color: '#d1d5db' }}>
                @{user.username}
              </span>
              {isOwner && (
                <span style={{ background: '#f59e0b', color: '#07090b', fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  ★ You
                </span>
              )}
            </div>

            <p style={{ fontSize: '14px', color: '#8d949b', maxWidth: '640px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {user.bio || 'Travel enthusiast exploring the world with TripVault.'}
            </p>

            {/* Profile Stats Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 18px', minWidth: '100px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#efe9df', lineHeight: 1 }}>
                  {trips.length}
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8d949b', marginTop: '4px' }}>
                  TRIPS
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 18px', minWidth: '100px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#efe9df', lineHeight: 1 }}>
                  {new Set(trips.map((t) => t.destination)).size}
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8d949b', marginTop: '4px' }}>
                  PLACES
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 18px', minWidth: '100px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#efe9df', lineHeight: 1 }}>
                  {trips.reduce((acc, t) => acc + (t.photos?.length || 0), 0)}
                </div>
                <div style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8d949b', marginTop: '4px' }}>
                  PHOTOS
                </div>
              </div>
            </div>

            {isOwner && (
              <div style={{ marginTop: '20px' }}>
                <Link
                  to="/dashboard"
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#efe9df', borderRadius: '9999px', padding: '7px 18px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}
                >
                  ✏️ Edit Profile in Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile Trips Section */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 48px 60px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '32px', color: '#efe9df', margin: '0 0 6px 0', fontWeight: 300 }}>
            Public Travel Journal 🗺️
          </h2>
          <p style={{ fontSize: '13px', color: '#8d949b', margin: 0 }}>
            Browsing public journeys and memories shared by {user.name}
          </p>
        </div>

        {trips.length === 0 ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '56px 24px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🏖️</span>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#efe9df', margin: '12px 0 6px' }}>
              No public trips shared yet
            </h3>
            <p style={{ color: '#8d949b', fontSize: '13.5px' }}>
              {user.name} hasn't posted any travel adventures yet. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
            {trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                isPublic={true}
              />
            ))}
          </div>
        )}
      </main>

      {/* Global Footer (Deliverable #6) */}
      <Footer />
    </div>
  );
};

export default PublicProfile;
