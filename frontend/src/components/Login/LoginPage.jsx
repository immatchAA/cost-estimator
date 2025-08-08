import React from "react";
import '../Register/Register.css';
import backgroundImage from '../../assets/bgbg.png';


function Login () {
  return (
    <div className="login-page background-blur" style={{ backgroundImage: `url(${backgroundImage})`}}>
      <div className="login-container">
        <div className="login-cards">
      
      <div className="left-card">
        <h2 className="instructor-title">LOGIN HERE</h2>
        <button className="register-btn">REGISTER HERE</button>
      </div>

      <div className="right-card">
        <h2>SIGN IN</h2>
        <form>
          {['email', 'password'].map((field) =>(
              <div key={field} className="input-container">
                <label htmlFor={field}>{field === 'email' ? 'Email' : 'Password'}</label>
                <input
                  type={field === 'password' ? 'password' : 'email'}
                  id={field}
                  placeholder={field === 'password' ? 'PASSWORD' : 'EMAIL'}
                  required
                />
              </div>
          ))}
          <div className="actions">
            <button type="submit">LOGIN</button>
            <p className="forgot-password">Forgot Password?</p>
          </div>
        </form>

          <p className="register-text">
            Don't have an Account? <a href="/register">Sign Up</a>
          </p>
      </div>
    </div>
    </div>
    </div>
  );
}
export default Login;