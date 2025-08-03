import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { DatasetResult } from './api/webpuppy';
import { generateDataset, PreprocessingError } from './api/webpuppy';
import RecentQueries from './components/RecentQueries';
import CharacterCounter from './components/CharacterCounter';
import QueryValidator from './components/QueryValidator';
import TermsOfUseModal from './components/TermsOfUseModal';
import FeedbackComponent from './components/FeedbackComponent';
import RatingStats from './components/RatingStats';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer, { useToast } from './components/ToastContainer';
import { validateQuery, getBlockedQueryMessage, type ValidationResult } from './utils/queryValidation';

function AppContent() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DatasetResult | null>(null);
  const [error, setError] = useState('');
  const [jobId, setJobId] = useState('');
  const [healthStatus, setHealthStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [healthExpanded, setHealthExpanded] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [preprocessingError, setPreprocessingError] = useState<string | null>(null);
  const [blockedReasons, setBlockedReasons] = useState<string[]>([]);
  const [frontendValidation, setFrontendValidation] = useState<ValidationResult>({
    isValid: true,
    isBlocked: false,
    warnings: [],
    suggestions: [],
    blockedReasons: []
  });
  const [currentRating, setCurrentRating] = useState<string | undefined>();
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dogActivity, setDogActivity] = useState('running');
  const progressInterval = useRef<number | null>(null);
  const activityInterval = useRef<number | null>(null);

  const API_BASE = 'https://tuborg-backend-809679619810.europe-west1.run.app';

  const dogActivities = ['running', 'sniffing', 'licking', 'fetching', 'pooping'];

  const startProgressAnimation = useCallback(() => {
    setProgress(0);
    setDogActivity('running');
    
    // Progress bar animation - reaches 95% over 2 minutes
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const increment = 95 / (120 * 1000 / 100); // 95% over 2 minutes in 100ms increments
        return Math.min(prev + increment, 95);
      });
    }, 100);

    // Dog activity changes every 15-25 seconds
    const changeActivity = () => {
      setDogActivity(prev => {
        const currentIndex = dogActivities.indexOf(prev);
        const nextIndex = (currentIndex + 1) % dogActivities.length;
        return dogActivities[nextIndex];
      });
      
      // Random interval between 15-25 seconds
      const nextInterval = 15000 + Math.random() * 10000;
      activityInterval.current = setTimeout(changeActivity, nextInterval);
    };
    
    // Start first activity change after 15-25 seconds
    const initialInterval = 15000 + Math.random() * 10000;
    activityInterval.current = setTimeout(changeActivity, initialInterval);
  }, []);

  const stopProgressAnimation = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (activityInterval.current) {
      clearTimeout(activityInterval.current);
      activityInterval.current = null;
    }
    setProgress(0);
  }, []);

  // Health check function
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data.status === 'ok' ? 'online' : 'offline');
      } else {
        setHealthStatus('offline');
      }
    } catch {
      setHealthStatus('offline');
    }
  }, [API_BASE]);

  // Health polling effect
  useEffect(() => {
    // Initial health check
    checkHealth();
    
    // Set up polling every 60 seconds (1 minute)
    const healthInterval = setInterval(checkHealth, 60000);
    
    return () => clearInterval(healthInterval);
  }, []);

  // Cleanup progress animations on unmount
  useEffect(() => {
    return () => {
      stopProgressAnimation();
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) {
      setError('Please describe the dataset you need to generate.');
      return;
    }

    // Run frontend validation first
    const validation = validateQuery(query.trim());
    
    if (validation.isBlocked) {
      // Block submission for blocked queries
      const errorMessage = getBlockedQueryMessage(validation.blockedReasons);
      setPreprocessingError(errorMessage);
      setBlockedReasons(validation.blockedReasons);
      return;
    }

    if (!validation.isValid) {
      // Basic validation failed (too short, etc.)
      setError('Query validation failed. Please check the requirements above.');
      return;
    }
    
    setLoading(true);
    setError('');
    setPreprocessingError(null);
    setBlockedReasons([]);
    setResult(null);
    setCurrentRating(undefined);
    startProgressAnimation();
    
    try {
      // Use the new generateDataset function which handles preprocessing errors
      const data = await generateDataset(query.trim());
      setJobId(data.job_id);
      
      // Step 2: Start polling
      pollForResults(data.job_id);
      
    } catch (err) {
      if (err instanceof PreprocessingError) {
        // Handle preprocessing-specific errors from backend
        handlePreprocessingError(err);
      } else {
        setError(err instanceof Error ? `🐕 WebPuppy couldn't start the fetch: ${err.message}` : '🐕 WebPuppy is having trouble getting started!');
      }
      setLoading(false);
      stopProgressAnimation();
    }
  }, [query, frontendValidation, startProgressAnimation, stopProgressAnimation]);

  const handlePreprocessingError = (error: PreprocessingError) => {
    const { blocked_reasons, message } = error.data;
    setBlockedReasons(blocked_reasons);
    
    // Show specific error messages based on blocked reasons
    let userMessage = message;
    
    if (blocked_reasons.includes('too_short')) {
      userMessage = '🐕 WebPuppy needs more details! Your query is too short - try adding more context.';
    } else if (blocked_reasons.includes('too_long')) {
      userMessage = '🐕 WebPuppy is overwhelmed! Your query is too long - try breaking it into smaller questions.';
    } else if (blocked_reasons.includes('nsfw_content')) {
      userMessage = '🐕 WebPuppy detected inappropriate content! Keep queries professional and family-friendly.';
    } else if (blocked_reasons.includes('prompt_injection')) {
      userMessage = '🐕 WebPuppy detected unusual patterns! Ask your question directly without system commands.';
    } else if (blocked_reasons.includes('misuse_pattern')) {
      userMessage = '🐕 WebPuppy detected spam-like patterns! Use natural language without excessive repetition.';
    } else if (blocked_reasons.includes('suspicious_pattern')) {
      userMessage = '🐕 WebPuppy detected suspicious patterns! Use clear, natural language for your questions.';
    }
    
    setPreprocessingError(userMessage);
  };

  const handleValidationChange = useCallback((result: ValidationResult) => {
    setFrontendValidation(result);
  }, []);

  const handleRatingChange = useCallback((rating: string) => {
    setCurrentRating(rating);
    // Trigger stats refresh
    setStatsRefreshTrigger(prev => prev + 1);
  }, []);

  const pollForResults = async (id: string) => {
    const maxAttempts = 150; // 5 minutes at 2-second intervals
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/datasets/${id}/results`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: DatasetResult = await response.json();
        
        if (data.status === 'completed') {
          setResult(data);
          setLoading(false);
          stopProgressAnimation();
          showToast(`🎉 Successfully fetched ${data.total_records} records!`, 'success');
          return;
        }
        
        if (data.status === 'failed') {
          setError('Data fetching failed. The requested data could not be found or processed.');
          setLoading(false);
      stopProgressAnimation();
          return;
        }
        
        if (data.status === 'quota_exceeded') {
          setError('Daily usage limit reached. Please try again later or upgrade your plan.');
          setLoading(false);
      stopProgressAnimation();
          return;
        }
        
        // Still processing, continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setError('Request timed out. Please try again with a more specific query.');
          setLoading(false);
      stopProgressAnimation();
        }
        
      } catch (err) {
        setError(err instanceof Error ? `Generation failed: ${err.message}` : 'An unexpected error occurred. Please try again.');
        setLoading(false);
      stopProgressAnimation();
      }
    };
    
    poll();
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`${API_BASE}/api/datasets/${jobId}/download`, '_blank');
    }
  };

  const handleQuerySelect = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
    // Clear any existing results/errors when selecting a new query
    setResult(null);
    setError('');
    setPreprocessingError(null);
    setBlockedReasons([]);
    setJobId('');
    setCurrentRating(undefined);
  }, []);

  const healthInfo = useMemo(() => {
    switch (healthStatus) {
      case 'online':
        return { 
          icon: '🟢', 
          text: 'Backend Online', 
          color: '#22c55e',
          showText: healthExpanded || false // Only show text when expanded or always for other states
        };
      case 'offline':
        return { 
          icon: '🔴', 
          text: 'Backend Offline', 
          color: '#dc2626',
          showText: true // Always show for offline
        };
      case 'checking':
        return { 
          icon: '🟡', 
          text: 'Checking...', 
          color: '#fbbf24',
          showText: true // Always show for checking
        };
      default:
        return { 
          icon: '⚪', 
          text: 'Unknown', 
          color: '#6b7280',
          showText: true
        };
    }
  }, [healthStatus, healthExpanded]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050816', 
      color: 'white',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Health Status Indicator */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#1a1a1a',
        padding: healthInfo.showText ? '8px 12px' : '8px',
        borderRadius: healthInfo.showText ? '20px' : '50%',
        border: `2px solid ${healthInfo.color}`,
        display: 'flex',
        alignItems: 'center',
        gap: healthInfo.showText ? '8px' : '0',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 1000,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: healthInfo.showText ? 'auto' : '32px',
        minHeight: '32px',
        justifyContent: 'center'
      }}
      onClick={() => {
        if (healthStatus === 'online') {
          setHealthExpanded(!healthExpanded);
        } else {
          checkHealth();
        }
      }}
      title={healthStatus === 'online' ? 
        (healthExpanded ? "Click to contract" : "Click to expand") : 
        "Click to refresh health status"
      }
      >
        <span style={{ fontSize: '12px' }}>{healthInfo.icon}</span>
        {healthInfo.showText && (
          <span style={{ 
            color: healthInfo.color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}>
            {healthInfo.text}
          </span>
        )}
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <h1 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            margin: 0,
            fontSize: '28px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🐕 WebPuppy
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="https://iarm.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'none',
                border: '1px solid #333',
                color: '#60a5fa',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              🏠 Home
            </a>
            <button
              onClick={() => setShowTermsModal(true)}
              style={{
                background: 'none',
                border: '1px solid #333',
                color: '#60a5fa',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              📋 Guidelines
            </button>
          </div>
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#888', marginBottom: '20px' }}>
          Research collaboratively, rate and find datasets
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe the dataset you need (e.g., 'Top 10 programming languages by popularity in 2024' or 'Comparison of electric vehicle market share by country')"
            maxLength={1024}
            style={{
              width: '100%',
              height: '100px',
              padding: '15px',
              borderRadius: '8px',
              border: frontendValidation.isBlocked ? '2px solid #dc2626' : 
                      query.length > 1024 ? '2px solid #ef4444' : '1px solid #333',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginTop: '8px'
          }}>
            <CharacterCounter query={query} maxLength={1024} />
            <button
              onClick={() => setShowTermsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              Need help writing a good query?
            </button>
          </div>
          
          <QueryValidator query={query} onValidationChange={handleValidationChange} />
        </div>
        
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={handleSubmit}
            disabled={loading || !frontendValidation.isValid || frontendValidation.isBlocked}
            style={{
              padding: '12px 24px',
              backgroundColor: (loading || !frontendValidation.isValid || frontendValidation.isBlocked) ? '#666' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !frontendValidation.isValid || frontendValidation.isBlocked) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginRight: '10px'
            }}
            title={
              frontendValidation.isBlocked ? 'Query is blocked - see validation errors above' :
              !frontendValidation.isValid ? 'Query validation failed - see errors above' :
              loading ? 'Processing...' : 'Submit query'
            }
          >
            {loading ? '🔄 Fetching...' : '🚀 Fetch Data'}
          </button>
          
          {result && (
            <button 
              onClick={handleDownload}
              style={{
                padding: '12px 24px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              📋 Download CSV
            </button>
          )}
        </div>

        {error && (
          <div style={{
            background: '#dc2626',
            padding: '15px',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong>🐕 Woof! Something went wrong:</strong> {error}
            </div>
            
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '12px' }}>
              <strong>💡 What you can try:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {error.includes('fetch') || error.includes('network') || error.includes('connect') ? (
                  <>
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Wait a moment and try again</li>
                  </>
                ) : error.includes('timeout') || error.includes('timed out') ? (
                  <>
                    <li>Try a shorter, more specific query</li>
                    <li>Break down complex requests into smaller parts</li>
                    <li>Check if the data you're looking for exists online</li>
                  </>
                ) : error.includes('quota') || error.includes('limit') ? (
                  <>
                    <li>Wait a moment before trying again</li>
                    <li>Try a different query</li>
                    <li>Come back later when usage is lower</li>
                  </>
                ) : (
                  <>
                    <li>Try rephrasing your query</li>
                    <li>Make sure your request is clear and specific</li>
                    <li>Check the guidelines for query tips</li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setError('');
                  setResult(null);
                }}
                style={{
                  background: '#ffffff20',
                  color: 'white',
                  border: '1px solid #ffffff40',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕ Dismiss
              </button>
              {(error.includes('fetch') || error.includes('network')) && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: '#ffffff20',
                    color: 'white',
                    border: '1px solid #ffffff40',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔄 Refresh Page
                </button>
              )}
              <button
                onClick={() => setShowTermsModal(true)}
                style={{
                  background: '#ffffff20',
                  color: 'white',
                  border: '1px solid #ffffff40',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 View Guidelines
              </button>
            </div>
          </div>
        )}

        {preprocessingError && (
          <div style={{
            background: '#f59e0b',
            padding: '15px',
            borderRadius: '8px',
            margin: '20px 0',
            color: '#000'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>🚫 Query Blocked:</strong> {preprocessingError}
            </div>
            
            {blockedReasons.length > 0 && (
              <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                <strong>Blocked for:</strong> {blockedReasons.join(', ')}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => setShowTermsModal(true)}
                style={{
                  background: '#1a1a1a',
                  color: 'white',
                  border: '1px solid #333',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 View Guidelines
              </button>
              <button
                onClick={() => {
                  setPreprocessingError(null);
                  setBlockedReasons([]);
                }}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕ Dismiss
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '15px' 
            }}>
              <span style={{ fontSize: '20px' }}>🐕</span>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                WebPuppy is {dogActivity}...
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#60a5fa',
                borderRadius: '4px',
                transition: 'width 0.1s ease-out'
              }} />
            </div>
            
            <p>🔄 Fetching your data... This may take a few minutes.</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Our AI is researching, extracting, and validating data for you.</p>
            {jobId && <p><small>🏷️ Job ID: {jobId}</small></p>}
          </div>
        )}

        {result && (
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h3>📊 Fetched Dataset</h3>
            <p><strong>Query:</strong> {result.query}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Total Records:</strong> {result.total_records}</p>

            {result.sources && result.sources.length > 0 && (
              <div style={{ margin: '15px 0' }}>
                <h4>🔍 Data Sources</h4>
                <ul>
                  {result.sources.map((source, i) => (
                    <li key={i}><a href={source} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>{source}</a></li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ margin: '15px 0' }}>
              <h4>📋 Dataset Preview</h4>
              {result.dataset && result.dataset.length > 0 ? (
                <div style={{ 
                  background: '#0a0a0a', 
                  padding: '15px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                    minWidth: window.innerWidth <= 768 ? '600px' : 'auto'
                  }}>
                    <thead>
                      <tr style={{ background: '#1a1a1a' }}>
                        {Object.keys(result.dataset[0]).map((key) => (
                          <th key={key} style={{
                            border: '1px solid #333',
                            padding: window.innerWidth <= 768 ? '8px 6px' : '10px',
                            textAlign: 'left',
                            color: '#fff',
                            fontWeight: 'bold',
                            position: window.innerWidth <= 768 ? 'sticky' : 'static',
                            top: window.innerWidth <= 768 ? '0' : 'auto',
                            backgroundColor: '#1a1a1a',
                            zIndex: 1,
                            whiteSpace: 'nowrap'
                          }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.dataset.map((row, index) => (
                        <tr key={index} style={{
                          background: index % 2 === 0 ? '#0a0a0a' : '#1a1a1a'
                        }}>
                          {Object.values(row).map((value, valueIndex) => (
                            <td key={valueIndex} style={{
                              border: '1px solid #333',
                              padding: window.innerWidth <= 768 ? '8px 6px' : '10px',
                              color: '#ccc',
                              maxWidth: window.innerWidth <= 768 ? '150px' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: window.innerWidth <= 768 ? 'nowrap' : 'normal'
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
                <p style={{ color: '#666' }}>No dataset available</p>
              )}
              
              {/* Show raw JSON as fallback */}
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#60a5fa' }}>
                  Show Raw JSON
                </summary>
                <pre style={{ 
                  background: '#0a0a0a', 
                  padding: '15px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  maxHeight: '300px',
                  marginTop: '10px'
                }}>
                  {JSON.stringify(result.dataset, null, 2)}
                </pre>
              </details>
            </div>
            
            {/* Feedback Section */}
            <FeedbackComponent 
              jobId={jobId}
              currentRating={currentRating}
              onRatingChange={handleRatingChange}
            />
          </div>
        )}

        {/* Rating Statistics Section */}
        <ErrorBoundary fallback={
          <div style={{
            padding: '12px',
            textAlign: 'center',
            color: '#888',
            fontSize: '12px',
            border: '1px solid #333',
            borderRadius: '6px',
            margin: '10px 0'
          }}>
            📊 Statistics temporarily unavailable
          </div>
        }>
          <RatingStats refreshTrigger={statsRefreshTrigger} style="compact" />
        </ErrorBoundary>

        {/* Recent Queries Section */}
        <ErrorBoundary fallback={
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0',
            textAlign: 'center',
            color: '#888'
          }}>
            🐕 Recent queries temporarily unavailable
          </div>
        }>
          <RecentQueries onQuerySelect={handleQuerySelect} />
        </ErrorBoundary>
      </div>

      {/* Terms of Use Modal */}
      <TermsOfUseModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <ToastContainer>
      <AppContent />
    </ToastContainer>
  );
}

export default App;