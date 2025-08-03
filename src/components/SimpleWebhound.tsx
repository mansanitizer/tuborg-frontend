import React, { useState } from 'react';

const SimpleWebhound: React.FC = () => {
  const [query, setQuery] = useState('');

  return (
    <div style={{ padding: '20px', background: '#0b1220', color: 'white', margin: '20px' }}>
      <h2>Webhound Dataset Generator</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
        style={{ width: '100%', height: '100px', padding: '10px' }}
      />
      <button style={{ marginTop: '10px', padding: '10px 20px' }}>
        Generate Dataset
      </button>
    </div>
  );
};

export default SimpleWebhound;