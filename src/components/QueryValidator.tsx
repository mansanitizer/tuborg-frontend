import React, { useState, useEffect } from 'react';
import { validateQuery, type ValidationResult } from '../utils/queryValidation';

interface QueryValidatorProps {
  query: string;
  onValidationChange?: (result: ValidationResult) => void;
}

const QueryValidator: React.FC<QueryValidatorProps> = ({ query, onValidationChange }) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    isBlocked: false,
    warnings: [],
    suggestions: [],
    blockedReasons: []
  });

  useEffect(() => {
    const result = validateQuery(query);
    setValidationResult(result);
    
    // Notify parent component of validation changes
    if (onValidationChange) {
      onValidationChange(result);
    }
  }, [query, onValidationChange]);

  if (validationResult.warnings.length === 0 && !validationResult.isBlocked) {
    return null;
  }

  const isBlocked = validationResult.isBlocked;
  const backgroundColor = isBlocked ? '#fee2e2' : '#fef3c7';
  const borderColor = isBlocked ? '#dc2626' : '#f59e0b';
  const textColor = isBlocked ? '#7f1d1d' : '#92400e';

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px',
      borderRadius: '6px',
      backgroundColor,
      border: `1px solid ${borderColor}`
    }}>
      {isBlocked && (
        <div style={{
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: textColor
        }}>
          <span>🚫</span>
          <span>QUERY BLOCKED</span>
        </div>
      )}
      
      <div>
        {validationResult.warnings.map((warning, index) => (
          <div key={index} style={{
            color: textColor,
            marginBottom: '8px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>{isBlocked ? '🚫' : '⚠️'}</span>
            <span>{warning}</span>
          </div>
        ))}
      </div>
      
      {validationResult.suggestions.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <strong style={{ color: textColor, fontSize: '14px' }}>
            💡 {isBlocked ? 'Required changes:' : 'Suggestions:'}
          </strong>
          <ul style={{ 
            margin: '8px 0 0 0', 
            paddingLeft: '20px' 
          }}>
            {validationResult.suggestions.map((suggestion, index) => (
              <li key={index} style={{
                color: textColor,
                marginBottom: '4px',
                fontSize: '13px'
              }}>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isBlocked && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: isBlocked ? '#dc2626' : '#f59e0b',
          borderRadius: '4px',
          color: 'white',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          This query cannot be submitted until the issues above are resolved.
        </div>
      )}
    </div>
  );
};

export default QueryValidator;