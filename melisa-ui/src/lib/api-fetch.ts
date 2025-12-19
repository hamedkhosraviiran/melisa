import type {
  CoverageResult,
  ProjectCoverageSummary,
  CoverageTrendPoint,
  CoverageRequest,
  CoverageSubmissionResponse,
  PaginationParams,
  DateRangeParams,
  CoverageTrendDTO
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    console.log(`Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Success:`, data);
    return data;

  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

export const coverageAPI = {
  submitCoverage: async (coverageData: CoverageRequest): Promise<CoverageSubmissionResponse> => {
    return fetchAPI('/api/coverage', {
      method: 'POST',
      body: JSON.stringify(coverageData),
    });
  },

  getAllProjectsCoverage: async (params?: PaginationParams): Promise<CoverageResult[]> => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchAPI(`/api/coverage/projects${queryString}`);
  },

  getProjectCoverage: async (
    projectName: string,
    params?: PaginationParams & DateRangeParams
  ): Promise<CoverageResult[]> => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return fetchAPI(`/api/coverage/project/${projectName}${queryString}`);
  },

  getProjectCoverageTrend: async (
    projectName: string,
    days: number = 30
  ): Promise<CoverageTrendPoint[]> => {
    try {
      const data = await fetchAPI<CoverageTrendDTO[]>(
        `/api/coverage/project/${projectName}/trend?days=${days}`
      );
      console.log(`Trend data for ${projectName}:`, data);
      return data.map(item => ({
        date: item.date,
        statements: item.avgStatements,
        branches: item.avgBranches,
        functions: item.avgFunctions,
        lines: item.avgLines,
      }));
    } catch (error) {
      console.error(`Error loading trend for ${projectName}:`, error);
      throw error;
    }
  },
  // Get projects summary
  getProjectsCoverageSummary: async (): Promise<ProjectCoverageSummary[]> => {
    return fetchAPI('/api/coverage/projects/summary');
  },

  // Get overall coverage summary
  getCoverageSummary: async (): Promise<ProjectCoverageSummary[]> => {
    return fetchAPI('/api/coverage/summary');
  },

  // Get latest coverage for project
  getLatestCoverage: async (projectName: string): Promise<CoverageResult> => {
    return fetchAPI(`/api/coverage/project/${projectName}/latest`);
  },

  // Delete coverage data
  deleteCoverage: async (id: number): Promise<{ message: string }> => {
    return fetchAPI(`/api/coverage/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk operations
  uploadBulkCoverage: async (
    data: CoverageRequest[]
  ): Promise<CoverageSubmissionResponse[]> => {
    return fetchAPI('/api/coverage/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// Utility functions
export const getCoverageStatus = (coverage: number): string => {
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