import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);

// Configured Toast for success notifications
const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const AdminDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [isElectionActive, setIsElectionActive] = useState(false);
    const [view, setView] = useState('candidates'); // 'candidates' or 'approvals'
    const [pendingUsers, setPendingUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else {
            fetchTally();
            fetchElectionState();
            fetchPendingUsers();
        }
    }, [navigate]);

    const fetchTally = async () => {
        try {
            const response = await api.get('/candidates');
            setCandidates(response.data);
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to fetch candidates' });
        }
    };

    const fetchElectionState = async () => {
        try {
            const response = await api.get('/election-state');
            // Assuming the backend returns the state object with vote_available
            setIsElectionActive(response.data?.vote_available || false);
        } catch (error) {
            console.error("Failed to fetch election state");
        }
    };

    const fetchPendingUsers = async () => {
        try {
            const response = await api.get('/users/pending');
            setPendingUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch pending users", error);
        }
    };

    const handleAddCandidate = async () => {
        const { value: formValues } = await MySwal.fire({
            title: 'Add New Candidate',
            html: `
                <input id="swal-input-name" class="swal2-input" placeholder="Full Name" />
                <input id="swal-input-position" class="swal2-input" placeholder="Position (e.g., President)" />
                <input id="swal-input-partylist" class="swal2-input" placeholder="Partylist" />
                <select id="swal-input-level" class="swal2-input" style="width: 73%;">
                    <option value="" disabled selected>Select Level</option>
                    <option value="Senior High">Senior High</option>
                    <option value="College">College</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = document.getElementById('swal-input-name').value;
                const position = document.getElementById('swal-input-position').value;
                const partylist = document.getElementById('swal-input-partylist').value;
                const level = document.getElementById('swal-input-level').value;

                if (!name || !position || !partylist || !level) {
                    MySwal.showValidationMessage('Please fill out all fields');
                    return false;
                }
                return { name, position, partylist, level };
            }
        });

        if (formValues) {
            try {
                await api.post('/candidates', formValues);
                Toast.fire({ icon: 'success', title: 'Candidate added successfully' });
                fetchTally(); // Refresh the list
            } catch (error) {
                MySwal.fire('Error', 'Failed to add candidate', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/candidates/${id}`);
                Toast.fire({ icon: 'success', title: 'Candidate deleted' });
                fetchTally();
            } catch (error) {
                MySwal.fire('Error', 'Failed to delete candidate', 'error');
            }
        }
    };

    const handleToggleElection = async (currentState) => {
        const action = currentState ? 'End' : 'Start';
        const result = await MySwal.fire({
            title: `${action} Election?`,
            text: `Are you sure you want to ${action.toLowerCase()} the election?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: currentState ? '#d33' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action} it!`
        });

        if (result.isConfirmed) {
            try {
                await api.post('/election-state/toggle', { vote_available: !currentState });
                setIsElectionActive(!currentState);
                Toast.fire({ icon: 'success', title: `Election ${action}ed successfully` });
            } catch (error) {
                MySwal.fire('Error', `Failed to ${action.toLowerCase()} election`, 'error');
            }
        }
    };

    const handleApprove = async (id) => {
        const result = await MySwal.fire({
            title: 'Approve User?',
            text: "This student will be allowed to vote.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Approve'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/users/${id}/approve`);
                Toast.fire({ icon: 'success', title: 'User Approved' });
                fetchPendingUsers();
            } catch (error) {
                MySwal.fire('Error', 'Failed to approve user', 'error');
            }
        }
    };

    const handleDeny = async (id) => {
        const result = await MySwal.fire({
            title: 'Deny User?',
            text: "This student will be denied voting access.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Deny'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/users/${id}/deny`);
                Toast.fire({ icon: 'success', title: 'User Denied' });
                fetchPendingUsers();
            } catch (error) {
                MySwal.fire('Error', 'Failed to deny user', 'error');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                <h2>Admin Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>
                        Election Status: {isElectionActive ? <span style={{ color: 'green' }}>Active</span> : <span style={{ color: 'red' }}>Inactive</span>}
                    </span>
                    <button 
                        onClick={() => handleToggleElection(isElectionActive)}
                        style={{ padding: '8px 16px', backgroundColor: isElectionActive ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {isElectionActive ? 'End Election' : 'Start Election'}
                    </button>
                    <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>
            </header>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setView('candidates')} style={{ padding: '10px 20px', backgroundColor: view === 'candidates' ? '#007bff' : '#e9ecef', color: view === 'candidates' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Candidates
                </button>
                <button onClick={() => setView('approvals')} style={{ padding: '10px 20px', backgroundColor: view === 'approvals' ? '#007bff' : '#e9ecef', color: view === 'approvals' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Pending Approvals {pendingUsers.length > 0 && <span style={{ background: 'red', color: 'white', borderRadius: '50%', padding: '2px 8px', marginLeft: '5px', fontSize: '12px' }}>{pendingUsers.length}</span>}
                </button>
            </div>

            {view === 'candidates' ? (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={handleAddCandidate} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            + Add Candidate
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Position</th>
                                <th style={{ padding: '12px' }}>Partylist</th>
                                <th style={{ padding: '12px' }}>Level</th>
                                <th style={{ padding: '12px' }}>Votes</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.length > 0 ? (
                                candidates.map(candidate => (
                                    <tr key={candidate._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px' }}>{candidate.name}</td>
                                        <td style={{ padding: '12px' }}>{candidate.position}</td>
                                        <td style={{ padding: '12px' }}>{candidate.partylist}</td>
                                        <td style={{ padding: '12px' }}>{candidate.level}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{candidate.votes || 0}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button onClick={() => handleDelete(candidate._id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No candidates found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px' }}>Student ID</th>
                            <th style={{ padding: '12px' }}>Last Name</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length > 0 ? (
                            pendingUsers.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '12px' }}>{user.studentId}</td>
                                    <td style={{ padding: '12px' }}>{user.lastName}</td>
                                    <td style={{ padding: '12px' }}>
                                        <button onClick={() => handleApprove(user._id)} style={{ marginRight: '10px', padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                        <button onClick={() => handleDeny(user._id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Deny</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No pending approvals.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDashboard;