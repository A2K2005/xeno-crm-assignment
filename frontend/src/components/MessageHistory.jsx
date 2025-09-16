import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessageHistory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('https://xenoapi.jsondev.in/api/delivery/recent', { withCredentials: true });
        setItems(res.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading message history...</div>;

  return (
    <div className="container mt-4">
      <h3>Message History</h3>
      <table className="table table-bordered table-striped">
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
          {items.map((d, i) => (
            <tr key={i}>
              <td>{d.log_id}</td>
              <td>{d.campaign_id}</td>
              <td>{d.customer_id}</td>
              <td>{d.delivery_status}</td>
              <td>{d.failure_reason || '-'}</td>
              <td>{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageHistory;



