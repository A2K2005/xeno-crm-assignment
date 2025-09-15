import React from 'react';

const DeliveryStats = ({ sent, failed, processing }) => {
  const total = (sent || 0) + (failed || 0) + (processing || 0);
  const rate = total ? Math.round(((sent || 0) / total) * 1000) / 10 : 0;
  return (
    <div className="d-flex gap-3 mt-2">
      <span className="badge bg-success">Sent: {sent || 0}</span>
      <span className="badge bg-danger">Failed: {failed || 0}</span>
      <span className="badge bg-secondary">Processing: {processing || 0}</span>
      <span className="badge bg-primary">Delivery: {rate}%</span>
    </div>
  );
};

export default DeliveryStats;


