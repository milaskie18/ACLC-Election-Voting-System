import React from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#023E8A]">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-[#023E8A] mb-2">Welcome Candidate!</h1>
                    <p className="text-gray-600">ACLC Digital Voting System</p>
                </div>

                <div className="bg-[#e9f2ff] p-6 rounded-lg mb-8 text-center border border-[#b8daff]">
                    <h2 className="text-2xl font-bold text-[#0077B6] mb-4">Thank you for stepping up to lead!</h2>
                    <p className="text-gray-700 mb-4">
                        Your candidacy has been registered in the system. As a candidate, you still have the right to cast your vote for the upcoming student council election.
                    </p>
                    <p className="text-gray-700 font-semibold">
                        Remember, every vote counts!
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <button onClick={() => navigate('/ballot')} className="w-full bg-[#0077B6] text-white font-bold py-4 rounded hover:bg-[#023E8A] transition-colors shadow-md text-lg">
                        Proceed to Voting Ballot
                    </button>
                    <button onClick={handleLogout} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded hover:bg-gray-300 transition-colors shadow-sm">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;