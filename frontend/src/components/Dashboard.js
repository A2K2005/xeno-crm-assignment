import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CampaignDashboard from './CampaignDashboard';
import QueryBuilder from './QueryBuilder';
import SegmentHistory from './SegmentHistory';
import MessageHistory from './MessageHistory';
import Navbar from './Navbar';
import Footer from './Footer';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        Customer Relationship Management System
      </header>

      <Navbar />

      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<CampaignDashboard />} />
          <Route path="/query" element={<QueryBuilder />} />
          <Route path="/segment" element={<SegmentHistory />} />
          <Route path="/messages" element={<MessageHistory />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
