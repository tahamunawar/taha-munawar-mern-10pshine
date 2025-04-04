import React from 'react';
import { useLocation } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-brand">
            <div className="app-logo">
              <span>📝</span>
            </div>
            <h1>NoteKeeper</h1>
            <p>Your personal note-taking application</p>
          </div>
          
          <div className="auth-form-wrapper">
            {isLogin ? <Login /> : <Signup />}
          </div>
        </div>
        
        <div className="auth-image">
          <div className="auth-features">
            <h2>Features</h2>
            <ul>
              <li>
                <span className="feature-icon">👤</span>
                <span>Personal user accounts</span>
              </li>
              <li>
                <span className="feature-icon">🔒</span>
                <span>Secure and private notes</span>
              </li>
              <li>
                <span className="feature-icon">📓</span>
                <span>Rich text editing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 