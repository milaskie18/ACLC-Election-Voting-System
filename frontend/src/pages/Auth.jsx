import React, { useState } from 'react';
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

const Auth = () => {
    const [formData, setFormData] = useState({
        studentId: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Student ID: Only numbers allowed (except for 'admin')
        if (formData.studentId.toLowerCase() !== 'admin' && !/^\d+$/.test(formData.studentId)) {
            return MySwal.fire({ icon: 'warning', title: 'Invalid Input', text: 'Student ID must only contain numbers.' });
        }

        // LOGIN FLOW
        try {
            const response = await api.post('/auth/login', {
                studentId: formData.studentId,
                password: formData.password
            });
            
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Route based on Student ID (adjust 'admin' to match your actual Admin ID format)
            if (formData.studentId.toLowerCase() === 'admin') {
                navigate('/admin');
            } else {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userResponse = await api.get('/users/' + payload.id);
                
                if (userResponse.data.isCandidate) {
                    Toast.fire({ icon: 'success', title: 'Welcome, Candidate!' });
                    navigate('/candidate-dashboard');
                } else {
                    Toast.fire({ icon: 'success', title: 'Welcome, Voter!' });
                    navigate('/ballot');
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login failed';
            MySwal.fire({
                icon: 'error',
                title: 'Authentication Error',
                text: errorMsg
            });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Voter Login</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required style={inputStyle} />
                    
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={inputStyle} />
                    
                    <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                        Login
                    </button>
                    
                    <button type="button" onClick={() => navigate('/apply')} style={{ padding: '12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                        Run for Office (Candidate Application)
                    </button>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px'
};

export default Auth;