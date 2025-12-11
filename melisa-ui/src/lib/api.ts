import axios, { AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';
import type {
  CoverageResult,
  ProjectCoverageSummary,
  CoverageTrendPoint,
  CoverageRequest,
  CoverageSubmissionResponse,
  PaginationParams,
  DateRangeParams,
  CoverageStatus
} from '@/types';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
    withCredentials: false,
});

apiClient.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      url: config.baseURL + config.url,
      method: config.method?.toUpperCase(),
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// آپدیت interceptor response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      headers: response.headers,
      data: response.data
    });

    // بررسی CORS headers
    if (response.headers) {
      console.log('🔍 CORS Headers found:', {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-headers': response.headers['access-control-allow-headers'],
      });
    }

    return response.data; // فقط data برگردانیم
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      } : null,
    });

    if (error.response) {
      // اگر response داریم اما خطا است
      return Promise.reject(error);
    } else {
      // اگر شبکه مشکل دارد
      throw new Error(`Network Error: Cannot connect to ${error.config?.baseURL}. Make sure backend is running.`);
    }
  }
);

export const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

export const coverageAPI = {
  submitCoverage: async (
    coverageData: CoverageRequest
  ): Promise<CoverageSubmissionResponse> => {
    return apiClient.post('/api/coverage', coverageData);
  },

  getAllProjectsCoverage: async (
    params?: PaginationParams
  ): Promise<CoverageResult[]> => {
    return apiClient.get('/api/coverage/projects', { params });
  },

  getProjectCoverage: async (
    projectName: string,
    params?: PaginationParams & DateRangeParams
  ): Promise<CoverageResult[]> => {
    return apiClient.get(`/api/coverage/project/${projectName}`, { params });
  },

  getProjectCoverageTrend: async (
    projectName: string,
    days: number = 30
  ): Promise<CoverageTrendPoint[]> => {
    return apiClient.get(`/api/coverage/project/${projectName}/trend`, {
      params: { days }
    });
  },

  getProjectsCoverageSummary: async (): Promise<ProjectCoverageSummary[]> => {
    return apiClient.get('/api/coverage/projects/summary');
  },

  getCoverageSummary: async (): Promise<ProjectCoverageSummary[]> => {
    return apiClient.get('/api/coverage/summary');
  },

  getLatestCoverage: async (projectName: string): Promise<CoverageResult> => {
    return apiClient.get(`/api/coverage/project/${projectName}/latest`);
  },

  deleteCoverage: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/api/coverage/${id}`);
  },

  uploadBulkCoverage: async (
    data: CoverageRequest[]
  ): Promise<CoverageSubmissionResponse[]> => {
    return apiClient.post('/api/coverage/bulk', data);
  }
};

export const getCoverageStatus = (coverage: number): CoverageStatus => {
  if (coverage >= 80) return 'excellent';
  if (coverage >= 60) return 'good';
  if (coverage >= 40) return 'fair';
  return 'poor';
};

export const calculateAverageCoverage = (coverages: CoverageResult[]): number => {
  if (coverages.length === 0) return 0;

  const total = coverages.reduce((sum, coverage) => {
    return sum + (
      coverage.statementsCoverage +
      coverage.branchesCoverage +
      coverage.functionsCoverage +
      coverage.linesCoverage
    ) / 4;
  }, 0);

  return Number((total / coverages.length).toFixed(2));
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getCoverageColor = (coverage: number): string => {
  if (coverage >= 80) return '#10B981'; // green
  if (coverage >= 60) return '#F59E0B'; // yellow
  if (coverage >= 40) return '#F97316'; // orange
  return '#EF4444'; // red
};

export { apiClient };