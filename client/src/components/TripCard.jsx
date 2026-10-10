import React from 'react';

/**
 * TripCard Component
 * Displays individual trip details: title, destination, formatted dates, rating, and actions.
 *
 * @param {Object} props
 * @param {Object} props.trip - The trip data object.
 * @param {Function} props.onEdit - Callback when card/edit button is clicked.
 * @param {Function} props.onDelete - Callback when delete button is confirmed and clicked.
 */
const TripCard = ({ trip, onEdit, onDelete }) => {
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

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent triggering onEdit from card click
    const confirmed = window.confirm(`Are you sure you want to delete "${trip.title}"? This action cannot be undone.`);
    if (confirmed) {
      onDelete(trip._id);
    }
  };

  return (
    <div
      className="trip-card"
      onClick={() => onEdit(trip)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(trip);
        }
      }}
      aria-label={`Trip to ${trip.destination}: ${trip.title}. Click to edit.`}
    >
      <div className="trip-card-header">
        <div className="trip-badge">
          <span>📍</span> {trip.destination}
        </div>
        <div className="trip-rating">{renderStars(trip.rating)}</div>
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
        <span className="trip-click-hint">Click to edit</span>
        <div className="trip-actions">
          <button
            type="button"
            className="btn-card-action btn-card-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(trip);
            }}
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
      </div>
    </div>
  );
};

export default TripCard;
