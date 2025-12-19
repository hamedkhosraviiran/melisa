import { readFileSync } from 'fs';
import * as fs from 'fs';

interface IstanbulCoverage {
  [filePath: string]: {
    path: string;
    statementMap: Record<string, any>;
    fnMap: Record<string, any>;
    branchMap: Record<string, any>;
    s: Record<string, number>; 
    f: Record<string, number>; 
    b: Record<string, number[]>; 
  };
}

interface CoverageSummary {
  statements: { covered: number; total: number; pct: number };
  branches: { covered: number; total: number; pct: number };
  functions: { covered: number; total: number; pct: number };
  lines: { covered: number; total: number; pct: number };
}

export class CoverageParser {
  static parseJestCoverage(
    coveragePath: string = './coverage/coverage-final.json', 
    projectName: string, 
    branch: string, 
    commitHash: string, 
    duration: number
  ) {
    try {
      console.log(`Reading coverage file: ${coveragePath}`);
      const coverageData: IstanbulCoverage = JSON.parse(readFileSync(coveragePath, 'utf-8'));
      
      console.log('Calculating coverage totals...');
      const totals = this.calculateTotalCoverage(coverageData);
      const testResults = this.parseTestResults();

      console.log('Coverage data parsed successfully');
      return {
        projectName,
        branch,
        commitHash,
        duration,
        summary: {
          statements: totals.statements,
          branches: totals.branches,
          functions: totals.functions,
          lines: totals.lines,
          tests: testResults
        }
      };
    } catch (error) {
      console.error('Error parsing coverage file:', error);
      throw error;
    }
  }

  private static calculateTotalCoverage(coverageData: IstanbulCoverage) {
    let totalStatements = { covered: 0, total: 0 };
    let totalBranches = { covered: 0, total: 0 };
    let totalFunctions = { covered: 0, total: 0 };
    let totalLines = { covered: 0, total: 0 };

    Object.values(coverageData).forEach((fileCoverage) => {
      // Calculate statements coverage
      const statements = Object.values(fileCoverage.s);
      totalStatements.covered += statements.filter(hits => hits > 0).length;
      totalStatements.total += statements.length;

      // Calculate functions coverage
      const functions = Object.values(fileCoverage.f);
      totalFunctions.covered += functions.filter(hits => hits > 0).length;
      totalFunctions.total += functions.length;

      // Calculate branches coverage
      const branches = Object.values(fileCoverage.b);
      let branchCovered = 0;
      let branchTotal = 0;
      
      branches.forEach(branchHits => {
        branchTotal += branchHits.length;
        branchCovered += branchHits.filter(hits => hits > 0).length;
      });
      totalBranches.covered += branchCovered;
      totalBranches.total += branchTotal;
      totalLines.covered += statements.filter(hits => hits > 0).length;
      totalLines.total += statements.length;
    });

    return {
      statements: {
        pct: totalStatements.total > 0 ? (totalStatements.covered / totalStatements.total) * 100 : 0,
        covered: totalStatements.covered,
        total: totalStatements.total
      },
      branches: {
        pct: totalBranches.total > 0 ? (totalBranches.covered / totalBranches.total) * 100 : 0,
        covered: totalBranches.covered,
        total: totalBranches.total
      },
      functions: {
        pct: totalFunctions.total > 0 ? (totalFunctions.covered / totalFunctions.total) * 100 : 0,
        covered: totalFunctions.covered,
        total: totalFunctions.total
      },
      lines: {
        pct: totalLines.total > 0 ? (totalLines.covered / totalLines.total) * 100 : 0,
        covered: totalLines.covered,
        total: totalLines.total
      }
    };
  }

private static parseTestResults() {
  try {
    // Jest's json-summary reporter creates this file
    const summaryPath = './coverage/coverage-summary.json';

    if (fs.existsSync(summaryPath)) {
      console.log(`📊 Reading test results from: ${summaryPath}`);
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

      // The json-summary format has a 'total' object with test counts
      if (summary.total && summary.total.tests) {
        return {
          total: summary.total.tests.total || 0,
          passed: summary.total.tests.passed || 0,
          failed: summary.total.tests.failed || 0
        };
      }
    }

    const testResultsPath = './test-results.json';
    if (fs.existsSync(testResultsPath)) {
      console.log(`📊 Reading test results from: ${testResultsPath}`);
      const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));

      if (testResults.numTotalTests !== undefined) {
        return {
          total: testResults.numTotalTests || 0,
          passed: testResults.numPassedTests || 0,
          failed: testResults.numFailedTests || 0
        };
      }
    }

    console.warn('⚠️ No test results found. Run tests with coverage first.');
    return { total: 0, passed: 0, failed: 0 };

  } catch (error) {
    console.error('❌ Error parsing test results:', error);
    return { total: 0, passed: 0, failed: 0 };
  }
}
}