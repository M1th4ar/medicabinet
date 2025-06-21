import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../api/axios';

const Dashboard = () => {
  const today = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [error, setError] = useState('');
  const [newAppt, setNewAppt] = useState('');
  const [apptMessage, setApptMessage] = useState('');
  const token = localStorage.getItem('token');

  // Styling Constants
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '15px',
      borderBottom: '1px solid #e0e0e0'
    },
    logoutBtn: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      padding: '20px',
      marginBottom: '30px'
    },
    sectionTitle: {
      color: '#2c3e50',
      marginTop: '0',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '1px solid #eee'
    },
    formGroup: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px'
    },
    dateInput: {
      flex: 1,
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px'
    },
    primaryBtn: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    dangerBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    },
    tableHeader: {
      backgroundColor: '#f1f5f9',
      textAlign: 'left',
      padding: '12px 15px',
      fontWeight: '600',
      color: '#2c3e50'
    },
    tableCell: {
      padding: '12px 15px',
      borderBottom: '1px solid #eee'
    },
    statusBadge: (status) => ({
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: status === 'confirmed' ? '#d4edda' : '#f8d7da',
      color: status === 'confirmed' ? '#155724' : '#721c24'
    }),
    emptyState: {
      padding: '20px',
      textAlign: 'center',
      color: '#6c757d',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    },
    rescheduleContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    }
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchData = useCallback(async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const [apptRes, prescRes, consRes] = await Promise.all([
        axios.get('patient/appointments', config),
        axios.get('patient/prescriptions', config),
        axios.get('patient/consultations', config)
      ]);

      setAppointments(apptRes.data.appointments);
      setPrescriptions(prescRes.data.prescriptions);
      setConsultations(consRes.data.consultations);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setApptMessage('');
    try {
      await axios.post('patient/appointments', { time: newAppt }, config);
      setApptMessage('Appointment scheduled successfully!');
      setNewAppt('');
      fetchData();
    } catch {
      setApptMessage('You already have a scheduled appointment');
    }
  };

  const handleCancel = async (appointment_id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`patient/appointments/${appointment_id}`, config);
        alert('Appointment cancelled successfully');
        fetchData();
      } catch {
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('patient/logout', {}, config);
    } catch (err) {
      // ignore error
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={{ color: '#2c3e50', margin: 0 }}>Patient Dashboard</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </header>

        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Schedule New Appointment</h2>
          <form onSubmit={handleSchedule}>
            <div style={styles.formGroup}>
              <input
                  type="date"
                  value={newAppt}
                  onChange={(e) => setNewAppt(e.target.value)}
                  required
                  min={today}
                  max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // max 60 days = ~2 months
                  style={styles.dateInput}
              />
              <button
                  type="submit"
                  disabled={!newAppt}
                  style={styles.primaryBtn}
              >
                Schedule
              </button>
            </div>
            {apptMessage && (
                <p style={{
                  color: apptMessage.includes('success') ? '#28a745' : '#dc3545',
                  fontWeight: '500'
                }}>
                  {apptMessage}
                </p>
            )}
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>My Appointments</h2>
          {appointments.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No appointments scheduled</p>
              </div>
          ) : (
              <table style={styles.table}>
                <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Date & Time</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {appointments.map(appt => (
                    <tr key={appt.appointment_id}>
                      <td style={styles.tableCell}>{appt.appointment_id}</td>
                      <td style={styles.tableCell}>
                        {new Date(appt.time).toLocaleString()}
                      </td>
                      <td style={styles.tableCell}>
                    <span style={styles.statusBadge(appt.status)}>
                      {appt.status}
                    </span>
                      </td>
                      <td style={{ ...styles.tableCell, display: 'flex', gap: '10px' }}>
                        <Reschedule
                            apptId={appt.appointment_id}
                            token={token}
                            onSuccess={fetchData}
                        />
                        <button
                            onClick={() => handleCancel(appt.appointment_id)}
                            style={styles.dangerBtn}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Prescriptions</h2>
          {prescriptions.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No prescriptions available</p>
              </div>
          ) : (
              <table style={styles.table}>
                <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Details</th>
                </tr>
                </thead>
                <tbody>
                {prescriptions.map(p => (
                    <tr key={p.prescription_id}>
                      <td style={styles.tableCell}>{p.prescription_id}</td>
                      <td style={styles.tableCell}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {p.content || 'No details available'}
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Consultations</h2>
          {consultations.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No consultation records</p>
              </div>
          ) : (
              <table style={styles.table}>
                <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Notes</th>
                </tr>
                </thead>
                <tbody>
                {consultations.map(c => (
                    <tr key={c.consultation_id}>
                      <td style={styles.tableCell}>{c.consultation_id}</td>
                      <td style={styles.tableCell}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {c.notes || 'No notes available'}
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
          )}
        </section>
      </div>
  );
};

const Reschedule = ({ apptId, token, onSuccess }) => {
  const today = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [newTime, setNewTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const reschedule = async () => {
    if (!newTime) return;

    try {
      setIsRescheduling(true);
      await axios.put(
          `patient/appointments/${apptId}`,
          { time: newTime },
          { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment rescheduled successfully!');
      setNewTime('');
      onSuccess();
    } catch {
      alert('Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
            type="date"
            min={today}
            max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // max 60 days = ~2 months
            onChange={(e) => setNewTime(e.target.value)}
            value={newTime}
            required
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
        />
        <button
            onClick={reschedule}
            disabled={!newTime || isRescheduling}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
        >
          {isRescheduling ? 'Processing...' : 'Reschedule'}
        </button>
      </div>
  );
};

export default Dashboard;