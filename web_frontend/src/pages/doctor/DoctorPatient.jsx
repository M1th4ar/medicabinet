import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const DoctorPatient = () => {
    const [patients, setPatients] = useState([]);
    const [patientForm, setPatientForm] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        birthday: '',
        address: '',
        gender: '',
        weight: '',
        height: ''
    });
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/doctor/patients', config);
            setPatients(res.data.patients || []);
        } catch {
            setError('Failed to load patients.');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/doctor/patients/${editId}`, patientForm, config);
            } else {
                await axios.post('/doctor/patients', patientForm, config);
            }
            resetForm();
            fetchPatients();
        } catch {
            alert('Failed to save patient.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this patient?')) return;
        try {
            await axios.delete(`/doctor/patients/${id}`, config);
            fetchPatients();
        } catch {
            alert('Failed to delete patient.');
        }
    };

    const resetForm = () => {
        setEditId(null);
        setPatientForm({
            full_name: '',
            email: '',
            password: '',
            phone: '',
            birthday: '',
            address: '',
            gender: '',
            weight: '',
            height: ''
        });
        setShowForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-management">
            <div className="header">
                <h2>👨‍⚕️ Manage Patients</h2>
                <div className="header-actions">
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search patient..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className="add-button"
                        onClick={() => { setShowForm(true); setEditId(null); }}
                    >
                        + Add Patient
                    </button>
                    <button 
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading patients...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="empty-state">
                    <p>No patients found</p>
                    <button 
                        className="add-button"
                        onClick={() => { setShowForm(true); setEditId(null); }}
                    >
                        Add Your First Patient
                    </button>
                </div>
            ) : (
                <div className="patient-grid">
                    {filteredPatients.map(p => (
                        <div key={p.id} className="patient-card">
                            <div className="card-header">
                                <div className="avatar">
                                    {p.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3>{p.full_name}</h3>
                                    <p className="email">{p.email}</p>
                                </div>
                            </div>
                            
                            <div className="card-details">
                                <div className="detail-row">
                                    <div className="detail-item">
                                        <span className="label">Gender:</span>
                                        <span className="value">{p.gender || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Phone:</span>
                                        <span className="value">{p.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                <div className="detail-row">
                                    <div className="detail-item">
                                        <span className="label">Birthday:</span>
                                        <span className="value">{p.birthday || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Health:</span>
                                        <span className="value">
                                            {p.weight ? `${p.weight} kg` : 'N/A'} / {p.height ? `${p.height} cm` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="label">Address:</span>
                                    <span className="value">{p.address || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div className="card-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setPatientForm(p);
                                        setEditId(p.id);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDelete(p.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button
                            onClick={resetForm}
                            className="close-button"
                        >
                            ✖
                        </button>
                        <h3 className="modal-title">{editId ? 'Edit Patient' : 'Add Patient'}</h3>
                        
                        <form onSubmit={handleSubmit} className="patient-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={patientForm.full_name || ''}
                                    onChange={e => setPatientForm(f => ({ ...f, full_name: e.target.value }))}
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={patientForm.email || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, email: e.target.value }))}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Password {editId && '(leave blank to keep current)'}</label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        required={!editId}
                                        value={patientForm.password || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, password: e.target.value }))}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Phone"
                                        required
                                        value={patientForm.phone || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, phone: e.target.value }))}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Birthday</label>
                                    <input
                                        type="date"
                                        placeholder="Birthday"
                                        required
                                        value={patientForm.birthday || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, birthday: e.target.value }))}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        required
                                        value={patientForm.gender || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, gender: e.target.value }))}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="Weight"
                                        required
                                        value={patientForm.weight || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, weight: e.target.value }))}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        placeholder="Height"
                                        required
                                        value={patientForm.height || ''}
                                        onChange={e => setPatientForm(f => ({ ...f, height: e.target.value }))}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    required
                                    value={patientForm.address || ''}
                                    onChange={e => setPatientForm(f => ({ ...f, address: e.target.value }))}
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    {editId ? 'Update Patient' : 'Create Patient'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .patient-management {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #2c3e50;
                }
                
                .header {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .header h2 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0 0 20px 0;
                }
                
                .header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }
                
                .search-container {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }
                
                .search-container input {
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
                
                .add-button {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: background 0.3s;
                }
                
                .add-button:hover {
                    background: #2980b9;
                }

                .logout-button {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .logout-button:hover {
                    background: #c0392b;
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
                
                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                
                .empty-state p {
                    color: #7f8c8d;
                    margin-bottom: 20px;
                }
                
                .patient-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                
                .patient-card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    padding: 20px;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                
                .patient-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
                }
                
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: #3498db;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    font-weight: 600;
                }
                
                .card-header h3 {
                    margin: 0 0 5px 0;
                    font-size: 1.2rem;
                }
                
                .email {
                    margin: 0;
                    color: #7f8c8d;
                    font-size: 0.9rem;
                }
                
                .card-details {
                    margin-bottom: 20px;
                }
                
                .detail-row {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 10px;
                }
                
                .detail-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .label {
                    font-weight: 600;
                    color: #5a6570;
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }
                
                .value {
                    font-size: 0.95rem;
                }
                
                .card-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .edit-button, .delete-button {
                    flex: 1;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                
                .edit-button {
                    background: #e3f2fd;
                    color: #1976d2;
                }
                
                .edit-button:hover {
                    background: #bbdefb;
                }
                
                .delete-button {
                    background: #ffebee;
                    color: #d32f2f;
                }
                
                .delete-button:hover {
                    background: #ffcdd2;
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
                
                .modal {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 600px;
                    padding: 4rem;
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
                
                .modal-title {
                    margin-top: 0;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .patient-form .form-group {
                    margin-bottom: 20px;
                }
                
                .patient-form label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    font-size: 0.95rem;
                }
                
                .patient-form input,
                .patient-form select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                
                .form-row {
                    display: flex;
                    gap: 20px;
                }
                
                .form-row .form-group {
                    flex: 1;
                }
                
                .form-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }
                
                .save-button {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                    transition: background 0.3s;
                }
                
                .save-button:hover {
                    background: #2980b9;
                }
                
                .cancel-button {
                    background: #f0f4f8;
                    color: #2c3e50;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                    transition: background 0.3s;
                }
                
                .cancel-button:hover {
                    background: #e3eaf3;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default DoctorPatient;