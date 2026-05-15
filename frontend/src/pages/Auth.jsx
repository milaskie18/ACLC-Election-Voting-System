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
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        studentId: '',
        lastName: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoginMode) {
            // LOGIN FLOW
            try {
                const response = await api.post('/auth/login', {
                    studentId: formData.studentId,
                    password: formData.password
                });
                
                // ... inside handleSubmit -> LOGIN FLOW

                localStorage.setItem('token', response.data.token);

                // Route based on Student ID (adjust 'admin' to match your actual Admin ID format)
                if (formData.studentId.toLowerCase() === 'admin') {
                navigate('/admin');
                } else {
        navigate('/ballot');
            }
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Login failed';
                MySwal.fire({
                    icon: 'error',
                    title: 'Authentication Error',
                    text: errorMsg
                });
            }
        } else {
            // REGISTER FLOW
            if (formData.password !== formData.confirmPassword) {
                return MySwal.fire('Error', 'Passwords do not match', 'error');
            }
            
            try {
                await api.post('/auth/register', {
                    studentId: formData.studentId,
                    lastName: formData.lastName,
                    password: formData.password
                });
                
                Toast.fire({ icon: 'success', title: 'Registration successful. Please wait for admin approval.' });
                setIsLoginMode(true);
                setFormData({ studentId: '', lastName: '', password: '', confirmPassword: '' });
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Registration failed';
                MySwal.fire({
                    icon: 'error',
                    title: 'Registration Error',
                    text: errorMsg
                });
            }
        }
    };



    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isLoginMode ? 'Voter Login' : 'Student Registration'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required style={inputStyle} />
                    
                    {!isLoginMode && (
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
                    )}
                    
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={inputStyle} />
                    
                    {!isLoginMode && (
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
                    )}

                    <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                        {isLoginMode ? 'Login' : 'Register'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                        {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px'
};

export default Auth;