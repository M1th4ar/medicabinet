import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';

const getPatientFromResponse = (data) => data.patient || data;

const ConsultationForm = ({ patientId, token, onSaved, initialNotes, consultationId }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = { patient_id: patientId, notes };

    try {
      if (consultationId) {
        await axios.put(`/doctor/consultations/${consultationId}`, data, config);
      } else {
        await axios.post('/doctor/consultations', data, config);
      }
      onSaved();
      setNotes('');
    } catch (err) {
      alert('Failed to save consultation');
    }
    setIsLoading(false);
  };

  return (
      <form onSubmit={handleSubmit} className="consultation-form">
      <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter consultation notes"
          required
          rows={4}
      />
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Consultation'}
          </button>
          {consultationId && (
              <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onSaved()}
              >
                Cancel
              </button>
          )}
        </div>
      </form>
  );
};

const PrescriptionForm = ({ patientId, token, onSaved, initialContent, prescriptionId }) => {
  const [content, setContent] = useState(initialContent || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const data = { patient_id: patientId, content };

    try {
      if (prescriptionId) {
        await axios.put(`/doctor/prescriptions/${prescriptionId}`, data, config);
      } else {
        await axios.post('/doctor/prescriptions', data, config);
      }
      onSaved();
      setContent('');
    } catch (err) {
      alert('Failed to save prescription');
    }
    setIsLoading(false);
  };

  return (
      <form onSubmit={handleSubmit} className="prescription-form">
      <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter prescription details"
          required
          rows={4}
      />
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Prescription'}
          </button>
          {prescriptionId && (
              <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onSaved()}
              >
                Cancel
              </button>
          )}
        </div>
      </form>
  );
};

const PatientDetails = ({ patientId, token, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPatient, setEditPatient] = useState(false);
  const [editConsultationId, setEditConsultationId] = useState(null);
  const [editPrescriptionId, setEditPrescriptionId] = useState(null);
  const [patientForm, setPatientForm] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [pRes, cRes, prRes] = await Promise.all([
        axios.get(`/doctor/patients/${patientId}`, config),
        axios.get(`/doctor/consultations?patient_id=${patientId}`, config),
        axios.get(`/doctor/prescriptions?patient_id=${patientId}`, config)
      ]);
      setPatient(getPatientFromResponse(pRes.data));
      setPatientForm(getPatientFromResponse(pRes.data));
      setConsultations(cRes.data.consultations || []);
      setPrescriptions(prRes.data.prescriptions || []);
    } catch {
      setPatient(null);
      setConsultations([]);
      setPrescriptions([]);
    }
    setLoading(false);
  }, [token, patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePatientEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/doctor/patients/${patientId}`, patientForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setEditPatient(false);
    } catch {
      alert('Failed to update patient');
    }
  };

  const handleDeleteConsultation = async (id) => {
    if (!window.confirm('Delete this consultation?')) return;
    try {
      await axios.delete(`/doctor/consultations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch {
      alert('Failed to delete consultation');
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await axios.delete(`/doctor/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch {
      alert('Failed to delete prescription');
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
                  <div className="info-item">
                    <span className="info-label">Birthday:</span>
                    <span className="info-value">{patient.birthday || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Weight:</span>
                    <span className="info-value">{patient.weight ? `${patient.weight} kg` : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Height:</span>
                    <span className="info-value">{patient.height ? `${patient.height} cm` : 'N/A'}</span>
                  </div>
                </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>📝 Consultations</h3>
            </div>

            <ConsultationForm
                patientId={patientId}
                token={token}
                onSaved={() => {
                  fetchData();
                  setEditConsultationId(null);
                }}
            />

            {consultations.length === 0 ? (
                <div className="empty-state">No consultations found for this patient.</div>
            ) : (
                <div className="records-list">
                  {consultations.map(c => (
                      <div key={c.consultation_id} className="record-card">
                        {editConsultationId === c.consultation_id ? (
                            <ConsultationForm
                                patientId={patientId}
                                token={token}
                                initialNotes={c.notes}
                                consultationId={c.consultation_id}
                                onSaved={() => {
                                  setEditConsultationId(null);
                                  fetchData();
                                }}
                            />
                        ) : (
                            <>
                              <div className="record-header">
                        <span className="record-date">
                          {new Date(c.created_at).toLocaleDateString()} at{' '}
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                                <div className="record-actions">
                                  <button
                                      onClick={() => setEditConsultationId(c.consultation_id)}
                                      className="edit-button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeleteConsultation(c.consultation_id)}
                                      className="delete-button"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="record-content">
                                <p>{c.notes}</p>
                              </div>
                            </>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>💊 Prescriptions</h3>
            </div>

            <PrescriptionForm
                patientId={patientId}
                token={token}
                onSaved={() => {
                  fetchData();
                  setEditPrescriptionId(null);
                }}
            />

            {prescriptions.length === 0 ? (
                <div className="empty-state">No prescriptions found for this patient.</div>
            ) : (
                <div className="records-list">
                  {prescriptions.map(p => (
                      <div key={p.prescription_id} className="record-card">
                        {editPrescriptionId === p.prescription_id ? (
                            <PrescriptionForm
                                patientId={patientId}
                                token={token}
                                initialContent={p.content}
                                prescriptionId={p.prescription_id}
                                onSaved={() => {
                                  setEditPrescriptionId(null);
                                  fetchData();
                                }}
                            />
                        ) : (
                            <>
                              <div className="record-header">
                        <span className="record-date">
                          {new Date(p.created_at).toLocaleDateString()} at{' '}
                          {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                                <div className="record-actions">
                                  <button
                                      onClick={() => setEditPrescriptionId(p.prescription_id)}
                                      className="edit-button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeletePrescription(p.prescription_id)}
                                      className="delete-button"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <div className="record-content">
                                <p>{p.content}</p>
                              </div>
                            </>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    today: false,
    completed: false,
    date: ''
  });

  const token = localStorage.getItem('token');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('doctor/appointments', config);
      setAppointments(res.data.appointments);

      const patientIds = [...new Set(res.data.appointments.map(a => a.patient_id))];
      const patientData = {};

      await Promise.all(
          patientIds.map(async (id) => {
            const pRes = await axios.get(`/doctor/patients/${id}`, config);
            patientData[id] = getPatientFromResponse(pRes.data);
          })
      );

      setPatients(patientData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctor dashboard');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!window.confirm(`Mark appointment as ${newStatus}?`)) return;
    try {
      await axios.put(`/doctor/appointments/${appointmentId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAppointments();
    } catch {
      alert(`Failed to update appointment status`);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/doctor/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // ignore error, proceed to logout anyway
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const isToday = (dateStr) => {
    const today = new Date();
    const apptDate = new Date(dateStr);
    return (
        today.getFullYear() === apptDate.getFullYear() &&
        today.getMonth() === apptDate.getMonth() &&
        today.getDate() === apptDate.getDate()
    );
  };

  const matchesDate = (dateStr, selectedDate) => {
    if (!selectedDate) return true;
    const apptDate = new Date(dateStr);
    const filterDate = new Date(selectedDate);
    return (
        apptDate.getFullYear() === filterDate.getFullYear() &&
        apptDate.getMonth() === filterDate.getMonth() &&
        apptDate.getDate() === filterDate.getDate()
    );
  };

  const filteredAppointments = appointments.filter(appt => {
    // Apply today filter if enabled
    if (filters.today && !isToday(appt.time)) return false;

    // Apply completed filter if enabled
    if (filters.completed && appt.status !== 'completed') return false;

    // Apply date filter if set
    if (filters.date && !matchesDate(appt.time, filters.date)) return false;

    // Apply search filter
    const patient = patients[appt.patient_id];
    if (searchTerm && !patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const aToday = isToday(a.time) && a.status === 'scheduled';
    const bToday = isToday(b.time) && b.status === 'scheduled';
    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;
    return new Date(b.time) - new Date(a.time);
  });

  return (
      <div className="doctor-dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <span className="dashboard-icon">👨‍⚕️</span>
            <h1>Doctor Dashboard</h1>
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
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Appointments</h2>
            <span className="appointment-count">
            {filteredAppointments.length} appointments
          </span>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-checkbox">
                <input
                    type="checkbox"
                    checked={filters.today}
                    onChange={(e) => handleFilterChange('today', e.target.checked)}
                />
                <span>Today</span>
              </label>

              <label className="filter-checkbox">
                <input
                    type="checkbox"
                    checked={filters.completed}
                    onChange={(e) => handleFilterChange('completed', e.target.checked)}
                />
                <span>Completed</span>
              </label>
            </div>

            <div className="date-filter-group">
              <label>Filter by date:</label>
              <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
              />
              {filters.date && (
                  <button
                      className="clear-date"
                      onClick={() => handleFilterChange('date', '')}
                  >
                    Clear
                  </button>
              )}
            </div>
          </div>

          {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading appointments...</p>
              </div>
          ) : sortedAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No appointments found</p>
              </div>
          ) : (
              <div className="appointments-grid">
                {sortedAppointments.map(appt => (
                    <div key={appt.appointment_id} className="appointment-card">
                      <div className="appointment-header">
                        <span className={`status-badge ${appt.status}`}>{appt.status}</span>
                        <span className="appointment-time">
                    {new Date(appt.time).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
                        {appt.status === 'scheduled' && (
                            <>
                              <button
                                  onClick={() => handleStatusUpdate(appt.appointment_id, 'completed')}
                                  className="action-button complete"
                              >
                                Complete
                              </button>
                              <button
                                  onClick={() => handleStatusUpdate(appt.appointment_id, 'cancelled')}
                                  className="action-button cancel"
                              >
                                Cancel
                              </button>
                            </>
                        )}
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
        .doctor-dashboard {
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
        
        .filters-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .filter-group {
          display: flex;
          gap: 20px;
        }
        
        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .filter-checkbox input {
          width: 18px;
          height: 18px;
        }
        
        .date-filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .date-filter-group label {
          font-weight: 500;
        }
        
        .date-filter-group input {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }
        
        .clear-date {
          padding: 8px 12px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .clear-date:hover {
          background: #e0e0e0;
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
          font-size: 0.9rem;
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
          gap: 10px;
        }
        
        .action-button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .action-button.complete {
          background: #4caf50;
          color: white;
        }
        
        .action-button.complete:hover {
          background: #388e3c;
        }
        
        .action-button.cancel {
          background: #f44336;
          color: white;
        }
        
        .action-button.cancel:hover {
          background: #d32f2f;
        }
        
        .action-button.view {
          background: #2196f3;
          color: white;
        }
        
        .action-button.view:hover {
          background: #1976d2;
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
          max-width: 800px;
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
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }
        
        .section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
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
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
        
        .records-list {
          display: grid;
          gap: 15px;
          margin-top: 20px;
        }
        
        .record-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
        }
        
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .record-date {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .record-actions {
          display: flex;
          gap: 10px;
        }
        
        .edit-button, .delete-button {
          padding: 5px 12px;
          border: none;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        
        .edit-button {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .delete-button {
          background: #ffebee;
          color: #d32f2f;
        }
        
        .record-content {
          padding: 10px 0;
          white-space: pre-wrap;
        }
        
        .consultation-form,
        .prescription-form {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .consultation-form textarea,
        .prescription-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          min-height: 100px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
  );
};

export default DoctorDashboard;