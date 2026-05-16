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
    const [hasVoted, setHasVoted] = useState(false);
    const [pendingInvite, setPendingInvite] = useState(null); // New state for invitations
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserId(payload.id);
            checkInitialStatus(payload.id); 
        } catch (error) {
            console.error('Failed to parse token', error);
            navigate('/login');
            return;
        }
    }, [navigate]);

    const checkInitialStatus = async (currentUserId) => { 
        try {
            // 1. Check for Pending Invitations FIRST
            try {
                const inviteResponse = await api.get(`/users/${currentUserId}/invitations`);
                if (inviteResponse.data && inviteResponse.data.hasInvite) {
                    setPendingInvite(inviteResponse.data.inviteDetails);
                    return; // Stop here and render the invite screen
                }
            } catch (err) {
                console.log("No pending invitations found or endpoint not ready.");
            }

            // 2. Gatekeeper Check: Did this specific user already vote?
            const userResponse = await api.get(`/users/${currentUserId}`);
            if (userResponse.data?.alreadyVoted) {
                setHasVoted(true);
                return; 
            }

            // 3. Election State Check
            const stateResponse = await api.get('/admin/election-state'); 
            if (!stateResponse.data?.vote_available) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Election Closed',
                    text: 'The election has not started or has ended.',
                    allowOutsideClick: false,
                    confirmButtonText: 'Back to Login'
                }).then(() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                });
                return;
            }

            // 4. Fetch the Candidates
            const candidateResponse = await api.get('/admin/candidates');
            const candidates = candidateResponse.data;

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

    const handleAcceptInvite = async () => {
        try {
            await api.post('/candidates/accept', { inviteId: pendingInvite._id });
            MySwal.fire({ icon: 'success', title: 'Nomination Accepted!', text: 'You have officially accepted the nomination.', timer: 2000, showConfirmButton: false });
            setPendingInvite(null);
            checkInitialStatus(userId); // Resume normal checks
        } catch (error) {
            MySwal.fire('Error', 'Failed to accept invitation.', 'error');
        }
    };

    const handleDeclineInvite = async () => {
        try {
            await api.post('/candidates/decline', { inviteId: pendingInvite._id });
            MySwal.fire({ icon: 'info', title: 'Nomination Declined', text: 'You have declined the nomination.', timer: 2000, showConfirmButton: false });
            setPendingInvite(null);
            checkInitialStatus(userId); // Resume normal checks
        } catch (error) {
            MySwal.fire('Error', 'Failed to decline invitation.', 'error');
        }
    };

    const handleSelect = (position, candidateId) => {
        setSelections(prev => ({
            ...prev,
            [position]: candidateId
        }));
    };

    const handleSubmit = async () => {
        const positions = Object.keys(groupedCandidates);
        
        if (Object.keys(selections).length < positions.length) {
            return MySwal.fire('Error', 'Please make a selection (or Abstain) for all positions before submitting.', 'error');
        }

        const candidateIds = Object.values(selections).filter(id => id !== 'abstain');

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
                    setHasVoted(true);
                });
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Failed to submit vote.';
                if (errorMsg.toLowerCase().includes('already')) {
                    setHasVoted(true);
                } else {
                    MySwal.fire('Error', errorMsg, 'error');
                }
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // View 1: Invitation Intercept Screen
    if (pendingInvite) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-4 border-[#023E8A]">
                    <div className="w-20 h-20 bg-blue-100 text-[#023E8A] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Partylist Invitation</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        You have been tagged to run as <span className="font-bold text-[#0077B6]">{pendingInvite.position}</span> for the <span className="font-bold text-[#0077B6]">{pendingInvite.partylistName}</span> partylist.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleAcceptInvite} className="w-full py-3 bg-green-500 text-white font-bold rounded shadow hover:bg-green-600 transition-colors">
                            Accept Nomination
                        </button>
                        <button onClick={handleDeclineInvite} className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded shadow-sm hover:bg-gray-300 transition-colors">
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // View 2: The Gatekeeper View
    if (hasVoted) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '80px', height: '80px', color: '#28a745', margin: '0 auto 20px' }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '24px', fontWeight: 'bold' }}>Your Ballot Has Been Successfully Cast.</h2>
                    <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px', lineHeight: '1.5' }}>
                        Thank you for participating in the ACLC College Digital Election. Your vote is secure, anonymous, and successfully recorded.
                    </p>
                    <button onClick={handleLogout} style={{ padding: '12px 25px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                        Return to Main Page
                    </button>
                </div>
            </div>
        );
    }

    // View 3: Standard Ballot View
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

                            <div 
                                onClick={() => handleSelect(position, 'abstain')}
                                style={{ 
                                    padding: '15px', 
                                    border: selections[position] === 'abstain' ? '2px solid #dc3545' : '1px solid #ccc',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: selections[position] === 'abstain' ? '#f8d7da' : '#fff',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <h4 style={{ margin: '0 0 5px 0', color: selections[position] === 'abstain' ? '#dc3545' : '#333' }}>Abstain</h4>
                                <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>Leave this position blank</p>
                            </div>
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