import React, { useState } from 'react';
import axios from 'axios';
import AudiencePreview from './AudiencePreview';
import CampaignCreator from './CampaignCreator';

const randomMessages = [
  "Hey NAME!, We miss you... Get 10% discount on your next purchase",
  "Hey NAME!, We hear you... Get flat Rs. 500 off on your next purchase",
  "Hey NAME!, We have got a fantastic offer specially for you... Buy 1 and Get 2 free on your next purchase in T-Shirts/Shirts/Jeans.",
  "Hey NAME!, Get flat 15% cashback on your next purchase with us with Axis Bank Credit Card"
];

const getRandomMessage = (name) => {
  const msg = randomMessages[Math.floor(Math.random() * randomMessages.length)];
  return msg.replace('NAME', name);
};

const QueryBuilder = () => {
  const [conditions, setConditions] = useState([
    { field: '', operator: '', value: '', connector: '' }
  ]);
  const [results, setResults] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [sendingStatus, setSendingStatus] = useState({});
  const [audienceCount, setAudienceCount] = useState(null);
  const [segmentId, setSegmentId] = useState(null);

  const handleCampaignMessageChange = (index, value) => {
    const updatedResults = [...results];
    updatedResults[index].campaignMessage = value;
    setResults(updatedResults);
  };

  const handleChange = (index, key, value) => {
    const updated = [...conditions];
    updated[index][key] = value;
    setConditions(updated);
  };

  const handleAdd = (connector) => {
    if (conditions.length < 5) {
      setConditions([
        ...conditions,
        { field: '', operator: '', value: '', connector }
      ]);
    }
  };

  const handleDelete = (index) => {
    const updated = [...conditions];
    updated.splice(index, 1);
    setConditions(updated);
  };

  const handleRunQuery = async () => {
    const filteredConditions = conditions.filter(cond =>
      cond.field && cond.operator && cond.value !== ''
    );

    if (filteredConditions.length === 0) {
      alert('Please add at least one complete condition before running the query.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/segments/preview', {
        conditions: filteredConditions.map(c => ({ field: c.field.replace(' ', '_'), operator: c.operator, value: Number(c.value) })),
        logic: filteredConditions[1]?.connector || 'AND'
      });
      setAudienceCount(response.data.count);
      setSendingStatus({});
    } catch (err) {
      console.error('Query Error:', err);
      alert('Failed to run query. Please check console for details.');
    }
  };

  const handlePromptSubmit = async () => {
    if (!prompt) return;
    try {
      setLoadingAI(true);
      const res = await axios.post('http://localhost:5000/api/ai/parse-query', { prompt });
      setConditions(res.data);
    } catch (err) {
      console.error('AI Parsing Error:', err);
      alert('AI failed to parse query. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleClearSearch = () => {
    setResults([]);
    setConditions([{ field: '', operator: '', value: '', connector: '' }]);
    setPrompt('');
    setSendingStatus({});
  };

  const sendMailToCustomer = async (idx) => {
    const cust = results[idx];
    const payload = {
      customerId: cust.customerId,
      name: cust.name,
      email: cust.email,
      message: cust.campaignMessage,
      subject: `Hey ${cust.name}, We have got an offer for you!!`
    };

    try {
      const res = await axios.post('http://localhost:5000/api/mail/send', payload);
      const status = res.data.status || 'unknown';

      setSendingStatus(prev => ({ ...prev, [cust.customerId]: status }));
      alert(`Mail to ${cust.name} (${cust.email}) status: ${status}`);
    } catch (error) {
      console.error('Mail sending error:', error);
      setSendingStatus(prev => ({ ...prev, [cust.customerId]: 'failed' }));
      alert(`Failed to send mail to ${cust.name}`);
    }
  };

  const sendMailToAll = async () => {
    const statuses = {};
    for (let i = 0; i < results.length; i++) {
      const cust = results[i];
      try {
        const payload = {
          customerId: cust.customerId,
          name: cust.name,
          email: cust.email,
          message: cust.campaignMessage,
          subject: `Hey ${cust.name}, We have got an offer for you!!`
        };

        const res = await axios.post('http://localhost:5000/api/mail/send', payload);
        statuses[cust.customerId] = res.data.status || 'unknown';
      } catch {
        statuses[cust.customerId] = 'failed';
      }
    }
    setSendingStatus(statuses);
    alert('Sent emails to all customers. Check individual statuses.');
  };

  const queryText = conditions
    .filter(cond => cond.field && cond.operator && cond.value !== '')
    .map((cond, i) => {
      const text = `${cond.field} ${cond.operator} ${cond.value}`;
      if (i === 0) return text;
      return `${cond.connector || 'AND'} ${text}`; 
    })
    .join(' ');

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Query Builder</h2>

      <div className="mb-3">
        <label className="form-label"><b>AI Assistant</b> (write your condition in natural language):</label>
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="e.g. users who haven’t purchased in 90 days and spent less than 10000"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handlePromptSubmit} disabled={loadingAI}>
            {loadingAI ? 'Parsing...' : 'Parse with AI'}
          </button>
        </div>
      </div>

      {conditions.map((cond, index) => (
        <div className="card mb-3" key={index}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Condition {index + 1}</span>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(index)}
              disabled={conditions.length === 1}
            >
              Delete
            </button>
          </div>
          <div className="card-body row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Filter By</label>
              <select
                className="form-select"
                value={cond.field}
                onChange={(e) => handleChange(index, 'field', e.target.value)}
              >
                <option value="">Select</option>
                <option value="days inactive">days inactive</option>
                <option value="amount">amount</option>
                <option value="visits">visits</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={cond.operator}
                onChange={(e) => handleChange(index, 'operator', e.target.value)}
              >
                <option value="">Select</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
                <option value=">=">&gt;=</option>
                <option value="<=">&lt;=</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Value</label>
              <input
                type="number"
                className="form-control"
                value={cond.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
              />
            </div>
          </div>
          {index > 0 && (
            <div className="mb-3 px-3">
              <label className="form-label">Connector</label>
              <select
                className="form-select"
                value={cond.connector}
                onChange={(e) => handleChange(index, 'connector', e.target.value)}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
          )}
        </div>
      ))}

      <div className="mb-3">
        {conditions.length < 5 && (
          <>
            <button className="btn btn-primary me-2" onClick={() => handleAdd('AND')}>
              Add Condition (AND)
            </button>
            <button className="btn btn-primary" onClick={() => handleAdd('OR')}>
              Add Condition (OR)
            </button>
          </>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Query Preview</label>
        <div className="form-control bg-light">{queryText || 'No conditions yet.'}</div>
      </div>

      <button className="btn btn-dark mb-2" onClick={handleRunQuery}>
        Preview Audience
      </button>

      <AudiencePreview count={audienceCount} />

      {audienceCount != null && (
        <CampaignCreator onCreate={async ({ campaign_name, message_template }) => {
          try {
            // First create (or reuse) a segment for persistence
            const filteredConditions = conditions.filter(cond => cond.field && cond.operator && cond.value !== '');
            const createSeg = await axios.post('http://localhost:5000/api/segments/create', {
              name: `QB ${new Date().toISOString()}`,
              conditions: filteredConditions.map(c => ({ field: c.field.replace(' ', '_'), operator: c.operator, value: Number(c.value) })),
              logic: filteredConditions[1]?.connector || 'AND',
              description: 'Created via Query Builder'
            });
            const segId = createSeg.data.segment_id;
            setSegmentId(segId);
            const resp = await axios.post('http://localhost:5000/api/campaigns/create', {
              segment_id: segId,
              campaign_name,
              message_template
            });
            alert(`Campaign queued. ID: ${resp.data.campaign_id}, audience: ${resp.data.audience_size}`);
          } catch (e) {
            alert('Failed to create campaign');
          }
        }} />
      )}

      <div className="mt-4">
        <button className="btn btn-warning" onClick={handleClearSearch}>
          Clear Search
        </button>
      </div>
    </div>
  );
};

export default QueryBuilder;
