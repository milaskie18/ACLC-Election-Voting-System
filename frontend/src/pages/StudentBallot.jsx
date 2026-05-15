import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);
const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const StudentBallot = () => {
    const [groupedCandidates, setGroupedCandidates] = useState({});
    const [selections, setSelections] = useState({});
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            // Decode the JWT to extract the userId dynamically
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserId(payload.id);
        } catch (error) {
            console.error('Failed to parse token', error);
            navigate('/');
            return;
        }

        checkElectionStateAndFetchCandidates();
    }, [navigate]);

    const checkElectionStateAndFetchCandidates = async () => {
        try {
            const stateResponse = await api.get('/admin/election-state'); // Note: ensure this route is public or student has access
            if (!stateResponse.data?.vote_available) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Election Closed',
                    text: 'The election has not started or has ended.',
                    allowOutsideClick: false,
                    confirmButtonText: 'Back to Login'
                }).then(() => {
                    localStorage.removeItem('token');
                    navigate('/');
                });
                return;
            }

            // Fetch active candidates
            const candidateResponse = await api.get('/admin/candidates');
            const candidates = candidateResponse.data;

            // Group candidates by position
            const grouped = candidates.reduce((acc, curr) => {
                if (!acc[curr.position]) {
                    acc[curr.position] = [];
                }
                acc[curr.position].push(curr);
                return acc;
            }, {});

            setGroupedCandidates(grouped);
        } catch (error) {
            console.error('Error fetching data:', error);
            Toast.fire({ icon: 'error', title: 'Failed to load ballot data.' });
        }
    };

    const handleSelect = (position, candidateId) => {
        setSelections(prev => ({
            ...prev,
            [position]: candidateId
        }));
    };

    const handleSubmit = async () => {
        const candidateIds = Object.values(selections);
        
        if (candidateIds.length === 0) {
             return MySwal.fire('Error', 'Please select at least one candidate before submitting.', 'error');
        }

        const result = await MySwal.fire({
            title: 'Confirm Vote?',
            text: "You cannot change this later. Submit your ballot?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit vote!'
        });

        if (result.isConfirmed) {
            try {
                await api.post('/votes/submit', { userId, candidateIds });
                
                MySwal.fire({
                    icon: 'success',
                    title: 'Vote Success',
                    text: 'Thank you for voting!',
                    confirmButtonText: 'Finish',
                    allowOutsideClick: false
                }).then(() => {
                    localStorage.removeItem('token');
                    navigate('/');
                });
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Failed to submit vote.';
                MySwal.fire('Error', errorMsg, 'error');
            }
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Student Voting Ballot</h1>
            
            {Object.keys(groupedCandidates).length > 0 ? (
                Object.keys(groupedCandidates).map((position) => (
                    <div key={position} style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ borderBottom: '2px solid #dee2e6', paddingBottom: '10px', marginBottom: '15px' }}>{position}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            {groupedCandidates[position].map((candidate) => (
                                <div 
                                    key={candidate._id} 
                                    onClick={() => handleSelect(position, candidate._id)}
                                    style={{ 
                                        padding: '15px', 
                                        border: selections[position] === candidate._id ? '2px solid #007bff' : '1px solid #ccc',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        backgroundColor: selections[position] === candidate._id ? '#e9f2ff' : '#fff',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 5px 0' }}>{candidate.name}</h4>
                                    <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>Partylist: {candidate.partylist}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ textAlign: 'center' }}>Loading ballot...</p>
            )}

            {Object.keys(groupedCandidates).length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button onClick={handleSubmit} style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        Submit Ballot
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentBallot;