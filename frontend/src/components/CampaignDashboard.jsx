import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Card = ({ title, value }) => (
  <div className="col-6 col-md-3 mb-3">
    <div className="card text-center">
      <div className="card-body">
        <div className="text-muted" style={{ fontSize: '0.9rem' }}>{title}</div>
        <div className="fw-bold" style={{ fontSize: '1.4rem' }}>{value}</div>
      </div>
    </div>
  </div>
);

const CampaignDashboard = () => {
  const [metrics, setMetrics] = useState({ totalCampaigns: 0, totalMessagesSent: 0, overallDeliveryRate: 0, activeSegments: 0 });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentSegments, setRecentSegments] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, cRes, sRes, dRes] = await Promise.all([
          axios.get('http://localhost:5000/api/campaigns/overview/metrics', { withCredentials: true }),
          axios.get('http://localhost:5000/api/campaigns', { withCredentials: true }),
          axios.get('http://localhost:5000/api/segments', { withCredentials: true }),
          axios.get('http://localhost:5000/api/delivery/recent', { withCredentials: true })
        ]);
        setMetrics(mRes.data);
        setRecentCampaigns(cRes.data.slice(0, 5));
        setRecentSegments(sRes.data.slice(0, 5));
        setRecentDeliveries(dRes.data.slice(0, 5));
      } catch (e) {}
    };
    load();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Campaign Dashboard</h3>
      <div className="row">
        <Card title="Total Campaigns Run" value={metrics.totalCampaigns} />
        <Card title="Total Messages Sent" value={metrics.totalMessagesSent} />
        <Card title="Overall Delivery Rate" value={`${Math.round((metrics.overallDeliveryRate || 0) * 100)}%`} />
        <Card title="Active Segments" value={metrics.activeSegments} />
      </div>

      <div className="row mt-4">
        <div className="col-12 col-lg-6 mb-3">
          <div className="card">
            <div className="card-header">Recent Campaigns</div>
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Audience</th>
                    <th>Sent</th>
                    <th>Failed</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((c, i) => (
                    <tr key={i}>
                      <td>{c.campaign_name}</td>
                      <td>{c.audience_size}</td>
                      <td>{c.sent}</td>
                      <td>{c.failed}</td>
                      <td>{Math.round((c.delivery_rate || 0) * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <div className="card">
            <div className="card-header">Recent Segment Creations</div>
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Logic</th>
                    <th>Audience</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSegments.map((s, i) => (
                    <tr key={i}>
                      <td>{s.segment_id}</td>
                      <td>{s.name}</td>
                      <td>{s.logic}</td>
                      <td>{s.audience_size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Recent Delivery Updates</span>
          <div>
            <Link className="btn btn-sm btn-primary me-2" to="/dashboard/query">Create New Segment</Link>
            <Link className="btn btn-sm btn-secondary me-2" to="/dashboard/segment">View All Campaigns</Link>
            <a className="btn btn-sm btn-outline-dark" href="https://documenter.getpostman.com" target="_blank" rel="noreferrer">API Documentation</a>
          </div>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Campaign</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentDeliveries.map((d, i) => (
                <tr key={i}>
                  <td>{d.log_id}</td>
                  <td>{d.campaign_id}</td>
                  <td>{d.customer_id}</td>
                  <td>{d.delivery_status}</td>
                  <td>{d.failure_reason || '-'}</td>
                  <td>{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;


