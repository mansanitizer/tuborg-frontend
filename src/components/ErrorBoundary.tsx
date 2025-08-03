import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🐕 WebPuppy Error Boundary caught an error:', error, errorInfo);
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #dc2626',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px 0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐕💥</div>
          <h2 style={{ 
            color: '#dc2626', 
            margin: '0 0 16px 0',
            fontSize: '20px'
          }}>
            Oops! WebPuppy encountered an error
          </h2>
          <p style={{ 
            color: '#ccc', 
            margin: '0 0 20px 0',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Something went wrong while loading this component. 
            This error has been logged and the WebPuppy team will investigate.
          </p>
          
          {this.state.error && (
            <details style={{
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '12px',
              margin: '16px 0',
              textAlign: 'left'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                color: '#888',
                fontSize: '12px',
                marginBottom: '8px'
              }}>
                Technical Details
              </summary>
              <pre style={{
                color: '#dc2626',
                fontSize: '11px',
                fontFamily: 'monospace',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.name}: {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;