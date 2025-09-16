import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CampaignHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get('https://xenoapi.jsondev.in/api/campaigns', { withCredentials: true });
        setItems(res.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div className="container mt-4">
      <h3>Campaign History</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Audience</th>
            <th>Sent</th>
            <th>Failed</th>
            <th>Delivery Rate</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c, i) => (
            <tr key={i}>
              <td>{c.campaign_name}</td>
              <td>{new Date(c.created_at).toLocaleString()}</td>
              <td>{c.audience_size}</td>
              <td>{c.sent}</td>
              <td>{c.failed}</td>
              <td>{(c.delivery_rate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignHistory;


