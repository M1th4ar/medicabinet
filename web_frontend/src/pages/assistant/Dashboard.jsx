import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';

const PAGE_SIZE = 5;

const getPatientFromResponse = (data) => data.patient || data;

const PatientDetails = ({ patientId, token, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editPatient, setEditPatient] = useState(false);
  const [patientForm, setPatientForm] = useState({});

  const fetchData = async () => {
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const pRes = await axios.get(`/assistant/patients/${patientId}`, config);
      setPatient(getPatientFromResponse(pRes.data));
      setPatientForm(getPatientFromResponse(pRes.data));
    } catch {
      setPatient(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [patientId, token]);

  const handlePatientEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/assistant/patients/${patientId}`, patientForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setEditPatient(false);
    } catch {
      alert('Failed to update patient');
    }
  };

  if (loading) return (
      <div className="modal-overlay">
        <div className="patient-modal">
          <div className="loading-spinner"></div>
          <p>Loading patient details...</p>
        </div>
      </div>
  );

  if (!patient) return (
      <div className="modal-overlay">
        <div className="patient-modal">
          <button onClick={onClose} className="close-button">✖</button>
          <div className="error-message">Failed to load patient details.</div>
        </div>
      </div>
  );

  return (
      <div className="modal-overlay">
        <div className="patient-modal">
          <button onClick={onClose} className="close-button">✖</button>

          <div className="section">
            <div className="section-header">
              <h3>👤 Patient Information</h3>
              {!editPatient && (
                  <button onClick={() => setEditPatient(true)} className="edit-button">Edit</button>
              )}
            </div>

            {editPatient ? (
                <form onSubmit={handlePatientEdit} className="patient-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                        value={patientForm.full_name || ''}
                        onChange={e => setPatientForm(f => ({ ...f, full_name: e.target.value }))}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                        value={patientForm.email || ''}
                        onChange={e => setPatientForm(f => ({ ...f, email: e.target.value }))}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={patientForm.password || ''}
                        onChange={e => setPatientForm(f => ({ ...f, password: e.target.value }))}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                        value={patientForm.phone || ''}
                        onChange={e => setPatientForm(f => ({ ...f, phone: e.target.value }))}
                        required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                        value={patientForm.address || ''}
                        onChange={e => setPatientForm(f => ({ ...f, address: e.target.value }))}
                        required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-button">Save Changes</button>
                    <button type="button" onClick={() => setEditPatient(false)} className="secondary-button">Cancel</button>
                  </div>
                </form>
            ) : (
                <div className="patient-info-grid">
                  <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{patient.id || patientId}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{patient.full_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{patient.address || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender:</span>
                    <span className="info-value">{patient.gender || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{patient.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{patient.phone || 'N/A'}</span>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

const AssistantDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientPage, setPatientPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [groupedAppointments, setGroupedAppointments] = useState({});

  const token = localStorage.getItem('token');

  const groupAppointmentsByDate = (appts) => {
    return appts.reduce((groups, appointment) => {
      const dateKey = new Date(appointment.time).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(appointment);
      return groups;
    }, {});
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('assistant/appointments', config);
      setAppointments(res.data.appointments);

      const patientIds = [...new Set(res.data.appointments.map(a => a.patient_id))];
      const patientData = {};

      await Promise.all(
          patientIds.map(async (id) => {
            const pRes = await axios.get(`/assistant/patients/${id}`, config);
            patientData[id] = getPatientFromResponse(pRes.data);
          })
      );

      setPatients(patientData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load assistant dashboard');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const isToday = (dateStr) => {
    const today = new Date();
    const apptDate = new Date(dateStr);
    return (
        today.getFullYear() === apptDate.getFullYear() &&
        today.getMonth() === apptDate.getMonth() &&
        today.getDate() === apptDate.getDate()
    );
  };

  // Filter appointments based on all criteria
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = searchTerm
        ? patients[a.patient_id]?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

    const matchesDate = dateFilter
        ? new Date(a.time).toLocaleDateString('fr-DZ') === new Date(dateFilter).toLocaleDateString('fr-DZ')
        : true;

    const matchesToday = showTodayOnly ? isToday(a.time) : true;
    const matchesCompleted = showCompletedOnly ? a.status === 'completed' : true;

    return matchesSearch && matchesDate && matchesToday && matchesCompleted;
  });

  // Group the filtered appointments
  useEffect(() => {
    const grouped = groupAppointmentsByDate(filteredAppointments);
    setGroupedAppointments(grouped);
  }, [filteredAppointments]);

  // Count today's appointments
  const todaysAppointmentsCount = appointments.filter(a =>
      isToday(a.time) && a.status === 'scheduled'
  ).length;

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!window.confirm(`Change appointment status to ${newStatus}?`)) return;

    try {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: true }));

      await axios.put(
          `/assistant/appointments/${appointmentId}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAppointments();
    } catch (err) {
      alert('Failed to update appointment status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/assistant/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // ignore error, proceed to clear token
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
      <div className="assistant-dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <span className="dashboard-icon">👩‍⚕️</span>
            <h1>Medical Assistant Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="Search patient by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPatientPage(1);
                }}
            />
          </div>
          {/*<div className="date-search">
            <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPatientPage(1);
                }}
                className="date-input"
            />
            {dateFilter && (
                <button
                    onClick={() => setDateFilter('')}
                    className="clear-date"
                >
                  Clear
                </button>
            )}
          </div>*/}
        </div>

        <div className="dashboard-section">
          <div className="appointments-header">
            <div className="header-main">
              <h2>📅 All Appointments</h2>
              <span className="appointment-count">
              {todaysAppointmentsCount} today's appointment{todaysAppointmentsCount !== 1 ? 's' : ''}
            </span>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <span className="filter-label">Filter by:</span>

                <div className="date-filter">
                  <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setPatientPage(1);
                      }}
                      className="date-input"
                  />
                  {dateFilter && (
                      <button
                          onClick={() => setDateFilter('')}
                          className="clear-date"
                      >
                        Clear
                      </button>
                  )}
                </div>

                <label className="filter-option">
                  <input
                      type="checkbox"
                      checked={showTodayOnly}
                      onChange={() => {
                        setShowTodayOnly(!showTodayOnly);
                        setPatientPage(1);
                      }}
                  />
                  <span>Today</span>
                </label>

                <label className="filter-option">
                  <input
                      type="checkbox"
                      checked={showCompletedOnly}
                      onChange={() => {
                        setShowCompletedOnly(!showCompletedOnly);
                        setPatientPage(1);
                      }}
                  />
                  <span>Completed</span>
                </label>
              </div>
            </div>
          </div>

          {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading appointments...</p>
              </div>
          ) : Object.keys(groupedAppointments).length > 0 ? (
              Object.entries(groupedAppointments)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, dateAppointments]) => (
                      <div key={date} className="date-group">
                        <h3 className="date-header">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <div className="appointments-grid">
                          {dateAppointments
                              .sort((a, b) => new Date(a.time) - new Date(b.time))
                              .map(appt => (
                                  <div key={appt.appointment_id} className="appointment-card">
                                    <div className="appointment-header">
                                      <span className={`status-badge ${appt.status}`}>{appt.status}</span>
                                      <span className="appointment-time">
                            {new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                                    </div>

                                    <div className="patient-info">
                                      <div className="patient-avatar">
                                        {patients[appt.patient_id]?.full_name?.charAt(0) || 'P'}
                                      </div>
                                      <div className="patient-details">
                                        <h4>{patients[appt.patient_id]?.full_name || 'Loading...'}</h4>
                                        <p>Patient ID: {appt.patient_id}</p>
                                      </div>
                                    </div>

                                    <div className="appointment-actions">
                                      <div className="status-select">
                                        <label>Status:</label>
                                        <select
                                            value={appt.status}
                                            onChange={(e) => handleStatusUpdate(appt.appointment_id, e.target.value)}
                                            disabled={updatingStatus[appt.appointment_id]}
                                        >
                                          <option value="scheduled">Scheduled</option>
                                          <option value="completed">Completed</option>
                                          <option value="cancelled">Cancelled</option>
                                        </select>
                                        {updatingStatus[appt.appointment_id] && (
                                            <span className="updating-indicator">Updating...</span>
                                        )}
                                      </div>

                                      <button
                                          onClick={() => setSelectedPatientId(appt.patient_id)}
                                          className="action-button view"
                                      >
                                        View Patient
                                      </button>
                                    </div>
                                  </div>
                              ))}
                        </div>
                      </div>
                  ))
          ) : (
              <div className="empty-state">
                <p>No appointments found</p>
              </div>
          )}
        </div>

        {selectedPatientId && (
            <PatientDetails
                patientId={selectedPatientId}
                token={token}
                onClose={() => setSelectedPatientId(null)}
            />
        )}

        <style jsx>{`

        .appointments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .header-main {
          display: flex;
          align-items: center;
          gap: 2.75rem;
        }

        .appointment-count {
          background: #e3f2fd;
          color: #1976d2;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .filter-controls {
          display: flex;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #f8f9fa;
          padding: 8px 16px;
          border-radius: 8px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-weight: 500;
          color: #5a6570;
          font-size: 0.95rem;
        }

        .filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .filter-option:hover {
          background: #e9ecef;
        }

        .filter-option input {
          margin: 0;
          cursor: pointer;
        }

        .date-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .clear-date {
          background: #f0f4f8;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 14px;
        }

        .clear-date:hover {
          background: #e3eaf3;
        }

        @media (max-width: 768px) {
          .appointments-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-group {
            width: 100%;
            justify-content: space-between;
          }

          .header-main {
            width: 100%;
            justify-content: space-between;
            gap: 1rem;
          }
        }
        
        .assistant-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #2c3e50;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .dashboard-icon {
          font-size: 28px;
        }
        
        .logout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .logout-button:hover {
          background: #c0392b;
        }
        
        .search-container {
          margin-bottom: 30px;
        }
        
        .search-box {
          position: relative;
          max-width: 500px;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 20px 12px 40px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }
        
        .dashboard-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 25px;
          margin-bottom: 30px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 1.5rem;
          color: #2c3e50;
        }
        
        .appointment-count {
          background: #e3f2fd;
          color: #1976d2;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .appointment-card {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 20px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .appointment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        }
        
        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .status-badge.scheduled {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .status-badge.completed {
          background: #e8f5e9;
          color: #388e3c;
        }
        
        .status-badge.cancelled {
          background: #ffebee;
          color: #d32f2f;
        }
        
        .appointment-time {
          font-weight: 600;
          color: #7f8c8d;
        }
        
        .patient-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .patient-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #3498db;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .patient-details h4 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
        }
        
        .patient-details p {
          margin: 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .appointment-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .status-select {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-select label {
          font-weight: 500;
          font-size: 0.95rem;
        }
        
        .status-select select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          flex: 1;
        }
        
        .updating-indicator {
          color: #7f8c8d;
          font-size: 0.85rem;
          margin-left: 10px;
        }
        
        .action-button {
          width: 100%;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
          text-align: center;
        }
        
        .action-button.view {
          background: #2196f3;
          color: white;
        }
        
        .action-button.view:hover {
          background: #1976d2;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 25px;
          gap: 15px;
        }
        
        .pagination-button {
          padding: 8px 16px;
          background: #f0f4f8;
          border: 1px solid #dbe1e8;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-button:hover:not(:disabled) {
          background: #e3eaf3;
        }
        
        .pagination-info {
          font-size: 0.95rem;
          color: #5a6570;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #7f8c8d;
          background: #f8f9fa;
          border-radius: 10px;
          margin: 20px 0;
        }
        
        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .patient-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          cursor: pointer;
          color: #7f8c8d;
          font-size: 1.5rem;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 1.3rem;
        }
        
        .patient-form .form-group {
          margin-bottom: 20px;
        }
        
        .patient-form label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .patient-form input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .primary-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
        }
        
        .secondary-button {
          background: #f0f4f8;
          color: #2c3e50;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
        }
        
        .patient-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-weight: 600;
          margin-bottom: 4px;
          color: #5a6570;
          font-size: 0.9rem;
        }
        
        .info-value {
          font-size: 1rem;
        }
        
        .edit-button {
          background: #e3f2fd;
          color: #1976d2;
          border: none;
          padding: 8px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
  );
};

export default AssistantDashboard;