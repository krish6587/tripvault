import React from 'react';
import { useNavigate } from 'react-router-dom';

import p00 from '../assets/landing/p00.jpg';
import p01 from '../assets/landing/p01.jpg';
import p02 from '../assets/landing/p02.jpg';
import p03 from '../assets/landing/p03.jpg';
import p04 from '../assets/landing/p04.jpg';
import p05 from '../assets/landing/p05.jpg';

const sampleImages = [p00, p01, p02, p03, p04, p05];

/**
 * TripCard Component
 * Displays individual trip details matching Screenshot 2:
 * - Cover image with photo count and star rating badges
 * - Uppercase accent destination tag (e.g. • HIMALAYAS)
 * - Serif font title
 * - Date range with calendar icon
 * - Description snippet
 * - Footer with 'View details & photos →' and edit/delete actions
 */
const TripCard = ({ trip, onEdit, onDelete, isPublic = false }) => {
  const navigate = useNavigate();

  // Pick deterministic fallback cover if not present
  const getCoverImage = () => {
    if (trip.coverImage) return trip.coverImage;
    const str = trip._id || trip.title || 'trip';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return sampleImages[Math.abs(hash) % sampleImages.length];
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Dates not specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    if (start && end) {
      const startDateStr = new Date(start).toLocaleDateString('en-US', options);
      const endDateStr = new Date(end).toLocaleDateString('en-US', options);
      return `${startDateStr} — ${endDateStr}`;
    }
    if (start) return `From ${new Date(start).toLocaleDateString('en-US', options)}`;
    return `Until ${new Date(end).toLocaleDateString('en-US', options)}`;
  };

  const renderStars = (rating) => {
    if (!rating) return '★★★★★';
    const count = Math.min(Math.max(Math.round(rating), 1), 5);
    return '★'.repeat(count);
  };

  const handleCardClick = () => {
    navigate(`/trips/${trip._id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to delete "${trip.title}"? This action cannot be undone.`
    );
    if (confirmed && onDelete) {
      onDelete(trip._id);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(trip);
    }
  };

  const photoCount = Array.isArray(trip.photos) ? trip.photos.length : 1;
  const ratingStars = renderStars(trip.rating);

  return (
    <div
      className="trip-card-polaroid"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Trip to ${trip.destination}: ${trip.title}`}
    >
      {/* Cover Image Container */}
      <div className="trip-card-img-wrap">
        <img
          src={getCoverImage()}
          alt={trip.title}
          loading="lazy"
        />

        {/* Photo count badge (top-left) */}
        <div className="trip-card-photo-badge" title={`${photoCount} photo${photoCount > 1 ? 's' : ''}`}>
          <span>📷</span>
          <span>{photoCount}</span>
        </div>

        {/* Star rating badge (top-right) */}
        <div className="trip-card-stars-badge" title={`Rating: ${trip.rating || 5} / 5`}>
          {ratingStars}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="trip-card-body">
        {trip.destination && (
          <div className="trip-card-tag">
            • {trip.destination}
          </div>
        )}

        <h3 className="trip-card-title">{trip.title}</h3>

        <div className="trip-card-date">
          <span>📅</span>
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        {trip.description && (
          <p className="trip-card-desc">{trip.description}</p>
        )}

        {/* Card Footer */}
        <div className="trip-card-bottom">
          <span className="trip-card-link-text">
            View details & photos →
          </span>

          {!isPublic && (
            <div className="trip-card-actions-group">
              <button
                type="button"
                className="trip-card-btn-action"
                onClick={handleEditClick}
                title="Edit trip"
                aria-label="Edit trip"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="trip-card-btn-action trip-card-btn-delete"
                onClick={handleDeleteClick}
                title="Delete trip"
                aria-label="Delete trip"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
