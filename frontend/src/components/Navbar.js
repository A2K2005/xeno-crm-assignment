import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../logo.svg';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light dashboard-navbar">
      <div className="container-fluid d-flex align-items-center">
        <img src={logo} alt="logo" style={{ height: 24, marginRight: 12 }} />
        <ul className="navbar-nav mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className={`nav-link btn ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link btn ${location.pathname === '/dashboard/query' ? 'active' : ''}`} to="/dashboard/query">Query Builder</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link btn ${location.pathname === '/dashboard/segment' ? 'active' : ''}`} to="/dashboard/segment">Campaigns</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link btn ${location.pathname === '/dashboard/messages' ? 'active' : ''}`} to="/dashboard/messages">Message History (Communication Log)</Link>
          </li>
        </ul>

        <button className="btn btn-outline-danger ms-auto" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
