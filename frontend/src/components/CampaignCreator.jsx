import React, { useState } from 'react';

const examples = [
  { label: 'Generic 10% off', value: 'Hi {name}, here\'s 10% off on your next order!' },
  { label: 'High spenders', value: 'Hi {name}, enjoy exclusive 15% off!' },
  { label: 'Inactive users', value: 'Hi {name}, we miss you! Come back with 20% off' },
  { label: 'New customers', value: 'Welcome {name}! Here\'s 10% off your first order' }
];

const CampaignCreator = ({ onCreate }) => {
  const [campaignName, setCampaignName] = useState('');
  const [template, setTemplate] = useState(examples[0].value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!campaignName || !template) return;
    onCreate({ campaign_name: campaignName, message_template: template });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mt-3">
      <h5>Create Campaign</h5>
      <div className="mb-3">
        <label className="form-label">Campaign Name</label>
        <input className="form-control" value={campaignName} onChange={e => setCampaignName(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">Message Template</label>
        <select className="form-select mb-2" value={template} onChange={e => setTemplate(e.target.value)}>
          {examples.map((ex, i) => (
            <option key={i} value={ex.value}>{ex.label}</option>
          ))}
        </select>
        <textarea className="form-control" rows={3} value={template} onChange={e => setTemplate(e.target.value)} />
        <div className="form-text">Placeholders: {'{name}'}, {'{city}'}, {'{last_order_amount}'}</div>
      </div>
      <button type="submit" className="btn btn-success">Send Campaign</button>
    </form>
  );
};

export default CampaignCreator;


