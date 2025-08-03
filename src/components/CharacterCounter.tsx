import React from 'react';

interface CharacterCounterProps {
  query: string;
  maxLength?: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ 
  query, 
  maxLength = 1024 
}) => {
  const currentLength = query.length;
  const isNearLimit = currentLength > maxLength * 0.8;
  const isOverLimit = currentLength > maxLength;
  
  const getCounterStyle = () => {
    if (isOverLimit) {
      return {
        color: '#ef4444'
      };
    } else if (isNearLimit) {
      return {
        color: '#f59e0b'
      };
    } else {
      return {
        color: '#6b7280'
      };
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      marginTop: '8px',
      ...getCounterStyle()
    }}>
      <span style={{ fontWeight: '500' }}>{currentLength}</span>
      <span>/</span>
      <span>{maxLength}</span>
      {isNearLimit && !isOverLimit && (
        <span style={{ marginLeft: '8px', fontSize: '11px' }}>
          ⚠️ Approaching limit
        </span>
      )}
      {isOverLimit && (
        <span style={{ marginLeft: '8px', fontSize: '11px' }}>
          🚫 Over limit
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;