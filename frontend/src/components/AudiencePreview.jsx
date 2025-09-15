import React from 'react';

const AudiencePreview = ({ count }) => {
  if (count == null) return null;
  return (
    <div className="alert alert-info mt-3">
      This segment will reach <b>{count}</b> customers.
    </div>
  );
};

export default AudiencePreview;


