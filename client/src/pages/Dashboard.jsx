import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');

      // If no token exists, immediately redirect to login
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        } else {
          throw new Error('Could not fetch user profile');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    // Remove token and send user back to login page
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
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
          <button onClick={handleLogout} className="btn btn-logout" id="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        <div className="welcome-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Welcome, {user?.name}! 👋</h2>
            <div className="status-badge">
              <span>●</span> Authenticated Session
            </div>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Your travel journal authentication was verified successfully.
          </p>

          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-item-label">Full Name</span>
              <span className="profile-item-value" id="user-name-display">{user?.name}</span>
            </div>

            <div className="profile-item">
              <span className="profile-item-label">Email Address</span>
              <span className="profile-item-value" id="user-email-display">{user?.email}</span>
            </div>

            <div className="profile-item">
              <span className="profile-item-label">Account Created</span>
              <span className="profile-item-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Active User'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
