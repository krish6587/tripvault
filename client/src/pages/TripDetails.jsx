import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Lightbox modal
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Fetch single trip details
  const fetchTrip = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/trips/${id}`);
      if (res.data?.success && res.data?.trip) {
        setTrip(res.data.trip);
      } else {
        setError('Trip not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Upload an additional photo to this trip
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadSuccess('');

      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post(`/trips/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setUploadSuccess('Photo uploaded successfully!');
        setTrip(res.data.trip);
        setTimeout(() => setUploadSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset file input
    }
  };

  // Format dates
  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Dates not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    if (start && end) {
      return `${new Date(start).toLocaleDateString('en-US', options)} — ${new Date(end).toLocaleDateString('en-US', options)}`;
    }
    if (start) return `From ${new Date(start).toLocaleDateString('en-US', options)}`;
    return `Until ${new Date(end).toLocaleDateString('en-US', options)}`;
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="no-rating">Unrated</span>;
    const count = Math.min(Math.max(Math.round(rating), 1), 5);
    return (
      <span className="star-rating" title={`Rated ${rating} out of 5 stars`}>
        {'⭐'.repeat(count)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading trip details...</p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="trip-details-container">
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginTop: 16 }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const photos = Array.isArray(trip.photos) ? trip.photos : [];

  return (
    <div className="trip-details-layout">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <span>✈️</span> TripVault
        </div>
        <div className="navbar-user">
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
            ← Back
          </button>
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="trip-details-main">
        {/* Alerts */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {uploadSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span>✅</span> {uploadSuccess}
          </div>
        )}

        {/* Hero Header Card */}
        <div className="trip-hero-card">
          {trip.coverImage ? (
            <div className="trip-hero-image-wrap">
              <img src={trip.coverImage} alt={trip.title} className="trip-hero-image" />
              <div className="trip-hero-overlay"></div>
            </div>
          ) : (
            <div className="trip-hero-placeholder">
              <span style={{ fontSize: '3rem' }}>🗺️</span>
            </div>
          )}

          <div className="trip-hero-info">
            <div className="trip-hero-badges">
              <span className="trip-badge">📍 {trip.destination}</span>
              <span className="trip-rating-badge">{renderStars(trip.rating)}</span>
            </div>
            <h1 className="trip-hero-title">{trip.title}</h1>
            <p className="trip-hero-dates">📅 {formatDateRange(trip.startDate, trip.endDate)}</p>
            {trip.description && <p className="trip-hero-description">{trip.description}</p>}
          </div>
        </div>

        {/* Photo Gallery Grid Section */}
        <section className="photo-grid-section">
          <div className="photo-grid-header">
            <div>
              <h2 className="section-title">Trip Photos & Memories 📸</h2>
              <p className="section-subtitle">
                {photos.length === 0
                  ? 'No photos uploaded yet. Upload memories from your trip below!'
                  : `${photos.length} photo${photos.length > 1 ? 's' : ''} stored securely in Cloudinary`}
              </p>
            </div>

            {/* Quick Upload Button */}
            <label className="btn btn-primary btn-upload-photo">
              <span>{uploading ? '⏳ Uploading...' : '➕ Upload Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {photos.length === 0 ? (
            <div className="empty-photos-box">
              <span style={{ fontSize: '2.5rem' }}>📷</span>
              <h3>No photos yet</h3>
              <p>Capture and upload your favorite scenic views, food, and moments!</p>
              <label className="btn btn-primary" style={{ marginTop: 12 }}>
                <span>{uploading ? 'Uploading...' : 'Upload First Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="photo-grid">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="photo-grid-item"
                  onClick={() => setSelectedPhoto(url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' ? setSelectedPhoto(url) : null)}
                  aria-label={`View photo ${idx + 1} full size`}
                >
                  <img src={url} alt={`${trip.title} memory ${idx + 1}`} loading="lazy" />
                  <div className="photo-grid-hover-overlay">
                    <span>🔍 View Full</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Full resolution trip memory" className="lightbox-img" />
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close image preview"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
