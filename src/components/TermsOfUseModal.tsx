import React from 'react';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        border: '1px solid #333',
        color: 'white'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#fff' }}>
            📋 Webhound Usage Guidelines & Terms
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          <div>
            {/* Query Guidelines Section */}
            <section style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#60a5fa',
                marginBottom: '12px',
                borderBottom: '2px solid #333',
                paddingBottom: '8px'
              }}>
                📝 Query Guidelines
              </h3>
              <p style={{ marginBottom: '16px', color: '#ccc' }}>
                To ensure the best experience for all users, please follow these guidelines:
              </p>
              
              <h4 style={{ color: '#22c55e', margin: '16px 0 8px 0' }}>
                ✅ What's Allowed
              </h4>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc' }}>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Business & Professional Topics:</strong> Market research, industry analysis, company comparisons
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Technology & Science:</strong> Programming languages, software tools, scientific research
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Education & Learning:</strong> Academic topics, skill comparisons, educational resources
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Data & Statistics:</strong> Rankings, comparisons, trend analysis
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Research Topics:</strong> Factual information, objective analysis
                </li>
              </ul>

              <h4 style={{ color: '#dc2626', margin: '16px 0 8px 0' }}>
                ❌ What's Not Allowed
              </h4>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc' }}>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Inappropriate Content:</strong> NSFW, explicit, or adult content
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Violence & Harm:</strong> Weapons, illegal activities, harmful content
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>System Manipulation:</strong> Attempts to bypass or manipulate the AI system
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Spam & Abuse:</strong> Repetitive content, excessive characters, gibberish
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Suspicious Patterns:</strong> Code injection, URLs, technical exploits
                </li>
              </ul>
            </section>

            {/* Technical Requirements Section */}
            <section style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#60a5fa',
                marginBottom: '12px',
                borderBottom: '2px solid #333',
                paddingBottom: '8px'
              }}>
                🔒 Technical Requirements
              </h3>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc' }}>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Length:</strong> 3-1024 characters
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Language:</strong> Natural, clear language
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Content:</strong> Professional and appropriate
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Format:</strong> Questions or requests for information
                </li>
              </ul>
            </section>

            {/* Common Blocked Patterns Section */}
            <section style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#60a5fa',
                marginBottom: '12px',
                borderBottom: '2px solid #333',
                paddingBottom: '8px'
              }}>
                🚫 Common Blocked Patterns
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a'
                }}>
                  <h4 style={{
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    NSFW Content
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    Explicit, adult, or inappropriate content
                  </p>
                </div>
                
                <div style={{
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a'
                }}>
                  <h4 style={{
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    Prompt Injection
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    "Ignore previous instructions", "Act as...", "You are now..."
                  </p>
                </div>
                
                <div style={{
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a'
                }}>
                  <h4 style={{
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    System Commands
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    rm -rf, sudo, admin, technical commands
                  </p>
                </div>
                
                <div style={{
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a'
                }}>
                  <h4 style={{
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    Spam Patterns
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    Repeated characters, excessive punctuation, gibberish
                  </p>
                </div>
                
                <div style={{
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  backgroundColor: '#0a0a0a'
                }}>
                  <h4 style={{
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>
                    Suspicious Content
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    URLs, emails, binary patterns, excessive special characters
                  </p>
                </div>
              </div>
            </section>

            {/* Best Practices Section */}
            <section style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#60a5fa',
                marginBottom: '12px',
                borderBottom: '2px solid #333',
                paddingBottom: '8px'
              }}>
                💡 Best Practices
              </h3>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc' }}>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Be Specific:</strong> "Top 5 programming languages for web development in 2024"
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Use Natural Language:</strong> Ask questions as you would to a colleague
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Focus on Data:</strong> Request comparisons, rankings, or analysis
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  <strong>Keep it Professional:</strong> Business, educational, or research topics
                </li>
              </ul>
            </section>

            {/* Getting Help Section */}
            <section>
              <h3 style={{
                color: '#60a5fa',
                marginBottom: '12px',
                borderBottom: '2px solid #333',
                paddingBottom: '8px'
              }}>
                🆘 Getting Help
              </h3>
              <p style={{ marginBottom: '12px', color: '#ccc' }}>
                If your query is blocked and you believe it should be allowed:
              </p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc' }}>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  Review the guidelines above
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  Try rephrasing your question
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  Break complex queries into smaller parts
                </li>
                <li style={{ marginBottom: '6px', lineHeight: '1.5' }}>
                  Contact support if you need assistance
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            👍 I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseModal;