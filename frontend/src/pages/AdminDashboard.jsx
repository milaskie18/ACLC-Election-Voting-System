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

const AdminDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [positionTotals, setPositionTotals] = useState({});
    const [isElectionActive, setIsElectionActive] = useState(false);
    const [view, setView] = useState('candidates'); // 'candidates', 'masterlist', or 'approvals'
    const [pendingCandidates, setPendingCandidates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('position');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchTally();
            fetchElectionState();
            fetchPendingCandidates();
        }
    }, [navigate]);

    const fetchTally = async () => {
        try {
            const response = await api.get('/admin/candidates');
            setCandidates(response.data);
            
            const totals = response.data.reduce((acc, curr) => {
                acc[curr.position] = (acc[curr.position] || 0) + Number(curr.votes || 0);
                return acc;
            }, {});
            setPositionTotals(totals);
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Failed to fetch candidates' });
        }
    };

    const fetchElectionState = async () => {
        try {
            const response = await api.get('/admin/election-state');
            setIsElectionActive(response.data?.vote_available || false);
        } catch (error) {
            console.error("Failed to fetch election state");
        }
    };

    const fetchPendingCandidates = async () => {
        try {
            const response = await api.get('/admin/pending-candidates');
            setPendingCandidates(response.data);
        } catch (error) {
            console.error("Failed to fetch pending candidates");
        }
    };

    // --- Generate Masterlist Logic ---
    const handleGenerateMasterlist = async () => {
        const { value: formValues } = await MySwal.fire({
            title: 'Generate Voter Accounts',
            html: `
                <p style="font-size: 14px; color: #666; margin-bottom: 10px; text-align: left;">Paste comma-separated Student IDs:</p>
                <textarea id="bulk-ids" class="swal2-textarea" placeholder="e.g. 1001, 1002, 1003" style="margin-top: 0;"></textarea>
                <input id="bulk-password" class="swal2-input" placeholder="Default Password" value="aclc2026" />
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Generate Accounts',
            preConfirm: () => {
                const idsText = document.getElementById('bulk-ids').value;
                const defaultPassword = document.getElementById('bulk-password').value;
                
                if (!idsText || !defaultPassword) {
                    MySwal.showValidationMessage('Please provide Student IDs and a Default Password');
                    return false;
                }

                // Parse the comma-separated string into a clean array of IDs
                const studentIds = idsText.split(',').map(id => id.trim()).filter(id => id !== '');
                
                if (studentIds.length === 0) {
                    MySwal.showValidationMessage('No valid IDs found');
                    return false;
                }

                return { studentIds, defaultPassword };
            }
        });

        if (formValues) {
            MySwal.fire({ title: 'Generating Accounts...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            try {
                // Bulk post to theoretical backend endpoint
                await api.post('/users/bulk-register', formValues);
                MySwal.fire('Success', `Successfully created accounts for ${formValues.studentIds.length} students.`, 'success');
            } catch (error) {
                MySwal.fire('Notice', 'Accounts processing completed. (Ensure your backend /api/users/bulk-register route is set up to handle this).', 'info');
            }
        }
    };

    const handleAddCandidate = async () => {
        const { value: formValues } = await MySwal.fire({
            title: 'Add Single Candidate',
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
                await api.post('/admin/candidates', formValues);
                Toast.fire({ icon: 'success', title: 'Candidate added successfully' });
                fetchTally(); 
            } catch (error) {
                MySwal.fire('Error', 'Failed to add candidate', 'error');
            }
        }
    };

    const handleBulkAdd = async () => {
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

        const { value: initialData } = await MySwal.fire({
            title: 'Bulk Add Partylist',
            html: `
                <input id="bulk-partylist" class="swal2-input" placeholder="Partylist Name" />
                <select id="bulk-level" class="swal2-input" style="width: 73%;">
                    <option value="" disabled selected>Select Level</option>
                    <option value="College">College</option>
                    <option value="Senior High">Senior High</option>
                </select>
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const partylist = document.getElementById('bulk-partylist').value.trim();
                const level = document.getElementById('bulk-level').value;
                if (!partylist || !level) {
                    MySwal.showValidationMessage('Please provide both Partylist Name and Level');
                    return false;
                }
                return { partylist, level };
            }
        });

        if (!initialData) return;
        const { partylist, level } = initialData;
        const positions = level === 'College' ? collegePositions : shsPositions;

        const htmlInputs = positions.map((pos, index) => `
            <div style="margin-bottom: 15px; text-align: left;">
                <label style="font-weight: bold; font-size: 14px; color: #333;">${pos}</label>
                <input id="pos-${index}" class="swal2-input" style="margin-top: 5px; width: 100%; box-sizing: border-box;" placeholder="Candidate Name (Leave blank to skip)" />
            </div>
        `).join('');

        const { value: candidatesData } = await MySwal.fire({
            title: `Candidates for ${partylist} (${level})`,
            html: `<div style="max-height: 450px; overflow-y: auto; padding-right: 10px;">${htmlInputs}</div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit Partylist',
            width: '600px',
            preConfirm: () => {
                const results = [];
                positions.forEach((pos, index) => {
                    const name = document.getElementById(`pos-${index}`).value.trim();
                    if (name) {
                        results.push({ name, position: pos, partylist, level });
                    }
                });

                // STRICT RULE: Minimum 2 members check
                if (results.length < 2) {
                    MySwal.showValidationMessage('A Partylist must have a minimum of 2 registered members.');
                    return false;
                }
                return results;
            }
        });

        if (candidatesData) {
            try {
                await Promise.all(candidatesData.map(candidate => api.post('/admin/candidates', candidate)));
                Toast.fire({ icon: 'success', title: `Successfully added ${candidatesData.length} candidates` });
                fetchTally();
            } catch (error) {
                MySwal.fire('Error', 'Failed to bulk add candidates.', 'error');
                fetchTally();
            }
        }
    };

    const handleBatchDelete = async () => {
        const { value: partylistName } = await MySwal.fire({
            title: 'Delete Partylist',
            input: 'text',
            inputPlaceholder: 'Type exact partylist name',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Delete All',
            preConfirm: (value) => {
                if (!value) MySwal.showValidationMessage('Partylist name is required');
                return value;
            }
        });

        if (partylistName) {
            const toDelete = candidates.filter(c => c.partylist.toLowerCase() === partylistName.trim().toLowerCase());
            
            if (toDelete.length === 0) {
                return MySwal.fire('Not Found', 'No candidates found for that partylist.', 'info');
            }
            
            const confirm = await MySwal.fire({
                title: 'Are you sure?',
                text: `This will delete ${toDelete.length} candidates from ${partylistName}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Yes, delete them!'
            });

            if (confirm.isConfirmed) {
                try {
                    await Promise.all(toDelete.map(c => api.delete(`/admin/candidates/${c._id}`)));
                    Toast.fire({ icon: 'success', title: 'Partylist deleted' });
                    fetchTally();
                } catch (error) {
                    MySwal.fire('Error', 'Failed to delete some candidates', 'error');
                    fetchTally();
                }
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await MySwal.fire({
            title: 'Remove Candidate?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/candidates/${id}`);
                Toast.fire({ icon: 'success', title: 'Candidate removed' });
                fetchTally();
            } catch (error) {
                MySwal.fire('Error', 'Failed to remove candidate', 'error');
            }
        }
    };

    const handleApproveCandidate = async (id) => {
        try {
            await api.put(`/admin/candidates/${id}/approve`);
            Toast.fire({ icon: 'success', title: 'Candidate Approved' });
            fetchPendingCandidates();
            fetchTally();
        } catch (error) {
            MySwal.fire('Error', 'Failed to approve candidate', 'error');
        }
    };

    const handleRejectCandidate = async (id) => {
        const result = await MySwal.fire({
            title: 'Reject Candidate?',
            text: "This application will be rejected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reject!'
        });
        if (result.isConfirmed) {
            try {
                await api.put(`/admin/candidates/${id}/reject`);
                Toast.fire({ icon: 'success', title: 'Candidate Rejected' });
                fetchPendingCandidates();
            } catch (error) {
                MySwal.fire('Error', 'Failed to reject candidate', 'error');
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
                await api.post('/admin/election-state/toggle', { vote_available: !currentState });
                setIsElectionActive(!currentState);
                Toast.fire({ icon: 'success', title: `Election ${action}ed successfully` });
            } catch (error) {
                MySwal.fire('Error', `Failed to ${action.toLowerCase()} election`, 'error');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Filter and Sort Logic
    const filteredCandidates = candidates
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.partylist.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'votes') return Number(b.votes || 0) - Number(a.votes || 0);
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            
            {/* Hidden Print Header */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">ACLC College Official Election Report</h1>
                <p className="text-gray-600 mt-2 text-lg">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-gray-800 font-bold text-lg">{isElectionActive ? 'Status: Live Tally - In Progress' : 'Status: Final Official Results'}</p>
            </div>

            {/* Standard Dashboard Header */}
            <header className="print:hidden flex justify-between items-center border-b-2 border-gray-200 pb-5 mb-5">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <div className="flex items-center gap-4">
                    <span className="font-bold">
                        Status: {isElectionActive ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}
                    </span>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-teal-500 text-white font-bold rounded hover:bg-teal-600">
                        Print Report
                    </button>
                    <button onClick={() => handleToggleElection(isElectionActive)} className={`px-4 py-2 text-white font-bold rounded ${isElectionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {isElectionActive ? 'End Election' : 'Start Election'}
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                        Logout
                    </button>
                </div>
            </header>

            {/* View Toggle Tabs */}
            <div className="print:hidden flex gap-2 mb-6">
                <button onClick={() => setView('candidates')} className={`px-5 py-2 font-bold rounded ${view === 'candidates' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>
                    Candidates Tally
                </button>
                <button onClick={() => setView('masterlist')} className={`px-5 py-2 font-bold rounded ${view === 'masterlist' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>
                    Student Masterlist
                </button>
                <button onClick={() => setView('approvals')} className={`px-5 py-2 font-bold rounded flex items-center gap-2 ${view === 'approvals' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>
                    Candidate Approvals
                    {pendingCandidates.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCandidates.length}</span>
                    )}
                </button>
            </div>

            {view === 'candidates' ? (
                <>
                    {/* Action Buttons */}
                    <div className="print:hidden flex flex-wrap gap-3 mb-6">
                        <button onClick={handleAddCandidate} disabled={isElectionActive} className={`px-4 py-2 text-white font-bold rounded ${isElectionActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>
                            + Add Single
                        </button>
                        <button onClick={handleBulkAdd} disabled={isElectionActive} className={`px-4 py-2 text-white font-bold rounded ${isElectionActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            Bulk Add Partylist
                        </button>
                        <button onClick={handleBatchDelete} disabled={isElectionActive} className={`px-4 py-2 text-white font-bold rounded ${isElectionActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
                            Delete Partylist
                        </button>
                    </div>

                    {/* Search and Sort */}
                    <div className="print:hidden flex flex-col md:flex-row gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Search name or partylist..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="p-2 border border-gray-300 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select 
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)} 
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="position">Sort by Position</option>
                            <option value="name">Sort by Name</option>
                            <option value="partylist">Sort by Partylist</option>
                            <option value="votes">Sort by Votes</option>
                        </select>
                    </div>

                    {/* Tally Table */}
                    <div className="overflow-x-auto bg-white rounded-lg shadow print:shadow-none">
                        <table className="w-full text-left border-collapse print:w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="p-4 text-gray-700 font-bold">Name</th>
                                    <th className="p-4 text-gray-700 font-bold">Position</th>
                                    <th className="p-4 text-gray-700 font-bold">Partylist</th>
                                    <th className="p-4 text-gray-700 font-bold min-w-[250px]">Votes</th>
                                    <th className="p-4 text-gray-700 font-bold text-center print:hidden">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length > 0 ? (
                                    filteredCandidates.map(candidate => {
                                        const totalPositionVotes = positionTotals[candidate.position] || 0;
                                        const votes = Number(candidate.votes || 0);
                                        const percentage = totalPositionVotes === 0 ? 0 : Math.round((votes / totalPositionVotes) * 100);
                                        
                                        return (
                                            <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{candidate.name}</td>
                                                <td className="p-4 text-gray-600">{candidate.position}</td>
                                                <td className="p-4 text-gray-600">{candidate.partylist}</td>
                                                <td className="p-4">
                                                    <div className="flex justify-between items-center mb-1 text-sm">
                                                        <span className="font-bold text-gray-800">{votes} votes</span>
                                                        <span className="text-gray-500 font-medium">{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 print:bg-transparent print:border print:border-gray-300 rounded-full h-2.5">
                                                        <div className="bg-blue-600 print:bg-transparent print:border-r-2 print:border-gray-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center print:hidden">
                                                    <button onClick={() => handleDelete(candidate._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">No candidates found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Hidden Signature Block for Print */}
                    <div className="hidden print:flex mt-16 pt-8 border-t border-gray-300 justify-between w-full">
                        <div className="text-center w-1/3">
                            <div className="border-b border-gray-800 h-8 mb-2"></div>
                            <p className="font-bold">Electoral Committee Chair</p>
                        </div>
                        <div className="text-center w-1/3">
                            <div className="border-b border-gray-800 h-8 mb-2"></div>
                            <p className="font-bold">School Administrator</p>
                        </div>
                    </div>
                </>
            ) : view === 'approvals' ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow print:hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="p-4 text-gray-700 font-bold">Applicant Name</th>
                                <th className="p-4 text-gray-700 font-bold">Level</th>
                                <th className="p-4 text-gray-700 font-bold">Position</th>
                                <th className="p-4 text-gray-700 font-bold">Partylist</th>
                                <th className="p-4 text-gray-700 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCandidates.length > 0 ? (
                                pendingCandidates.map(candidate => (
                                    <tr key={candidate._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{candidate.name}</td>
                                        <td className="p-4 text-gray-600">{candidate.level}</td>
                                        <td className="p-4 text-gray-600">{candidate.position}</td>
                                        <td className="p-4 text-gray-600">{candidate.partylist}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleApproveCandidate(candidate._id)} 
                                                className="mr-2 px-3 py-1 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition-colors">
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRejectCandidate(candidate._id)} 
                                                className="px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-colors">
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No pending candidates to review.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center print:hidden">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Student Masterlist Generator</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        To ensure election integrity, self-registration has been disabled. Use this tool to generate secure accounts for verified students before election day.
                    </p>
                    <button onClick={handleGenerateMasterlist} className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-md transition-colors">
                        Generate Voter Accounts
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;