import React, { useState, useEffect, useCallback } from 'react';
import { 
  getRawData, 
  getJobResults, 
  downloadCSV, 
  type DatasetResult, 
  type RawDataResponse 
} from '../api/webpuppy';
import FeedbackComponent from './FeedbackComponent';

interface JobDetailsModalProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onRerunQuery?: (query: string) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  jobId, 
  isOpen, 
  onClose, 
  onRerunQuery 
}) => {
  const [activeTab, setActiveTab] = useState<'dataset' | 'raw' | 'metadata'>('dataset');
  const [jobData, setJobData] = useState<DatasetResult | null>(null);
  const [rawData, setRawData] = useState<RawDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const fetchJobData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both regular results and raw data
      const [jobResults, rawResults] = await Promise.allSettled([
        getJobResults(jobId),
        getRawData(jobId)
      ]);

      if (jobResults.status === 'fulfilled') {
        setJobData(jobResults.value);
      } else {
        console.error('Failed to fetch job results:', jobResults.reason);
      }

      if (rawResults.status === 'fulfilled') {
        setRawData(rawResults.value);
      } else {
        console.error('Failed to fetch raw data:', rawResults.reason);
      }

      // If both failed, show error
      if (jobResults.status === 'rejected' && rawResults.status === 'rejected') {
        setError('🐕 WebPuppy couldn\'t fetch the job data. It might have expired!');
      }
    } catch {
      setError('🐕 WebPuppy encountered an error fetching the data!');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobData();
    }
  }, [isOpen, jobId, fetchJobData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRerun = () => {
    if (jobData?.query && onRerunQuery) {
      onRerunQuery(jobData.query);
      onClose();
    }
  };

  const copyJobId = () => {
    navigator.clipboard.writeText(jobId);
    // Could add a toast notification here
  };

  const handleRatingChange = (rating: string) => {
    setCurrentRating(rating);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: isMobile ? '0' : '12px',
        width: isMobile ? '100%' : '90%',
        maxWidth: isMobile ? 'none' : '1000px',
        height: isMobile ? '100vh' : 'auto',
        maxHeight: isMobile ? 'none' : '90vh',
        overflow: 'hidden',
        border: isMobile ? 'none' : '1px solid #333',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '15px' : '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              color: '#fff',
              fontSize: isMobile ? '18px' : '20px'
            }}>
              🐕 Job Details
            </h2>
            {jobData && (
              <>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e0e0e0',
                  fontWeight: '500',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isMobile ? 'nowrap' : 'normal',
                  maxWidth: '100%'
                }}>
                  "{jobData.query}"
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '2px' : '15px', 
                  fontSize: '11px', 
                  color: '#888'
                }}>
                  <span>Job ID: {isMobile ? jobId.substring(0, 8) + '...' : jobId}</span>
                  <span>Status: {jobData.status}</span>
                  {rawData && (
                    <span>Created: {formatDate(rawData.created_at)}</span>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: isMobile ? '28px' : '24px',
              cursor: 'pointer',
              padding: isMobile ? '5px' : '0',
              marginLeft: isMobile ? '10px' : '20px',
              minWidth: isMobile ? '40px' : 'auto',
              height: isMobile ? '40px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: isMobile ? '10px 15px' : '15px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          gap: isMobile ? '8px' : '10px',
          flexWrap: 'wrap',
          flexShrink: 0,
          overflowX: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch'
        }}>
          <button
            onClick={() => downloadCSV(jobId)}
            disabled={!jobData || jobData.status !== 'completed'}
            style={{
              padding: isMobile ? '8px 12px' : '8px 16px',
              background: jobData?.status === 'completed' ? '#22c55e' : '#333',
              border: '1px solid #555',
              borderRadius: '6px',
              color: 'white',
              cursor: jobData?.status === 'completed' ? 'pointer' : 'not-allowed',
              fontSize: isMobile ? '12px' : '14px',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            {isMobile ? '📋 CSV' : '📋 Download CSV'}
          </button>
          <button
            onClick={handleRerun}
            disabled={!jobData?.query}
            style={{
              padding: isMobile ? '8px 12px' : '8px 16px',
              background: '#3b82f6',
              border: '1px solid #2563eb',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: isMobile ? '12px' : '14px',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content'
            }}
          >
            {isMobile ? '🔄 Rerun' : '🔄 Rerun Query'}
          </button>
          {!isMobile && (
            <button
              onClick={copyJobId}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                border: '1px solid #555',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              📋 Copy Job ID
            </button>
          )}
        </div>

        {/* Feedback Section */}
        {jobData && jobData.status === 'completed' && (
          <div style={{
            padding: isMobile ? '8px 15px' : '15px 20px',
            borderBottom: '1px solid #333',
            flexShrink: 0
          }}>
            <FeedbackComponent 
              jobId={jobId}
              currentRating={currentRating}
              onRatingChange={handleRatingChange}
              style="compact"
            />
          </div>
        )}

        {loading && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#888'
          }}>
            <p>🐕 WebPuppy is fetching the job details...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px',
            margin: '20px',
            background: '#dc2626',
            borderRadius: '8px',
            color: 'white'
          }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={fetchJobData}
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
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && !error && (jobData || rawData) && (
          <>
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #333',
              padding: isMobile ? '0 15px' : '0 20px',
              flexShrink: 0,
              overflowX: isMobile ? 'auto' : 'visible',
              WebkitOverflowScrolling: 'touch'
            }}>
              <button
                onClick={() => setActiveTab('dataset')}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'dataset' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'dataset' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: isMobile ? '12px' : '14px',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
              >
                📊 Dataset {jobData?.total_records ? `(${jobData.total_records})` : ''}
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'raw' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'raw' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: isMobile ? '12px' : '14px',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
              >
                🔧 Raw Data
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                style={{
                  padding: isMobile ? '10px 16px' : '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'metadata' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'metadata' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: isMobile ? '12px' : '14px',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
              >
                📋 Metadata
              </button>
            </div>

            {/* Tab Content */}
            <div style={{
              padding: isMobile ? '15px' : '20px',
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              {/* Dataset Tab */}
              {activeTab === 'dataset' && jobData && (
                <div>
                  {jobData.dataset && jobData.dataset.length > 0 ? (
                    <div style={{
                      background: '#0a0a0a',
                      padding: isMobile ? '10px' : '15px',
                      borderRadius: '8px',
                      overflow: 'auto',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: isMobile ? '12px' : '14px',
                        minWidth: isMobile ? '600px' : 'auto'
                      }}>
                        <thead>
                          <tr style={{ background: '#1a1a1a' }}>
                            {Object.keys(jobData.dataset[0]).map((key) => (
                              <th key={key} style={{
                                border: '1px solid #333',
                                padding: isMobile ? '8px 6px' : '10px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: 'bold',
                                position: isMobile ? 'sticky' : 'static',
                                top: isMobile ? '0' : 'auto',
                                backgroundColor: '#1a1a1a',
                                zIndex: 1
                              }}>
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {jobData.dataset.map((row, index) => (
                            <tr key={index} style={{
                              background: index % 2 === 0 ? '#0a0a0a' : '#1a1a1a'
                            }}>
                              {Object.values(row).map((value, valueIndex) => (
                                <td key={valueIndex} style={{
                                  border: '1px solid #333',
                                  padding: isMobile ? '8px 6px' : '10px',
                                  color: '#ccc',
                                  maxWidth: isMobile ? '150px' : 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: isMobile ? 'nowrap' : 'normal'
                                }}>
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                      No dataset available
                    </p>
                  )}
                </div>
              )}

              {/* Raw Data Tab */}
              {activeTab === 'raw' && rawData && (
                <div>
                  <pre style={{
                    background: '#0a0a0a',
                    padding: '15px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '12px',
                    color: '#ccc',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {JSON.stringify(rawData.raw_data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Metadata Tab */}
              {activeTab === 'metadata' && jobData && (
                <div style={{ color: '#ccc' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '10px' }}>📋 Job Information</h4>
                    <p><strong>Query:</strong> {jobData.query}</p>
                    <p><strong>Status:</strong> {jobData.status}</p>
                    <p><strong>Total Records:</strong> {jobData.total_records}</p>
                    <p><strong>Quality Score:</strong> {jobData.quality_score}</p>
                    <p><strong>Validation Status:</strong> {jobData.validation_status}</p>
                    {jobData.validation_notes && (
                      <p><strong>Validation Notes:</strong> {jobData.validation_notes}</p>
                    )}
                  </div>

                  {jobData.sources && jobData.sources.length > 0 && (
                    <div>
                      <h4 style={{ color: '#fff', marginBottom: '10px' }}>🔍 Sources</h4>
                      <ul style={{ paddingLeft: '20px' }}>
                        {jobData.sources.map((source, index) => (
                          <li key={index} style={{ marginBottom: '5px' }}>
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rawData && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ color: '#fff', marginBottom: '10px' }}>📅 Timestamps</h4>
                      <p><strong>Created:</strong> {formatDate(rawData.created_at)}</p>
                      <p><strong>Updated:</strong> {formatDate(rawData.updated_at)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobDetailsModal;