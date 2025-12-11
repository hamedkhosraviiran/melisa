export interface CoverageMetric {
  pct: number;
  covered: number;
  total: number;
}

export interface CoverageSummary {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}

export interface JestCoverage {
  [filePath: string]: CoverageSummary;
}

export interface CoverageRequest {
  projectName: string;
  branch: string;
  commitHash: string;
  duration: number;
  summary: {
    statements: CoverageMetric;
    branches: CoverageMetric;
    functions: CoverageMetric;
    lines: CoverageMetric;
    tests: {
      total: number;
      passed: number;
      failed: number;
    };
  };
}

//export {};