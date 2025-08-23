import React, { useState } from "react";
import backgroundImage from '../../assets/bgbg.png';
import googleIcon from '../../assets/google.png';
import '../Register/Register.css';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
   
    return (
        <div className="register-page background-blur" style={{ backgroundImage: `url(${backgroundImage})` }}>
           <div className="login-container">
                <div className="login-cards">
                    <div className="left-card">
                        <h2 className="register-title">REGISTER HERE</h2>
                        <p>Don't have an account?</p>
                        <button className="login-btn" onClick={() => navigate ('/login')}>LOGIN HERE</button>
                    </div>

                <div className="right-card">
                    <h2>SIGN UP</h2>
                    <form>
                    <div className="input-container">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type= "text"
                            id = "firstName"
                            placeholder="FIRST NAME"
                            required
                        />
                    </div>

                    <div className="input-container">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            placeholder="LAST NAME"
                            required
                        />
                    </div>

                    {['email', 'password', 'confirmPassword'].map((field) => (
                        <div key={field} className="input-container">
                        <label htmlFor={field}>
                            {field == 'email'
                            ? 'Email'
                            : field === 'password'
                            ? 'Password'
                            : 'Confirm Password'}
                        </label>
                            <input
                                type={field.includes('password') ? 'password': 'email'}
                                id={field}
                                placeholder={
                                    field === 'email'
                                    ? 'EMAIL'
                                    : field === 'password'
                                    ? 'PASSWORD'
                                    : 'CONFIRM PASSWORD'
                                }
                                required
                            />
                        </div>
                    ))}

                    <div className="input-container">
                        <label htmlFor="role">Role</label>
                        <select id = "role">
                            <option value="">SELECT ROLE</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

        
                    <div className="actions">
                        <button type= "submit">SIGN UP</button>
                    </div>
                    </form>

                        <p className="register-text">
                            Already have an account? <a href="/login">Log in here</a>
                        </p>

                        <div className="google-signin">
                        <button className="google-btn">
                            <img src={googleIcon} alt="google icon"/>
                            Or Register with Google
                        </button>

                        </div>
                    </div>
                </div>
           </div>
        </div>
    )       
}

export default Register;