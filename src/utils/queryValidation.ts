// Frontend query validation utilities

export interface ValidationResult {
  isValid: boolean;
  isBlocked: boolean;
  warnings: string[];
  suggestions: string[];
  blockedReasons: string[];
}

// NSFW and inappropriate content patterns
const NSFW_PATTERNS = [
  // Adult content
  /\b(sex|porn|nude|naked|xxx|adult|erotic|horny|sexy)\b/gi,
  /\b(penis|vagina|dick|cock|pussy|tits|boobs|ass|anal)\b/gi,
  /\b(orgasm|masturbat|ejaculat|climax|arousal)\b/gi,
  /\b(prostitut|escort|hookup|bang|fuck|shit|damn)\b/gi,
  
  // Violence and weapons
  /\b(kill|murder|violence|weapon|gun|bomb|terror|attack)\b/gi,
  /\b(suicide|death|harm|hurt|pain|torture|abuse)\b/gi,
  
  // Drugs and illegal activities
  /\b(drug|cocaine|heroin|meth|weed|marijuana|illegal)\b/gi,
  /\b(hack|crack|pirat|steal|fraud|scam)\b/gi
];

// Prompt injection patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior)\s+instruct/gi,
  /forget\s+(everything|all|previous|above)/gi,
  /act\s+as\s+(a\s+)?(different|new|other)/gi,
  /you\s+are\s+now\s+(a\s+)?/gi,
  /pretend\s+to\s+be/gi,
  /role\s*play\s+as/gi,
  /simulate\s+(being|that)/gi,
  /override\s+(your|the)\s+(settings|instructions)/gi,
  /system\s+(prompt|message|instruction)/gi,
  /developer\s+mode/gi,
  /jailbreak/gi,
  /bypass\s+(safety|filter|restriction)/gi
];

// System command patterns
const SYSTEM_COMMAND_PATTERNS = [
  /\b(sudo|rm\s+-rf|chmod|mkdir|cp\s+|mv\s+)\b/gi,
  /\b(exec|eval|system|shell|cmd|bash)\b/gi,
  /\b(admin|administrator|root|privilege)/gi,
  /\b(password|secret|key|token|auth)/gi,
  /<script|javascript:|<iframe|<embed/gi,
  /\$\{|\$\(|`.*`|\|\||&&/g
];

// Spam and misuse patterns
const SPAM_PATTERNS = [
  /(.)\1{10,}/g, // Repeated characters (10+ times)
  /[!?]{5,}/g, // Excessive punctuation
  /\b(test|hello|hi|hey)\b\s*$/gi, // Simple test queries
  /^\s*[a-z]\s*$/gi, // Single letters
  /[A-Z]{10,}/g, // Excessive caps
  /\d{10,}/g // Long number sequences
];

// Suspicious patterns (URLs, emails, etc.)
const SUSPICIOUS_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // URLs
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
  /\b[0-9a-f]{32,}\b/gi, // Hash-like patterns
  /[{}[\]<>]/g, // Suspicious brackets
  /\\\w+/g // Escape sequences
];

export function validateQuery(query: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    isBlocked: false,
    warnings: [],
    suggestions: [],
    blockedReasons: []
  };

  if (!query || query.trim().length === 0) {
    return result;
  }

  const trimmedQuery = query.trim();

  // Check length constraints
  if (trimmedQuery.length < 3) {
    result.isValid = false;
    result.warnings.push('Query is too short');
    result.suggestions.push('Please provide at least 3 characters');
    return result;
  }

  if (trimmedQuery.length > 1024) {
    result.isValid = false;
    result.isBlocked = true;
    result.blockedReasons.push('too_long');
    result.warnings.push('Query exceeds maximum length');
    result.suggestions.push('Please keep your query under 1024 characters');
    return result;
  }

  // Check for NSFW content - BLOCKING
  for (const pattern of NSFW_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      result.isValid = false;
      result.isBlocked = true;
      result.blockedReasons.push('nsfw_content');
      result.warnings.push('Inappropriate content detected');
      result.suggestions.push('Keep queries professional and family-friendly');
      return result;
    }
  }

  // Check for prompt injection - BLOCKING
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      result.isValid = false;
      result.isBlocked = true;
      result.blockedReasons.push('prompt_injection');
      result.warnings.push('System manipulation attempt detected');
      result.suggestions.push('Ask your question directly without system commands');
      return result;
    }
  }

  // Check for system commands - BLOCKING
  for (const pattern of SYSTEM_COMMAND_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      result.isValid = false;
      result.isBlocked = true;
      result.blockedReasons.push('system_command');
      result.warnings.push('System commands are not allowed');
      result.suggestions.push('Use natural language to ask your question');
      return result;
    }
  }

  // Check for spam patterns - BLOCKING
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      result.isValid = false;
      result.isBlocked = true;
      result.blockedReasons.push('spam_pattern');
      result.warnings.push('Spam-like pattern detected');
      result.suggestions.push('Use natural language without excessive repetition');
      return result;
    }
  }

  // Check for suspicious patterns - BLOCKING
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      result.isValid = false;
      result.isBlocked = true;
      result.blockedReasons.push('suspicious_pattern');
      result.warnings.push('Suspicious patterns detected');
      result.suggestions.push('Use clear, natural language for your questions');
      return result;
    }
  }

  // Non-blocking warnings for quality
  if (trimmedQuery.length < 10) {
    result.warnings.push('Query is quite short');
    result.suggestions.push('Consider adding more context for better results');
  }

  if (trimmedQuery.length > 800) {
    result.warnings.push('Query is getting long');
    result.suggestions.push('Consider breaking into smaller, focused questions');
  }

  // Check for very generic patterns
  const genericPatterns = [
    /^(what is|how to|tell me|explain|help|info|list|show|give)$/gi,
    /^(hi|hello|hey|test|testing)$/gi
  ];
  
  if (genericPatterns.some(pattern => pattern.test(trimmedQuery))) {
    result.warnings.push('Query is very generic');
    result.suggestions.push('Be more specific about what you want to know');
  }

  return result;
}

export function getBlockedQueryMessage(blockedReasons: string[]): string {
  if (blockedReasons.includes('nsfw_content')) {
    return 'Inappropriate content detected. Please keep queries professional and family-friendly.';
  }
  if (blockedReasons.includes('prompt_injection')) {
    return 'System manipulation detected. Please ask your question directly using natural language.';
  }
  if (blockedReasons.includes('system_command')) {
    return 'System commands detected. Please use natural language to describe your dataset needs.';
  }
  if (blockedReasons.includes('spam_pattern')) {
    return 'Spam patterns detected. Please use clear, natural language without excessive repetition.';
  }
  if (blockedReasons.includes('suspicious_pattern')) {
    return 'Suspicious patterns detected. Please use simple, clear language to describe your dataset needs.';
  }
  if (blockedReasons.includes('too_long')) {
    return 'Query is too long. Please keep your request under 1024 characters.';
  }
  return 'Query validation failed. Please try rephrasing your request.';
}