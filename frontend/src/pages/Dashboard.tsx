import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>NoteKeeper Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="notes-placeholder">
          <h2>Your Notes</h2>
          <p>Your notes will appear here.</p>
          <p>Dashboard page is a placeholder. Future implementation will include the list of notes.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 