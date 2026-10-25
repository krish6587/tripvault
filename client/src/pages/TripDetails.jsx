import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import Footer from '../components/Footer';

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
      const msg = err.response?.data?.message || 'Failed to load trip details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Upload an additional photo to this trip (Deliverable #3)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file (JPEG, PNG, WEBP, etc.).';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'File size exceeds 5MB limit.';
      setError(msg);
      toast.error(msg);
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
        toast.success('Photo uploaded to Cloudinary successfully! 📸');
        setUploadSuccess('Photo uploaded successfully!');
        setTrip(res.data.trip);
        setTimeout(() => setUploadSuccess(''), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload photo.';
      setError(msg);
      toast.error(msg);
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
    if (!rating) return '★★★★★';
    const count = Math.min(Math.max(Math.round(rating), 1), 5);
    return '★'.repeat(count);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8d949b', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontStyle: 'italic' }}>
          Loading your travel memories...
        </p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div style={{ minHeight: '100vh', background: '#07090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#efe9df' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px 24px', borderRadius: '10px', color: '#fca5a5', maxWidth: '420px', textAlign: 'center' }}>
          <span>⚠️</span> {error}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ marginTop: 20, background: '#efe9df', color: '#07090b', border: 'none', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  const photos = Array.isArray(trip.photos) ? trip.photos : [];

  return (
    <div style={{ minHeight: '100vh', background: '#07090b', color: '#efe9df', fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', color: '#efe9df', textDecoration: 'none' }}>
          TripVault
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ border: '1px solid rgba(255, 255, 255, 0.18)', background: 'rgba(255, 255, 255, 0.04)', color: '#efe9df', borderRadius: '9999px', padding: '7px 18px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            ← Back
          </button>
          <Link
            to="/dashboard"
            style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '7px 20px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', fontWeight: 600 }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px 60px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        {/* Hero Card */}
        <div style={{ background: '#0e1217', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 45px rgba(0,0,0,0.6)', marginBottom: '40px' }}>
          {trip.coverImage ? (
            <div style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
              <img src={trip.coverImage} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,9,11,0.2) 0%, rgba(7,9,11,0.85) 100%)' }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>🗺️</span>
            </div>
          )}

          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ea580c', fontWeight: 700 }}>
                • {trip.destination}
              </span>
              <span style={{ color: '#f59e0b', letterSpacing: '2px', fontSize: '13px' }}>
                {renderStars(trip.rating)}
              </span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#efe9df', margin: '0 0 10px 0', lineHeight: 1.15 }}>
              {trip.title}
            </h1>

            <p style={{ fontSize: '13px', color: '#8d949b', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 20px 0' }}>
              <span>📅</span>
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </p>

            {trip.description && (
              <p style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255, 255, 255, 0.03)', padding: '18px 22px', borderRadius: '10px', borderLeft: '3px solid #ea580c', margin: 0 }}>
                {trip.description}
              </p>
            )}
          </div>
        </div>

        {/* Photo Gallery Grid Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '32px', color: '#efe9df', margin: '0 0 6px 0', fontWeight: 300 }}>
                Trip Photos & Memories 📸
              </h2>
              <p style={{ fontSize: '13px', color: '#8d949b', margin: 0 }}>
                {photos.length === 0
                  ? 'No photos uploaded yet. Upload memories from your trip below!'
                  : `${photos.length} photo${photos.length > 1 ? 's' : ''} stored securely in Cloudinary`}
              </p>
            </div>

            {/* Quick Upload Button */}
            <label style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '10px 24px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>{uploading ? '⏳ Uploading...' : '+ Upload Photo'}</span>
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
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '56px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📷</span>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#efe9df', margin: '12px 0 6px' }}>
                No photos yet
              </h3>
              <p style={{ color: '#8d949b', fontSize: '13.5px', marginBottom: '20px' }}>
                Capture and upload your favorite scenic views, food, and moments!
              </p>
              <label style={{ background: '#efe9df', color: '#07090b', borderRadius: '9999px', padding: '10px 24px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', background: '#11141a', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', transition: 'transform 0.25s' }}
                  onClick={() => setSelectedPhoto(url)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' ? setSelectedPhoto(url) : null)}
                  aria-label={`View photo ${idx + 1} full size`}
                >
                  <img src={url} alt={`${trip.title} memory ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#efe9df', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                  >
                    <span>🔍 Full View</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto} alt="Full resolution trip memory" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }} />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close image preview"
              style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#efe9df', color: '#07090b', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Footer (Deliverable #6) */}
      <Footer />
    </div>
  );
};

export default TripDetails;
