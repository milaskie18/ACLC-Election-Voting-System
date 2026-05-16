import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';

const CandidateApplication = () => {
    const navigate = useNavigate();
    const [applicationType, setApplicationType] = useState('Independent');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [level, setLevel] = useState('');
    const [position, setPosition] = useState('');
    const [partylistName, setPartylistName] = useState('');
    const [taggedMembers, setTaggedMembers] = useState({});

    const collegePositions = [
        'President', 'Vice-President', 'Secretary', 'Finance Manager', 'Auditor', 
        'PIO Representative', 'P.O Representative', 'BSA Representative', 
        'BSBA Representative', 'BSHM Representative', 'BSIT Representative', 
        'HRT Representative', 'WADT Representative'
    ];

    const shsPositions = [
        'President', 'Vice President', 'Executive Secretary', 'Asst. Secretary', 
        'Finance Manager', 'Auditor', 'Public Information Officer (P.I.O)', 
        'Peace Officer (P.O)', 'Senator 1', 'Senator 2', 'Senator 3', 'Senator 4', 'Senator 5'
    ];

    const currentPositions = level === 'College' ? collegePositions : level === 'Senior High' ? shsPositions : [];

    useEffect(() => {
        setTaggedMembers({});
    }, [level, position, applicationType]);

    const handleTagChange = (pos, value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        setTaggedMembers(prev => ({
            ...prev,
            [pos]: numericValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName || !studentId || !level || !position || (applicationType === 'Partylist' && !partylistName)) {
            return Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill out all required fields.' });
        }

        if (!/^\d+$/.test(studentId)) {
            return Swal.fire({ icon: 'warning', title: 'Invalid ID', text: 'Your Student ID must contain numbers only.' });
        }

        try {
            if (applicationType === 'Independent') {
                await api.post('/candidates/apply', { fullName, studentId, level, position, applicationType });
                Swal.fire('Application Submitted', 'Your independent candidacy is under review.', 'success').then(() => navigate('/login'));
            } else {
                const taggedArray = Object.keys(taggedMembers)
                    .map(pos => ({ position: pos, studentId: taggedMembers[pos] }))
                    .filter(member => member.studentId !== '');

                await api.post('/candidates/apply-partylist', {
                    partylistName,
                    fullName,
                    studentId,
                    level,
                    position,
                    taggedMembers: taggedArray
                });
                Swal.fire('Partylist Registered', 'Invitations have been sent to tagged members.', 'success').then(() => navigate('/login'));
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to submit application', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#023E8A]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-[#023E8A]">Run For Office</h2>
                    <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-500 hover:text-[#0077B6]">
                        &larr; Back to Login
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-4 mb-6">
                        <button type="button" onClick={() => setApplicationType('Independent')} className={`flex-1 py-3 font-bold rounded transition-colors ${applicationType === 'Independent' ? 'bg-[#0077B6] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            Independent
                        </button>
                        <button type="button" onClick={() => setApplicationType('Partylist')} className={`flex-1 py-3 font-bold rounded transition-colors ${applicationType === 'Partylist' ? 'bg-[#0077B6] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            Partylist
                        </button>
                    </div>

                    {applicationType === 'Partylist' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Partylist Name</label>
                            <input type="text" required value={partylistName} onChange={(e) => setPartylistName(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none" placeholder="e.g. LABAN" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Full Name</label>
                            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none" placeholder="e.g. Juan Dela Cruz" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Student ID</label>
                            <input type="text" required value={studentId} onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, ''))} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none" placeholder="Numbers only" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Level</label>
                            <select required value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none">
                                <option value="" disabled>Select Level</option>
                                <option value="College">College</option>
                                <option value="Senior High">Senior High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Your Position</label>
                        <select required value={position} onChange={(e) => setPosition(e.target.value)} disabled={!level} className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none disabled:bg-gray-100">
                            <option value="" disabled>Select Position</option>
                            {currentPositions.map(pos => (
                                <option key={pos} value={pos}>{pos}</option>
                            ))}
                        </select>
                    </div>

                    {applicationType === 'Partylist' && level && position && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Tag Partylist Members (Optional)</h3>
                            <p className="text-sm text-gray-500 mb-4">Enter Student IDs for the roles you want to fill. They will receive an invitation upon logging in.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded bg-gray-50">
                                {currentPositions.filter(pos => pos !== position).map(pos => (
                                    <div key={pos} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">{pos}</label>
                                        <input 
                                            type="text" 
                                            placeholder="Student ID" 
                                            value={taggedMembers[pos] || ''} 
                                            onChange={(e) => handleTagChange(pos, e.target.value)} 
                                            className="w-full px-3 py-1.5 text-sm border rounded focus:ring-2 focus:ring-[#0077B6] focus:outline-none" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-[#023E8A] text-white font-bold py-4 rounded hover:bg-[#0077B6] transition-colors mt-6 shadow-md">
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CandidateApplication;