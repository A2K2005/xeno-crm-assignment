import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MarketingApp from './marketing/App';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketingApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/landing" element={<MarketingApp />} />
      </Routes>
    </Router>
  );
}

export default App;
