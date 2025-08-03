import React, { useState, useEffect } from 'react';
import { getRatingStats, type RatingStats as RatingStatsType } from '../api/webpuppy';

interface RatingStatsProps {
  refreshTrigger?: number; // Optional prop to trigger refresh
  style?: 'default' | 'compact';
}

const RatingStats: React.FC<RatingStatsProps> = ({ refreshTrigger, style = 'default' }) => {
  const [stats, setStats] = useState<RatingStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRatingStats();
      setStats(data);
    } catch (err) {
      setError('Unable to load rating statistics.');
      console.error('Failed to fetch rating stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCompact = style === 'compact';

  if (loading) {
    return (
      <div style={{
        padding: isCompact ? '12px' : '20px',
        textAlign: 'center',
        color: '#888',
        fontSize: isCompact ? '12px' : '14px'
      }}>
        📊 Loading statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: isCompact ? '12px' : '20px',
        textAlign: 'center',
        color: '#dc2626',
        fontSize: isCompact ? '12px' : '14px'
      }}>
        {error}
        <button
          onClick={fetchStats}
          style={{
            marginLeft: '10px',
            padding: '4px 8px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!stats || stats.total_rated === 0) {
    return (
      <div style={{
        padding: isCompact ? '12px' : '20px',
        textAlign: 'center',
        color: '#888',
        fontSize: isCompact ? '12px' : '14px'
      }}>
        📊 No ratings yet - be the first to rate a dataset!
      </div>
    );
  }

  const containerStyle = {
    margin: isCompact ? '10px 0' : '20px 0',
    padding: isCompact ? '12px' : '20px',
    border: '1px solid #333',
    borderRadius: isCompact ? '6px' : '8px',
    backgroundColor: '#1a1a1a',
    color: 'white'
  };

  const titleStyle = {
    margin: '0 0 15px 0',
    fontSize: isCompact ? '14px' : '16px',
    fontWeight: '500' as const,
    textAlign: 'center' as const
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isCompact ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: isCompact ? '8px' : '16px',
    marginBottom: '15px'
  };

  const getStatCardStyle = (type?: 'good' | 'bad') => {
    let backgroundColor = '#0a0a0a';
    let borderColor = '#333';
    
    if (type === 'good') {
      backgroundColor = '#065f4620';
      borderColor = '#22c55e40';
    } else if (type === 'bad') {
      backgroundColor = '#7f1d1d20';
      borderColor = '#dc262640';
    }

    return {
      textAlign: 'center' as const,
      padding: isCompact ? '8px' : '12px',
      borderRadius: '6px',
      backgroundColor,
      border: `1px solid ${borderColor}`
    };
  };

  const statNumberStyle = {
    fontSize: isCompact ? '16px' : '20px',
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: '4px'
  };

  const statLabelStyle = {
    fontSize: isCompact ? '10px' : '12px',
    color: '#888',
    marginBottom: '2px'
  };

  const statPercentageStyle = (type: 'good' | 'bad') => ({
    fontSize: isCompact ? '11px' : '13px',
    fontWeight: '500' as const,
    color: type === 'good' ? '#22c55e' : '#dc2626'
  });

  const progressBarStyle = {
    display: 'flex',
    height: isCompact ? '6px' : '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#333',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>
        📊 User Feedback Statistics
      </h3>
      
      <div style={statsGridStyle}>
        <div style={getStatCardStyle()}>
          <div style={statNumberStyle}>{stats.total_rated}</div>
          <div style={statLabelStyle}>Total Rated</div>
        </div>
        
        <div style={getStatCardStyle('good')}>
          <div style={statNumberStyle}>{stats.good_dogs}</div>
          <div style={statLabelStyle}>Good Dogs</div>
          <div style={statPercentageStyle('good')}>
            {stats.good_percentage.toFixed(1)}%
          </div>
        </div>
        
        <div style={getStatCardStyle('bad')}>
          <div style={statNumberStyle}>{stats.bad_dogs}</div>
          <div style={statLabelStyle}>Bad Dogs</div>
          <div style={statPercentageStyle('bad')}>
            {stats.bad_percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div style={progressBarStyle}>
        <div
          style={{
            backgroundColor: '#22c55e',
            width: `${stats.good_percentage}%`,
            transition: 'width 0.3s ease'
          }}
          title={`Good Dogs: ${stats.good_percentage.toFixed(1)}%`}
        />
        <div
          style={{
            backgroundColor: '#dc2626',
            width: `${stats.bad_percentage}%`,
            transition: 'width 0.3s ease'
          }}
          title={`Bad Dogs: ${stats.bad_percentage.toFixed(1)}%`}
        />
      </div>
      
      {!isCompact && (
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '11px',
          color: '#666'
        }}>
          {stats.good_percentage >= 80 ? '🎉 Great job! Users love the results!' :
           stats.good_percentage >= 60 ? '👍 Good performance overall' :
           '📈 Room for improvement - keep training!'}
        </div>
      )}
    </div>
  );
};

export default RatingStats;