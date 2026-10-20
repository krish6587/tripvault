import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';

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
          // Token invalid or expired, visitor is public guest
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Fetch public user profile and trips (no auth token required)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch without needing any auth token
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading @{username}'s travel profile...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-error-layout">
        <div className="profile-error-card">
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h2>Traveler Not Found</h2>
          <p>{error || `We couldn't find a profile for @${username}.`}</p>
          <div className="profile-error-actions">
            <Link to="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Join TripVault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user, trips = [] } = profileData;
  const isOwner = currentUser && (currentUser.username?.toLowerCase() === user.username?.toLowerCase() || currentUser._id === user.id);

  // Get user initials for avatar
  const initials = (user.name || user.username || 'T')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="public-profile-layout">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>✈️</span> TripVault
        </div>

        <div className="navbar-user">
          {currentUser ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              My Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Profile Header Banner */}
      <div className="profile-banner">
        <div className="profile-banner-content">
          <div className="profile-avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initials">{initials}</div>
            )}
          </div>

          <div className="profile-meta">
            <div className="profile-name-row">
              <h1 className="profile-display-name">{user.name}</h1>
              <span className="profile-username-tag">@{user.username}</span>
              {isOwner && (
                <span className="profile-owner-badge" title="This is your public profile">
                  🌟 You
                </span>
              )}
            </div>

            {user.bio ? (
              <p className="profile-bio-text">{user.bio}</p>
            ) : (
              <p className="profile-bio-placeholder">
                <em>Travel enthusiast exploring the world with TripVault.</em>
              </p>
            )}

            <div className="profile-stats-row">
              <div className="profile-stat-item">
                <span className="stat-number">{trips.length}</span>
                <span className="stat-label">Trips Logged</span>
              </div>
              <div className="profile-stat-item">
                <span className="stat-number">
                  {new Set(trips.map((t) => t.destination)).size}
                </span>
                <span className="stat-label">Destinations Visited</span>
              </div>
              <div className="profile-stat-item">
                <span className="stat-number">
                  {trips.reduce((acc, t) => acc + (t.photos?.length || 0), 0)}
                </span>
                <span className="stat-label">Photos Shared</span>
              </div>
            </div>

            {isOwner && (
              <div className="profile-owner-actions">
                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                  ✏️ Edit Profile in Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Trips Section */}
      <main className="profile-main-container">
        <div className="profile-trips-header">
          <h2>Travel Journal 🗺️</h2>
          <p className="profile-trips-subtext">
            Browsing public journeys and memories shared by {user.name}
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="empty-trips-card">
            <div className="empty-icon">🏖️</div>
            <h3>No public trips shared yet</h3>
            <p>{user.name} hasn't posted any travel adventures yet. Check back soon!</p>
          </div>
        ) : (
          <div className="trips-grid">
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

      {/* Guest Callout Footer */}
      {!currentUser && (
        <footer className="public-profile-cta">
          <div className="cta-content">
            <h3>Start your own travel journal with TripVault 🌍</h3>
            <p>Save trips, upload memories with Cloudinary, rate your adventures, and share your personal profile.</p>
            <Link to="/register" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>
              Create Your Free Account
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicProfile;
