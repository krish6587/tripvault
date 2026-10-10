import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TripCard from '../components/TripCard';
import TripForm from '../components/TripForm';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

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
        // Automatically refresh trip list
        fetchTrips();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trip. Please try again.');
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
        {/* Dashboard Actions Bar */}
        <div className="dashboard-header-banner">
          <div>
            <h1 className="dashboard-page-title">My Travel Memories 🗺️</h1>
            <p className="dashboard-subtitle">
              Manage your personal journeys, rate your experiences, and save travel memories.
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
            <button
              onClick={fetchTrips}
              className="btn-link-retry"
            >
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
    </div>
  );
};

export default Dashboard;
