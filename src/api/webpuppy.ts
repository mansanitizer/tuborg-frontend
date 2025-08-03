// src/api/webpuppy.ts
// Prettier printWidth: 80

export type JobStatus = 'processing' | 'completed' | 'failed' | 'quota_exceeded';

export interface DatasetResult {
  job_id: string;
  status: JobStatus;
  query: string;
  dataset: Record<string, unknown>[];
  sources: string[];
  total_records: number;
  validation_status: string;
  quality_score: string;
  validation_notes?: string;
}

export interface RecentQuery {
  job_id?: string; // Optional since backend might not include it
  query: string;
  created_at: string;
  status: string;
  user_rating?: string; // New field for feedback system
}

export interface UniqueRecentQuery {
  query: string;
  last_asked: string;
  times_asked: number;
}

export interface RecentQueriesResponse {
  recent_queries: RecentQuery[];
  unique_queries: UniqueRecentQuery[];
}

export interface RawDataResponse {
  job_id: string;
  query: string;
  status: string;
  raw_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RatingRequest {
  rating: 'good_dog' | 'bad_dog';
}

export interface RatingResponse {
  job_id: string;
  rating: string;
  success: boolean;
  message: string;
}

export interface RatingStats {
  total_rated: number;
  good_dogs: number;
  bad_dogs: number;
  good_percentage: number;
  bad_percentage: number;
}

export interface PreprocessingErrorData {
  error: string;
  message: string;
  blocked_reasons: string[];
  query_length: number;
}

export class PreprocessingError extends Error {
  public data: PreprocessingErrorData;
  
  constructor(data: PreprocessingErrorData) {
    super(data.message);
    this.name = 'PreprocessingError';
    this.data = data;
  }
}

const BASE_URL = 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 429) {
    const retryAfter = res.headers.get('retry-after') ?? '60';
    throw new Error(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Bubble up helpful backend message if present
    throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function health(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/api/health`);
  return handleResponse(res);
}

export async function generateDataset(
  query: string
): Promise<{ job_id: string; status: JobStatus }> {
  const res = await fetch(`${BASE_URL}/api/datasets/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  if (!res.ok) {
    if (res.status === 400) {
      // Handle preprocessing errors
      const errorData: PreprocessingErrorData = await res.json();
      throw new PreprocessingError(errorData);
    }
    // Let handleResponse deal with other errors
    return handleResponse(res);
  }
  
  return handleResponse(res);
}

export async function getResults(jobId: string): Promise<DatasetResult> {
  const res = await fetch(`${BASE_URL}/api/datasets/${jobId}/results`);
  return handleResponse(res);
}

export async function getRecentQueries(limit = 10): Promise<RecentQueriesResponse> {
  const res = await fetch(`${BASE_URL}/api/queries/recent?limit=${limit}`);
  return handleResponse(res);
}

export async function getRawData(jobId: string): Promise<RawDataResponse> {
  const res = await fetch(`${BASE_URL}/api/datasets/${jobId}/raw`);
  return handleResponse(res);
}

export async function getJobResults(jobId: string): Promise<DatasetResult> {
  const res = await fetch(`${BASE_URL}/api/datasets/${jobId}/results`);
  return handleResponse(res);
}

export function downloadCSV(jobId: string): void {
  // Simple open-in-new-tab download
  window.open(`${BASE_URL}/api/datasets/${jobId}/download`, '_blank');
}

// Feedback system API functions
export async function rateJob(jobId: string, rating: 'good_dog' | 'bad_dog'): Promise<RatingResponse> {
  const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  return handleResponse(res);
}

export async function getRatingStats(): Promise<RatingStats> {
  const res = await fetch(`${BASE_URL}/api/jobs/rating-stats`);
  return handleResponse(res);
}