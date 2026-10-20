import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';
import TripForm from '../components/TripForm';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [error, setError] = useState('');
  
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
        fetchTrips();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trip. Please try again.');
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
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileSuccess('');
        }, 1200);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading your TripVault dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>✈️</span> TripVault
        </div>

        <div className="navbar-user">
          {/* Deliverable #12: My Profile link */}
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="btn btn-secondary btn-sm btn-my-profile"
              id="my-profile-btn"
              title="View your public profile"
            >
              <span>👤</span> My Profile
            </Link>
          )}

          {/* Deliverable #11: Edit Profile button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="edit-profile-btn"
            onClick={() => {
              setProfileBio(user?.bio || '');
              setProfileUsername(user?.username || '');
              setProfileError('');
              setProfileSuccess('');
              setIsEditProfileOpen(true);
            }}
          >
            <span>✏️</span> Edit Profile
          </button>

          <span className="navbar-user-greeting">
            Hello, <strong>{user?.name || 'Traveler'}</strong>
          </span>

          <button onClick={handleLogout} className="btn btn-logout" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main-container">
        {/* User Profile Overview Mini-Banner */}
        <div className="user-profile-overview-card">
          <div className="user-overview-left">
            <div className="user-avatar-circle">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{(user?.name?.[0] || 'T').toUpperCase()}</span>
              )}
            </div>
            <div className="user-overview-details">
              <div className="user-name-line">
                <h2>{user?.name}</h2>
                <span className="user-handle-badge">@{user?.username}</span>
              </div>
              <p className="user-bio-display">
                {user?.bio || (
                  <span className="empty-bio-hint">
                    No bio yet.{' '}
                    <button
                      type="button"
                      className="btn-inline-link"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Add a bio to introduce yourself on your public profile →
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="user-overview-actions">
            {user?.username && (
              <Link to={`/profile/${user.username}`} className="btn btn-outline-primary btn-sm">
                <span>🔗</span> Public Profile Link
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Actions Bar */}
        <div className="dashboard-header-banner">
          <div>
            <h1 className="dashboard-page-title">My Travel Memories 🗺️</h1>
            <p className="dashboard-subtitle">
              Manage your personal journeys, upload photos, rate your experiences, and share your adventures.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-create-trip"
            id="create-trip-btn"
            onClick={handleOpenCreate}
          >
            <span>➕</span> Create Trip
          </button>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {error}
            <button onClick={fetchTrips} className="btn-link-retry">
              Retry
            </button>
          </div>
        )}

        {/* Trips List Section */}
        {tripsLoading ? (
          <div className="trips-loading-state">
            <div className="spinner"></div>
            <p>Fetching your trips...</p>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="empty-trips-card">
            <div className="empty-icon">🏖️</div>
            <h3>No trips yet, create your first one!</h3>
            <p>
              Your travel vault is currently empty. Start logging your unforgettable adventures around the world.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={handleOpenCreate}
            >
              <span>✈️</span> Create Your First Trip
            </button>
          </div>
        ) : (
          /* Trips Grid */
          <div className="trips-grid">
            {trips.map((trip) => (
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

      {/* Reusable Create/Edit Trip Modal Form */}
      {isFormOpen && (
        <TripForm
          initialData={editingTrip}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      )}

      {/* Edit Profile Modal (Deliverable #11) */}
      {isEditProfileOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="edit-profile-title">👤 Edit Your Profile</h3>
              <button
                type="button"
                className="btn-icon-close"
                onClick={() => setIsEditProfileOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div className="alert alert-error" role="alert">
                <span>⚠️</span> {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="alert alert-success" role="alert">
                <span>✅</span> {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="trip-form">
              <div className="form-group">
                <label htmlFor="profile-username" className="form-label">
                  Username <span className="required-star">*</span>
                </label>
                <div className="username-input-group">
                  <span className="username-prefix">@</span>
                  <input
                    type="text"
                    id="profile-username"
                    name="username"
                    className="form-input username-input-field"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. explorer_alex"
                    required
                    maxLength={30}
                  />
                </div>
                <span className="text-muted-hint">
                  Your public profile URL: /profile/{profileUsername || 'username'}
                </span>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="profile-bio" className="form-label">
                    Bio / About You
                  </label>
                  <span className="char-counter" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {profileBio.length} / 300
                  </span>
                </div>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows="4"
                  className="form-input form-textarea"
                  placeholder="Share a short bio, travel philosophy, favorite destinations, or hobbies..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  maxLength={300}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={profileSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="save-profile-btn"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving Profile...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
