import React, { useState } from 'react';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const AddOfficeHour = ({ onAdd, userId, userRole }) => {
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onAdd({ dayOfWeek, startTime, endTime });
      // Reset form if success (caller will handle UI update)
    } catch (err) {
      setError(err.message || 'Failed to add office hour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-slot-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Day</label>
        <select
          className="form-input"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          required
        >
          {DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input
          type="time"
          className="form-input"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <input
          type="time"
          className="form-input"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Adding...' : 'Add Slot'}
      </button>

      {error && <div className="error-msg">{error}</div>}
    </form>
  );
};

export default AddOfficeHour;
