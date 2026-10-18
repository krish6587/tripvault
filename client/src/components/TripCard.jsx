import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * TripCard Component
 * Displays individual trip details: cover image, title, destination, dates, rating, photo count, and actions.
 *
 * @param {Object} props
 * @param {Object} props.trip - The trip data object.
 * @param {Function} [props.onEdit] - Callback when edit button is clicked.
 * @param {Function} [props.onDelete] - Callback when delete button is confirmed and clicked.
 * @param {Boolean} [props.isPublic] - If true, displays in public mode (no edit/delete buttons).
 */
const TripCard = ({ trip, onEdit, onDelete, isPublic = false }) => {
  const navigate = useNavigate();

  // Format dates cleanly
  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Dates not specified';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    if (start && end) {
      const startDateStr = new Date(start).toLocaleDateString('en-US', options);
      const endDateStr = new Date(end).toLocaleDateString('en-US', options);
      return `${startDateStr} — ${endDateStr}`;
    }

    if (start) {
      return `From ${new Date(start).toLocaleDateString('en-US', options)}`;
    }

    return `Until ${new Date(end).toLocaleDateString('en-US', options)}`;
  };

  // Render star ratings
  const renderStars = (rating) => {
    if (!rating) return <span className="no-rating">Unrated</span>;
    const count = Math.min(Math.max(Math.round(rating), 1), 5);
    return (
      <span className="star-rating" title={`Rated ${rating} out of 5 stars`}>
        {'⭐'.repeat(count)}
      </span>
    );
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

  const photoCount = Array.isArray(trip.photos) ? trip.photos.length : 0;

  return (
    <div
      className="trip-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Trip to ${trip.destination}: ${trip.title}. Click to view details and photos.`}
    >
      {/* Cover Image or Fallback Banner */}
      <div className="trip-card-image-container">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="trip-card-cover-image"
            loading="lazy"
          />
        ) : (
          <div className="trip-card-placeholder-banner">
            <span className="placeholder-icon">🗺️</span>
            <span className="placeholder-text">{trip.destination}</span>
          </div>
        )}

        {/* Photo Count Badge */}
        {photoCount > 0 && (
          <span className="trip-photo-count-badge" title={`${photoCount} photo${photoCount > 1 ? 's' : ''} uploaded`}>
            📸 {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </span>
        )}

        {/* Rating Overlay */}
        <div className="trip-rating-badge">{renderStars(trip.rating)}</div>
      </div>

      <div className="trip-card-content">
        <div className="trip-badge">
          <span>📍</span> {trip.destination}
        </div>

        <h3 className="trip-card-title">{trip.title}</h3>

        <div className="trip-card-dates">
          <span className="calendar-icon">📅</span>
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        {trip.description && (
          <p className="trip-card-description">{trip.description}</p>
        )}

        <div className="trip-card-footer">
          <span className="trip-click-hint">View details & photos →</span>

          {!isPublic && (
            <div className="trip-actions">
              <button
                type="button"
                className="btn-card-action btn-card-edit"
                onClick={handleEditClick}
                title="Edit trip"
                aria-label="Edit trip"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="btn-card-action btn-card-delete"
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
