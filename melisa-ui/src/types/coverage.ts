export interface CoverageResult {
  id: number;
  projectName: string;
  branch: string;
  commitHash: string;
  statementsCoverage: number;
  branchesCoverage: number;
  functionsCoverage: number;
  linesCoverage: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectCoverageSummary {
  projectName: string;
  avgStatements: number;
  avgBranches: number;
  avgFunctions: number;
  avgLines: number;
  lastUpdated: string;
  totalRuns: number;
  lastCommit?: string;
}

export interface CoverageTrendPoint {
  date: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageTrendDTO {
  date: string;
  avgStatements: number;
  avgBranches: number;
  avgFunctions: number;
  avgLines: number;
}

export const mapTrendDTOToPoint = (dto: CoverageTrendDTO): CoverageTrendPoint => ({
  date: dto.date,
  statements: dto.avgStatements,
  branches: dto.avgBranches,
  functions: dto.avgFunctions,
  lines: dto.avgLines,
});

export interface CoverageRequest {
  projectName: string;
  branch: string;
  commitHash: string;
  duration: number;
  summary: CoverageTestSummary;
  metadata?: Record<string, any>;
}

export interface CoverageTestSummary {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
  tests: CoverageTestStats;
}

export interface CoverageMetric {
  pct: number;
  covered: number;
  total: number;
}

export interface CoverageTestStats {
  total: number;
  passed: number;
  failed: number;
  skipped?: number;
}

export interface CoverageSubmissionResponse {
  message: string;
  id: number;
  project: string;
  timestamp?: string;
}

export interface CoverageFilter {
  projectName?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
  minCoverage?: number;
}

export enum CoverageType {
  STATEMENTS = 'statements',
  BRANCHES = 'branches',
  FUNCTIONS = 'functions',
  LINES = 'lines'
}

export enum CoverageStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}