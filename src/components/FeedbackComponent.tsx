import React, { useState } from 'react';
import { rateJob } from '../api/webpuppy';

interface FeedbackComponentProps {
  jobId: string;
  currentRating?: string;
  onRatingChange?: (rating: string) => void;
  style?: 'default' | 'compact';
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ 
  jobId, 
  currentRating, 
  onRatingChange,
  style = 'default'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [localRating, setLocalRating] = useState(currentRating);

  const handleRating = async (rating: 'good_dog' | 'bad_dog') => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await rateJob(jobId, rating);
      
      if (result.success) {
        setLocalRating(rating);
        if (onRatingChange) {
          onRatingChange(rating);
        }
        
        // Show success message based on rating
        const successMessage = rating === 'good_dog' 
          ? '✅ Thank you for your positive feedback!'
          : '📝 Thank you for your feedback. We\'ll use it to improve our results.';
        setMessage(successMessage);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to submit rating');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating. Please try again.';
      setMessage(`❌ ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompact = style === 'compact';

  const containerStyle = {
    margin: isCompact ? '10px 0' : '20px 0',
    padding: isCompact ? '12px' : '20px',
    background: isCompact ? '#0a0a0a' : '#1a1a1a',
    borderRadius: isCompact ? '6px' : '8px',
    border: '1px solid #333',
    textAlign: 'center' as const
  };

  const titleStyle = {
    margin: isCompact ? '0 0 10px 0' : '0 0 15px 0',
    fontSize: isCompact ? '14px' : '16px',
    color: '#fff',
    fontWeight: '500' as const
  };

  const buttonsStyle = {
    display: 'flex',
    gap: isCompact ? '8px' : '12px',
    justifyContent: 'center',
    marginBottom: message ? '12px' : '0'
  };

  const getButtonStyle = (rating: 'good_dog' | 'bad_dog') => {
    const isSelected = localRating === rating;
    const baseStyle = {
      padding: isCompact ? '6px 12px' : '10px 20px',
      border: isSelected ? '2px solid' : '1px solid #555',
      borderRadius: '6px',
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      fontSize: isCompact ? '12px' : '14px',
      fontWeight: '500' as const,
      transition: 'all 0.2s ease',
      disabled: isSubmitting
    };

    if (rating === 'good_dog') {
      return {
        ...baseStyle,
        borderColor: isSelected ? '#22c55e' : '#555',
        backgroundColor: isSelected ? '#22c55e' : '#333',
        color: isSelected ? '#000' : 'white'
      };
    } else {
      return {
        ...baseStyle,
        borderColor: isSelected ? '#dc2626' : '#555',
        backgroundColor: isSelected ? '#dc2626' : '#333',
        color: 'white'
      };
    }
  };

  return (
    <div style={containerStyle}>
      <h4 style={titleStyle}>
        💬 Rate this dataset
      </h4>
      
      <div style={buttonsStyle}>
        <button
          style={getButtonStyle('good_dog')}
          onClick={() => handleRating('good_dog')}
          disabled={isSubmitting}
          title="Rate this result as good"
        >
          {isCompact ? '👍' : '👍 Good Dog!'}
        </button>
        
        <button
          style={getButtonStyle('bad_dog')}
          onClick={() => handleRating('bad_dog')}
          disabled={isSubmitting}
          title="Rate this result as bad"
        >
          {isCompact ? '👎' : '👎 Bad Dog'}
        </button>
      </div>
      
      {isSubmitting && (
        <div style={{
          color: '#888',
          fontSize: isCompact ? '11px' : '12px',
          fontStyle: 'italic'
        }}>
          ⏳ Submitting rating...
        </div>
      )}
      
      {message && (
        <div style={{
          padding: isCompact ? '6px' : '10px',
          borderRadius: '4px',
          backgroundColor: message.includes('🎉') ? '#22c55e20' : '#dc262620',
          color: message.includes('🎉') ? '#22c55e' : '#fbbf24',
          fontSize: isCompact ? '11px' : '12px',
          border: `1px solid ${message.includes('🎉') ? '#22c55e40' : '#fbbf2440'}`
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;