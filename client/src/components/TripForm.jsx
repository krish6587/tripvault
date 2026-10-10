import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Reusable TripForm component for both Create and Edit operations.
 *
 * @param {Object} props
 * @param {Object} [props.initialData] - Optional trip data for edit mode. If provided, form operates in Edit mode.
 * @param {Function} props.onSuccess - Callback after successful create/update to refresh trips.
 * @param {Function} props.onCancel - Callback to close/cancel the form.
 */
const TripForm = ({ initialData = null, onSuccess, onCancel }) => {
  const isEditMode = Boolean(initialData && initialData._id);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    rating: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to format ISO date string to YYYY-MM-DD for date inputs
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  useEffect(() => {
    setFormData({
      title: initialData?.title || '',
      destination: initialData?.destination || '',
      startDate: formatDateForInput(initialData?.startDate),
      endDate: formatDateForInput(initialData?.endDate),
      description: initialData?.description || '',
      rating: initialData?.rating !== undefined && initialData?.rating !== null ? String(initialData.rating) : ''
    });
    setError('');
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.title.trim()) {
      setError('Trip title is required.');
      return;
    }

    if (!formData.destination.trim()) {
      setError('Destination is required.');
      return;
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError('End date cannot be earlier than start date.');
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      destination: formData.destination.trim(),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      description: formData.description.trim(),
      rating: formData.rating ? Number(formData.rating) : null
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await api.put(`/trips/${initialData._id}`, payload);
      } else {
        await api.post('/trips', payload);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Failed to save trip. Please try again.';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="trip-form-title">
      <div className="modal-card">
        <div className="modal-header">
          <h3 id="trip-form-title">
            {isEditMode ? '✏️ Edit Trip' : '✈️ Create New Trip'}
          </h3>
          <button
            type="button"
            className="btn-icon-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="trip-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Trip Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="e.g., Summer in Kyoto, Roadtrip across Italy"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination" className="form-label">
              Destination <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              className="form-input"
              placeholder="e.g., Kyoto, Japan"
              value={formData.destination}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group form-col">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-col">
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rating" className="form-label">
              Trip Rating (Optional)
            </label>
            <select
              id="rating"
              name="rating"
              className="form-input"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="">No rating (Unrated)</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 - Incredible)</option>
              <option value="4">⭐⭐⭐⭐ (4 - Great)</option>
              <option value="3">⭐⭐⭐ (3 - Good)</option>
              <option value="2">⭐⭐ (2 - Fair)</option>
              <option value="1">⭐ (1 - Poor)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Notes & Memories
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="form-input form-textarea"
              placeholder="Add your travel highlights, favorite spots, foods, or itinerary notes..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-trip-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
