import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

const DoctorAssistant = () => {
    const [assistants, setAssistants] = useState([]);
    const [assistantForm, setAssistantForm] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        birthday: '',
        address: ''
    });
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAssistants();
    }, []);

    const fetchAssistants = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/doctor/assistants', config);
            setAssistants(res.data.assistants || []);
        } catch {
            setError('Failed to load assistants.');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`/doctor/assistants/${editId}`, assistantForm, config);
            } else {
                await axios.post('/doctor/assistants', assistantForm, config);
            }
            resetForm();
            fetchAssistants();
        } catch {
            alert('Failed to save assistant.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assistant?')) return;
        try {
            await axios.delete(`/doctor/assistants/${id}`, config);
            fetchAssistants();
        } catch {
            alert('Failed to delete assistant.');
        }
    };

    const resetForm = () => {
        setEditId(null);
        setAssistantForm({
            full_name: '',
            email: '',
            password: '',
            phone: '',
            birthday: '',
            address: ''
        });
        setShowForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const filteredAssistants = assistants.filter(a =>
        a.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="assistant-management">
            <div className="header">
                <h2>👨‍⚕️ Manage Medical Assistants</h2>
                <div className="header-actions">
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search assistant..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="add-button"
                        onClick={() => { setShowForm(true); setEditId(null); }}
                    >
                        + Add Assistant
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
                    <p>Loading assistants...</p>
                </div>
            ) : filteredAssistants.length === 0 ? (
                <div className="empty-state">
                    <p>No assistants found</p>
                    <button
                        className="add-button"
                        onClick={() => { setShowForm(true); setEditId(null); }}
                    >
                        Add Your First Assistant
                    </button>
                </div>
            ) : (
                <div className="assistant-grid">
                    {filteredAssistants.map(a => (
                        <div key={a.id} className="assistant-card">
                            <div className="card-header">
                                <div className="avatar">
                                    {a.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h3>{a.full_name}</h3>
                                    <p className="email">{a.email}</p>
                                </div>
                            </div>

                            <div className="card-details">
                                <div className="detail-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{a.phone || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Birthday:</span>
                                    <span className="value">{a.birthday || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Address:</span>
                                    <span className="value">{a.address || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setAssistantForm(a);
                                        setEditId(a.id);
                                        setShowForm(true);
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(a.id)}
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
                        <h3 className="modal-title">{editId ? 'Edit Assistant' : 'Add Assistant'}</h3>

                        <form onSubmit={handleSubmit} className="assistant-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={assistantForm.full_name || ''}
                                    onChange={e => setAssistantForm(f => ({ ...f, full_name: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    required
                                    value={assistantForm.email || ''}
                                    onChange={e => setAssistantForm(f => ({ ...f, email: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Password {editId && '(leave blank to keep current)'}</label>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required={!editId}
                                    value={assistantForm.password || ''}
                                    onChange={e => setAssistantForm(f => ({ ...f, password: e.target.value }))}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        placeholder="Phone"
                                        required
                                        value={assistantForm.phone || ''}
                                        onChange={e => setAssistantForm(f => ({ ...f, phone: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Birthday</label>
                                    <input
                                        type="date"
                                        placeholder="Birthday"
                                        required
                                        value={assistantForm.birthday || ''}
                                        onChange={e => setAssistantForm(f => ({ ...f, birthday: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    placeholder="Address"
                                    required
                                    value={assistantForm.address || ''}
                                    onChange={e => setAssistantForm(f => ({ ...f, address: e.target.value }))}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    {editId ? 'Update Assistant' : 'Create Assistant'}
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
                .assistant-management {
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

                .assistant-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }

                .assistant-card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    padding: 20px;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .assistant-card:hover {
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

                .detail-item {
                    display: flex;
                    margin-bottom: 10px;
                }

                .label {
                    font-weight: 600;
                    width: 90px;
                    color: #5a6570;
                    font-size: 0.9rem;
                }

                .value {
                    flex: 1;
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
                    max-width: 500px;
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

                .assistant-form .form-group {
                    margin-bottom: 20px;
                }

                .assistant-form label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    font-size: 0.95rem;
                }

                .assistant-form input {
                    width: 100%;
                    padding: 0.75rem 0rem 0.75rem 0.5rem;
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

export default DoctorAssistant;