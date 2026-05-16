import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-[#0077B6] selection:text-white">
            
            {/* Minimal Header */}
            <header className="w-full bg-white shadow-sm py-6 px-8 border-b border-gray-200">
                <h1 className="text-2xl font-black text-[#023E8A] tracking-tighter text-center md:text-left">
                    ACLC<span className="text-[#0077B6]">VOTES</span>
                </h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-10 md:p-16 max-w-lg w-full text-center border-t-4 border-[#0077B6]">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#023E8A] mb-4">
                        ACLC Digital Election
                    </h2>
                    <p className="text-gray-600 mb-10 text-lg">
                        Secure, transparent, and direct student voting.
                    </p>
                    
                    <Link 
                        to="/login" 
                        className="inline-block w-full bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold py-4 px-8 rounded transition-colors duration-300 shadow-md"
                    >
                        Access Voting Portal
                    </Link>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="w-full text-center py-6 text-sm text-gray-500 bg-white border-t border-gray-200 mt-auto">
                &copy; {new Date().getFullYear()} ACLC College Electoral Committee. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;