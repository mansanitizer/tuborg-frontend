// src/components/WebPuppyQuery.tsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  downloadCSV,
  generateDataset,
  getResults,
  health,
  type DatasetResult,
} from '../api/webpuppy';

const POLL_MS = 2000;
const MAX_POLL_MS = 5 * 60 * 1000; // 5 minutes

const WebPuppyQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<DatasetResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollTimer = useRef<number | null>(null);
  const timeoutTimer = useRef<number | null>(null);

  // Health check on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const h = await health();
        if (mounted && h.status !== 'ok') {
          setError('Backend health check failed');
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Backend is not reachable'
        );
      } finally {
        setCheckingHealth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    if (timeoutTimer.current) {
      clearTimeout(timeoutTimer.current);
      timeoutTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const startPolling = useCallback((id: string) => {
    // Clear any prior timers
    clearTimers();

    pollTimer.current = window.setInterval(async () => {
      try {
        const data = await getResults(id);

        if (data.status === 'completed') {
          setResult(data);
          setLoading(false);
          clearTimers();
        } else if (data.status === 'failed') {
          setError(data.validation_notes || 'Processing failed');
          setLoading(false);
          clearTimers();
        } else if (data.status === 'quota_exceeded') {
          setError(data.validation_notes || 'API quota exceeded. Please try again later or upgrade your plan.');
          setLoading(false);
          clearTimers();
        }
        // If processing, keep polling
      } catch {
        setError('Failed to fetch results');
        setLoading(false);
        clearTimers();
      }
    }, POLL_MS);

    // Hard timeout
    timeoutTimer.current = window.setTimeout(() => {
      setError('Request timed out');
      setLoading(false);
      clearTimers();
    }, MAX_POLL_MS);
  }, [clearTimers]);

  const submit = useCallback(async () => {
    setError(null);
    setResult(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Query cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const resp = await generateDataset(trimmed);
      setJobId(resp.job_id);
      startPolling(resp.job_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit query');
      setLoading(false);
    }
  }, [query, startPolling]);

  const canDownload = useMemo(
    () => !!jobId && result?.status === 'completed',
    [jobId, result?.status]
  );

  return (
    <div
      style={{
        maxWidth: 920,
        margin: '2rem auto',
        padding: '1.25rem',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, " +
          "Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', " +
          'sans-serif',
        color: '#eaeef2',
        background: '#0b1220',
        borderRadius: 12,
        border: '1px solid #243b55',
      }}
    >
      <h2 style={{ marginTop: 0 }}>Webhound Data Fetcher</h2>

      {checkingHealth ? (
        <p>Checking backend health...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query (e.g., 'What are the top 3 programming languages in 2024?')"
              rows={3}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #243b55',
                background: '#0f1629',
                color: '#eaeef2',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #3b82f6',
                  background: loading ? '#1e3a8a' : '#2563eb',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Fetching...' : 'Fetch Data'}
              </button>

              <button
                onClick={() => {
                  setQuery('');
                  setResult(null);
                  setError(null);
                  setJobId(null);
                  clearTimers();
                  setLoading(false);
                }}
                disabled={loading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Reset
              </button>

              <button
                onClick={() => jobId && downloadCSV(jobId)}
                disabled={!canDownload}
                style={{
                  marginLeft: 'auto',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #16a34a',
                  background: canDownload ? '#22c55e' : '#155e2f',
                  color: 'white',
                  cursor: canDownload ? 'pointer' : 'not-allowed',
                }}
              >
                Download CSV
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: '#3f1d1d',
                border: '1px solid #7f1d1d',
                marginBottom: 12,
              }}
            >
              <strong style={{ color: '#fecaca' }}>Error: </strong>
              <span style={{ color: '#ffe4e6' }}>{error}</span>
            </div>
          )}

          {loading && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid #1f2a44',
                marginBottom: 12,
              }}
            >
              <p style={{ margin: '4px 0' }}>
                Fetching your data... This may take a few minutes.
              </p>
              <p style={{ margin: '4px 0', opacity: 0.8 }}>Job ID: {jobId}</p>
            </div>
          )}

          {result && (
            <div
              style={{
                display: 'grid',
                gap: 16,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid #1f2a44',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Results</h3>
                <p>
                  <strong>Query:</strong> {result.query}
                </p>
                <p>
                  <strong>Total Records:</strong> {result.total_records}
                </p>
                <p>
                  <strong>Quality Score:</strong> {result.quality_score}
                </p>
                <p>
                  <strong>Validation Status:</strong>{' '}
                  {result.validation_status}
                </p>
                {result.validation_notes && (
                  <p>
                    <strong>Notes:</strong> {result.validation_notes}
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid #1f2a44',
                }}
              >
                <h4 style={{ marginTop: 0 }}>Sources</h4>
                {result.sources?.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {result.sources.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ opacity: 0.8 }}>No sources listed.</p>
                )}
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: '#0f172a',
                  border: '1px solid #1f2a44',
                }}
              >
                <h4 style={{ marginTop: 0 }}>Dataset</h4>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(result.dataset, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WebPuppyQuery;