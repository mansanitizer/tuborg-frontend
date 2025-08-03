import React, { useState, useEffect, memo } from 'react';
import { getRecentQueries, type RecentQuery, type UniqueRecentQuery } from '../api/webpuppy';
import JobDetailsModal from './JobDetailsModal';

interface RecentQueriesProps {
  onQuerySelect?: (query: string) => void;
}

const RecentQueries: React.FC<RecentQueriesProps> = ({ onQuerySelect }) => {
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [uniqueQueries, setUniqueQueries] = useState<UniqueRecentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'popular'>('recent');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRecentQueries();
  }, []);

  const fetchRecentQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecentQueries(10);
      console.log('🐕 Recent queries data:', data);
      console.log('🐕 Sample recent query:', data.recent_queries[0]);
      setRecentQueries(data.recent_queries);
      setUniqueQueries(data.unique_queries);
    } catch {
      setError('🐕 WebPuppy couldn\'t sniff out recent queries!');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⏳';
      case 'failed':
        return '❌';
      case 'quota_exceeded':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'processing':
        return '#fbbf24';
      case 'failed':
        return '#dc2626';
      case 'quota_exceeded':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleViewResults = (jobId: string) => {
    console.log('🐕 View Results clicked for job ID:', jobId);
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
  };

  const getActionButton = (query: RecentQuery) => {
    console.log('🐕 Action button for query:', query);
    switch (query.status) {
      case 'completed':
        // Check if job_id exists
        if (!query.job_id) {
          console.warn('🐕 No job_id found for completed query:', query);
          return (
            <button
              style={{
                padding: '4px 8px',
                background: '#6b7280',
                border: '1px solid #555',
                borderRadius: '4px',
                color: 'white',
                cursor: 'not-allowed',
                fontSize: '11px',
                fontWeight: '500'
              }}
              disabled
              title="Job ID not available"
            >
              ❓ No Job ID
            </button>
          );
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🐕 Clicking View Results for:', query.job_id);
              if (query.job_id) {
                handleViewResults(query.job_id);
              }
            }}
            style={{
              padding: '4px 8px',
              background: '#22c55e',
              border: '1px solid #16a34a',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500'
            }}
          >
            👁️ View Results
          </button>
        );
      case 'processing':
        return (
          <button
            style={{
              padding: '4px 8px',
              background: '#fbbf24',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              color: '#000',
              cursor: 'not-allowed',
              fontSize: '11px',
              fontWeight: '500'
            }}
            disabled
          >
            ⏳ Processing
          </button>
        );
      case 'failed':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuerySelect?.(query.query);
            }}
            style={{
              padding: '4px 8px',
              background: '#dc2626',
              border: '1px solid #b91c1c',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500'
            }}
            title="Copy this query to try again"
          >
            📝 Copy Query
          </button>
        );
      case 'quota_exceeded':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuerySelect?.(query.query);
            }}
            style={{
              padding: '4px 8px',
              background: '#f97316',
              border: '1px solid #ea580c',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500'
            }}
            title="Copy this query to try again later"
          >
            📝 Copy Query
          </button>
        );
      default:
        return null;
    }
  };

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '200px',
          height: '24px',
          background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px'
        }} />
        <div style={{
          width: '80px',
          height: '32px',
          background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px'
        }} />
      </div>

      {/* Tab skeleton */}
      <div style={{
        display: 'flex',
        marginBottom: '15px',
        borderBottom: '1px solid #333'
      }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            width: '120px',
            height: '40px',
            background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            margin: '0 10px 10px 0'
          }} />
        ))}
      </div>

      {/* Query items skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          padding: '12px',
          border: '1px solid #333',
          borderRadius: '6px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '85%',
            height: '16px',
            background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            marginBottom: '8px'
          }} />
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '12px',
              background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px'
            }} />
            <div style={{
              width: '80px',
              height: '12px',
              background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px'
            }} />
            <div style={{
              width: '100px',
              height: '24px',
              background: 'linear-gradient(90deg, #333 25%, #555 50%, #333 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px',
              marginLeft: 'auto'
            }} />
          </div>
        </div>
      ))}

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div style={{
        background: '#dc2626',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <strong>Error:</strong> {error}
        <button 
          onClick={fetchRecentQueries}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            background: '#ffffff20',
            border: '1px solid #ffffff40',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0 }}>🐕 What others asked WebPuppy</h3>
        <button 
          onClick={fetchRecentQueries}
          style={{
            padding: '5px 10px',
            background: '#333',
            border: '1px solid #555',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        marginBottom: '15px',
        borderBottom: '1px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('recent')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'recent' ? '#60a5fa' : '#888',
            cursor: 'pointer',
            borderBottom: activeTab === 'recent' ? '2px solid #60a5fa' : '2px solid transparent',
            fontSize: '14px'
          }}
        >
          📅 Recent ({recentQueries.length})
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            color: activeTab === 'popular' ? '#60a5fa' : '#888',
            cursor: 'pointer',
            borderBottom: activeTab === 'popular' ? '2px solid #60a5fa' : '2px solid transparent',
            fontSize: '14px'
          }}
        >
          🔥 Popular ({uniqueQueries.length})
        </button>
      </div>

      {/* Recent Queries Tab */}
      {activeTab === 'recent' && (
        <div>
          {recentQueries.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
              🐕 No recent queries found. Be the first to ask WebPuppy something!
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentQueries.map((query, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (query.job_id) {
                      handleViewResults(query.job_id);
                    }
                  }}
                  style={{
                    padding: '12px',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: query.job_id ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    opacity: query.job_id ? 1 : 0.6
                  }}
                  title={query.job_id ? 'Click to view full results and details' : 'No job details available'}
                  onMouseEnter={(e) => {
                    if (query.job_id) {
                      e.currentTarget.style.borderColor = '#60a5fa';
                      e.currentTarget.style.background = '#222';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (query.job_id) {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 5px 0', 
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        "{query.query}"
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontSize: '12px',
                        color: '#888'
                      }}>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: getStatusColor(query.status)
                        }}>
                          {getStatusIcon(query.status)}
                          {query.status}
                        </span>
                        <span>•</span>
                        <span>{formatDate(query.created_at)}</span>
                        {query.user_rating && (
                          <span style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: query.user_rating === 'good_dog' ? '#22c55e' : '#dc2626',
                            fontSize: '11px'
                          }}>
                            {query.user_rating === 'good_dog' ? '👍' : '👎'}
                            {query.user_rating === 'good_dog' ? 'Good' : 'Bad'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                      {getActionButton(query)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Queries Tab */}
      {activeTab === 'popular' && (
        <div>
          {uniqueQueries.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>
              🐕 No popular queries yet. Start asking WebPuppy questions!
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {uniqueQueries.map((query, index) => (
                <div
                  key={index}
                  onClick={() => {
                    // Popular queries don't have job_id, so we offer to copy the query
                    if (onQuerySelect) {
                      onQuerySelect(query.query);
                    }
                  }}
                  style={{
                    padding: '12px',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: onQuerySelect ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to copy this query to your input box"
                  onMouseEnter={(e) => {
                    if (onQuerySelect) {
                      e.currentTarget.style.borderColor = '#60a5fa';
                      e.currentTarget.style.background = '#222';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onQuerySelect) {
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 5px 0', 
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        "{query.query}"
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        fontSize: '12px',
                        color: '#888'
                      }}>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#fbbf24'
                        }}>
                          🔥 Asked {query.times_asked} time{query.times_asked !== 1 ? 's' : ''}
                        </span>
                        <span>•</span>
                        <span>Last: {formatDate(query.last_asked)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJobId && (
        <JobDetailsModal
          jobId={selectedJobId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRerunQuery={onQuerySelect}
        />
      )}
    </div>
  );
};

export default memo(RecentQueries);