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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>
              🐕 Job Details
            </h2>
            {jobData && (
              <>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '16px', 
                  color: '#e0e0e0',
                  fontWeight: '500'
                }}>
                  "{jobData.query}"
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  fontSize: '12px', 
                  color: '#888'
                }}>
                  <span>Job ID: {jobId}</span>
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
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              marginLeft: '20px'
            }}
          >
            ×
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => downloadCSV(jobId)}
            disabled={!jobData || jobData.status !== 'completed'}
            style={{
              padding: '8px 16px',
              background: jobData?.status === 'completed' ? '#22c55e' : '#333',
              border: '1px solid #555',
              borderRadius: '6px',
              color: 'white',
              cursor: jobData?.status === 'completed' ? 'pointer' : 'not-allowed',
              fontSize: '14px'
            }}
          >
            📋 Download CSV
          </button>
          <button
            onClick={handleRerun}
            disabled={!jobData?.query}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              border: '1px solid #2563eb',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Rerun Query
          </button>
          <button
            onClick={copyJobId}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              border: '1px solid #555',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📋 Copy Job ID
          </button>
        </div>

        {/* Feedback Section */}
        {jobData && jobData.status === 'completed' && (
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #333'
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
              padding: '0 20px'
            }}>
              <button
                onClick={() => setActiveTab('dataset')}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'dataset' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'dataset' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: '14px'
                }}
              >
                📊 Dataset {jobData?.total_records ? `(${jobData.total_records})` : ''}
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'raw' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'raw' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: '14px'
                }}
              >
                🔧 Raw Data
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                style={{
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'metadata' ? '#60a5fa' : '#888',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'metadata' ? '2px solid #60a5fa' : '2px solid transparent',
                  fontSize: '14px'
                }}
              >
                📋 Metadata
              </button>
            </div>

            {/* Tab Content */}
            <div style={{
              padding: '20px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              {/* Dataset Tab */}
              {activeTab === 'dataset' && jobData && (
                <div>
                  {jobData.dataset && jobData.dataset.length > 0 ? (
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '8px',
                      overflow: 'auto'
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr style={{ background: '#1a1a1a' }}>
                            {Object.keys(jobData.dataset[0]).map((key) => (
                              <th key={key} style={{
                                border: '1px solid #333',
                                padding: '10px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: 'bold'
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
                                  padding: '10px',
                                  color: '#ccc'
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