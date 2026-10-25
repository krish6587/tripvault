import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';
import TripForm from '../components/TripForm';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import './Dashboard.css';

import heroBg from '../assets/landing/hero.jpg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state matching Screenshot 2
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Mobile Hamburger Menu state (Deliverable #9)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Trip Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  // Edit Profile Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileBio, setProfileBio] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const navigate = useNavigate();

  // Fetch authenticated user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setProfileBio(response.data.user.bio || '');
          setProfileUsername(response.data.user.username || '');
        } else {
          throw new Error('Could not fetch user profile');
        }
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch all user trips
  const fetchTrips = useCallback(async () => {
    try {
      setTripsLoading(true);
      setError('');
      const response = await api.get('/trips');
      if (response.data.success && Array.isArray(response.data.trips)) {
        setTrips(response.data.trips);
      } else {
        setTrips([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your trips. Please try again.');
    } finally {
      setTripsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  // Open Create Trip Modal
  const handleOpenCreate = () => {
    setEditingTrip(null);
    setIsFormOpen(true);
  };

  // Open Edit Trip Modal
  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  // Close Modal Form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTrip(null);
  };

  // Form Submission Success (Create or Edit)
  const handleFormSuccess = () => {
    handleCloseForm();
    fetchTrips();
  };

  // Handle Trip Deletion
  const handleDeleteTrip = async (tripId) => {
    try {
      setError('');
      const response = await api.delete(`/trips/${tripId}`);
      if (response.data.success) {
        toast.success('Trip deleted successfully!');
        fetchTrips();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete trip. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileSaving(true);
      const res = await api.put('/users/profile', {
        bio: profileBio,
        username: profileUsername
      });

      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        setProfileSuccess('Profile updated successfully!');
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileSuccess('');
        }, 1100);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalPhotos = trips.reduce((sum, t) => sum + (Array.isArray(t.photos) ? Math.max(t.photos.length, 1) : 1), 0);
    const uniquePlaces = new Set(trips.map(t => t.destination?.trim().toLowerCase()).filter(Boolean)).size;
    
    // Calculate unique countries roughly from comma-separated location or fallback
    const countries = new Set();
    trips.forEach(t => {
      if (t.destination) {
        const parts = t.destination.split(',');
        countries.add(parts[parts.length - 1].trim().toLowerCase());
      }
    });

    return {
      trips: totalTrips,
      photos: totalPhotos,
      places: uniquePlaces || totalTrips,
      countries: countries.size || Math.min(uniquePlaces, 5)
    };
  }, [trips]);

  // Filtered and sorted trips
  const filteredTrips = useMemo(() => {
    let list = [...trips];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        t =>
          t.title?.toLowerCase().includes(q) ||
          t.destination?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.startDate || b.createdAt || 0) - new Date(a.startDate || a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.startDate || a.createdAt || 0) - new Date(b.startDate || b.createdAt || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return list;
  }, [trips, searchTerm, sortBy]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';
  const initial = (user?.name?.[0] || 'T').toUpperCase();

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#8d949b', fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontStyle: 'italic' }}>
          Opening your travel vault...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <header className="dash-nav">
        <Link to="/" className="dash-nav-logo">
          TripVault
        </Link>

        {/* Mobile Hamburger Toggle Button (Deliverable #9) */}
        <button
          type="button"
          className="dash-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navbar Actions */}
        <div className="dash-nav-user-actions dash-nav-desktop">
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="dash-nav-pill-btn"
              title="View your public profile"
            >
              My Profile
            </Link>
          )}

          <button
            type="button"
            className="dash-nav-pill-btn"
            onClick={() => {
              setProfileBio(user?.bio || '');
              setProfileUsername(user?.username || '');
              setProfileError('');
              setProfileSuccess('');
              setIsEditProfileOpen(true);
            }}
          >
            Edit Profile
          </button>

          <span className="dash-nav-greeting">
            Hello, <strong>{user?.name || 'Traveler'}</strong>
          </span>

          <div className="dash-user-avatar" title={user?.name}>
            {initial}
          </div>

          <button onClick={handleLogout} className="dash-nav-pill-btn" style={{ marginLeft: '4px' }}>
            Logout
          </button>
        </div>

        {/* Mobile Collapsible Menu (Deliverable #9) */}
        {isMobileMenuOpen && (
          <div className="dash-mobile-menu">
            <div className="dash-mobile-user-info">
              <div className="dash-user-avatar">{initial}</div>
              <div>
                <div style={{ color: '#efe9df', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ color: '#8d949b', fontSize: '11px' }}>@{user?.username}</div>
              </div>
            </div>

            {user?.username && (
              <Link
                to={`/profile/${user.username}`}
                className="dash-mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👤 My Profile
              </Link>
            )}

            <button
              type="button"
              className="dash-mobile-link"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setProfileBio(user?.bio || '');
                setProfileUsername(user?.username || '');
                setProfileError('');
                setProfileSuccess('');
                setIsEditProfileOpen(true);
              }}
            >
              ✏️ Edit Profile
            </button>

            <button
              type="button"
              className="dash-mobile-link dash-mobile-logout"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </header>

      {/* Hero Banner with Scenic Mountain Backdrop */}
      <section className="dash-hero-banner" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="dash-hero-container">
          <div className="dash-hero-label">YOUR TRAVEL VAULT</div>
          
          <h1 className="dash-hero-title">
            Hello, <em>{firstName}.</em>
          </h1>

          <div>
            <span className="dash-hero-handle">
              @{user?.username || 'traveler'}
            </span>
          </div>

          <p className="dash-hero-bio">
            {user?.bio ? (
              user.bio
            ) : (
              <span>
                No bio yet.{' '}
                <button
                  type="button"
                  className="dash-hero-bio-link"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Add one for your public profile →
                </button>
              </span>
            )}
          </p>

          <div className="dash-hero-actions">
            <button
              type="button"
              className="dash-btn-create-trip"
              onClick={handleOpenCreate}
            >
              <span>+</span> Create Trip
            </button>

            {user?.username && (
              <Link to={`/profile/${user.username}`} className="dash-btn-public-link">
                <span>Public profile link</span>
                <span>↗</span>
              </Link>
            )}
          </div>

          {/* 4 Stats Cards */}
          <div className="dash-stats-row">
            <div className="dash-stat-card">
              <div className="dash-stat-number">{stats.trips}</div>
              <div className="dash-stat-title">TRIPS</div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-number">{stats.photos}</div>
              <div className="dash-stat-title">PHOTOS</div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-number">{stats.places}</div>
              <div className="dash-stat-title">PLACES</div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-stat-number">{stats.countries}</div>
              <div className="dash-stat-title">COUNTRIES</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Trips Section */}
      <main className="dash-main-section">
        {/* Error Alert */}
        {error && (
          <div className="auth-alert-error" style={{ marginBottom: '24px' }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={fetchTrips} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fca5a5', textDecoration: 'underline', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {/* Toolbar: Heading, Search & Sort */}
        <div className="dash-toolbar">
          <h2 className="dash-section-title">My travel memories</h2>

          <div className="dash-controls-group">
            <input
              type="text"
              className="dash-search-input"
              placeholder="🔍 Search trips, places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="dash-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest first ▾</option>
              <option value="oldest">Oldest first</option>
              <option value="rating">Highest rating</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Trips Content */}
        {tripsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8d949b' }}>
            <p>Fetching your trips...</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="dash-empty-card">
            <div className="dash-empty-icon">🏖️</div>
            <h3>No trips found</h3>
            <p>
              {searchTerm
                ? `No trips matching "${searchTerm}". Try another search term.`
                : 'Your travel vault is currently empty. Start logging your unforgettable adventures around the world.'}
            </p>
            <button
              type="button"
              className="dash-btn-create-trip"
              style={{ margin: '0 auto' }}
              onClick={handleOpenCreate}
            >
              <span>+</span> Create Trip
            </button>
          </div>
        ) : (
          <div className="dash-trips-grid">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteTrip}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Trip Modal */}
      {isFormOpen && (
        <TripForm
          initialData={editingTrip}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="dash-modal-overlay" role="dialog" aria-modal="true">
          <div className="dash-modal-card">
            <div className="dash-modal-header">
              <h3>Edit Your Profile</h3>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setIsEditProfileOpen(false)}
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div className="auth-alert-error">
                <span>⚠️</span>
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="auth-alert-success">
                <span>✅</span>
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="profile-username">
                  Username
                </label>
                <input
                  type="text"
                  id="profile-username"
                  name="username"
                  className="auth-input"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. explorer_alex"
                  required
                  maxLength={30}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                  Public profile: /profile/{profileUsername || 'username'}
                </span>
              </div>

              <div className="auth-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="auth-field-label" htmlFor="profile-bio">
                    Bio / About You
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {profileBio.length} / 300
                  </span>
                </div>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows="4"
                  className="auth-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Share a short bio or travel philosophy..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  maxLength={300}
                />
              </div>

              <div className="dash-modal-actions">
                <button
                  type="button"
                  className="dash-btn-modal-cancel"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={profileSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dash-btn-modal-submit"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Footer (Deliverable #6) */}
      <Footer />
    </div>
  );
};

export default Dashboard;
