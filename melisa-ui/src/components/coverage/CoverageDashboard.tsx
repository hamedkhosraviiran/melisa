'use client';

import { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

import type {
  CoverageResult,
  ProjectCoverageSummary,
  CoverageTrendPoint,
  CoverageStatus,
  CoverageType
} from '@/types';

import { coverageAPI, getCoverageStatus, calculateAverageCoverage } from '../../lib/api-fetch';

const TIME_RANGE_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' }
] as const;

const COVERAGE_COLORS = {
  statements: '#0088FE',
  branches: '#00C49F',
  functions: '#FFBB28',
  lines: '#FF8042'
} as const;

// کامپوننت wrapper برای ResponsiveContainer
const ChartContainer = ({ children, height = 300 }: {
  children: React.ReactNode;
  height?: number;
}) => (
  <div style={{ width: '100%', height, minHeight: height, position: 'relative' }}>
    <ResponsiveContainer width="100%" height="100%" debounce={1}>
      {children}
    </ResponsiveContainer>
  </div>
);

export function CoverageDashboard() {
  const [projects, setProjects] = useState<CoverageResult[]>([]);
  const [projectSummaries, setProjectSummaries] = useState<ProjectCoverageSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [trendData, setTrendData] = useState<CoverageTrendPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [chartKey, setChartKey] = useState<number>(0); // برای force re-render charts

  const [isPending, startTransition] = useTransition();

  // Debug: log trend data
  useEffect(() => {
    console.log('📊 Trend Data:', trendData);
    console.log('📊 Trend Data length:', trendData.length);
    console.log('📊 Trend Data sample:', trendData[0]);
  }, [trendData]);

  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [trendData, selectedProject, timeRange]);

  const latestCoverage = useMemo(() =>
    selectedProject ? projects.find(p => p.projectName === selectedProject) : null,
    [selectedProject, projects]
  );

  const selectedProjectSummary = useMemo(() =>
    projectSummaries.find(p => p.projectName === selectedProject),
    [selectedProject, projectSummaries]
  );

  const loadProjectSummaries = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Loading project summaries...');
      const data = await coverageAPI.getProjectsCoverageSummary();
      console.log('📊 Project summaries loaded:', data);

      startTransition(() => {
        setProjectSummaries(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].projectName);
        }
        setLoading(false);
      });
    } catch (err) {
      startTransition(() => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load project summaries';
        setError(errorMessage);
        setLoading(false);
      });
      console.error('❌ Error loading project summaries:', err);
    }
  }, [selectedProject, startTransition]);

  const loadProjectDetails = useCallback(async (projectName: string) => {
    try {
      console.log(`🔄 Loading details for project: ${projectName}`);
      const data = await coverageAPI.getProjectCoverage(projectName);
      console.log(`📊 Project details loaded for ${projectName}:`, data);
      startTransition(() => {
        setProjects(data);
      });
    } catch (err) {
      console.error(`❌ Error loading project details for ${projectName}:`, err);
    }
  }, [startTransition]);

  const loadTrendData = useCallback(async (projectName: string, days: number) => {
    try {
      console.log(`🔄 Loading trend for project: ${projectName}, days: ${days}`);
      const data = await coverageAPI.getProjectCoverageTrend(projectName, days);
      console.log(`📊 Trend data loaded for ${projectName}:`, data);
      startTransition(() => {
        setTrendData(data || []);
      });
    } catch (err) {
      console.error(`❌ Error loading trend data for ${projectName}:`, err);
      startTransition(() => {
        setTrendData([]);
      });
    }
  }, [startTransition]);

  useEffect(() => {
    loadProjectSummaries();
  }, [loadProjectSummaries]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectDetails(selectedProject);
      loadTrendData(selectedProject, timeRange);
    }
  }, [selectedProject, timeRange, loadProjectDetails, loadTrendData]);

  // Helper functions
  const getProjectHealthColor = useCallback((coverage: number): string => {
    const status = getCoverageStatus(coverage);
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-yellow-600 bg-yellow-50';
      case 'fair': return 'text-orange-600 bg-orange-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }, []);

  const getProjectHealthClass = useCallback((coverage: number): string => {
    const status = getCoverageStatus(coverage);
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'fair': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${value.toFixed(1)}%`;
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  }, []);

  // Event handlers
  const handleTimeRangeChange = useCallback((newTimeRange: number) => {
    startTransition(() => {
      setTimeRange(newTimeRange);
    });
  }, [startTransition]);

  const handleProjectChange = useCallback((projectName: string) => {
    startTransition(() => {
      setSelectedProject(projectName);
    });
  }, [startTransition]);

  // Loading state
  if (loading && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Loading coverage data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-600 text-4xl">⚠️</div>
        <p className="text-red-600 font-semibold">Error loading data</p>
        <p className="text-gray-600 text-sm">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            loadProjectSummaries();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (projectSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-400 text-4xl">📊</div>
        <p className="text-gray-600 font-semibold">No coverage data available</p>
        <p className="text-gray-500 text-sm">Submit your first coverage report to get started</p>
      </div>
    );
  }

  // Prepare chart data
  const testResultsData = latestCoverage ? [
    { name: 'Passed', value: latestCoverage.passedTests, color: '#10B981' },
    { name: 'Failed', value: latestCoverage.failedTests, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const coverageBreakdownData = latestCoverage ? [
    { type: 'Statements', coverage: latestCoverage.statementsCoverage },
    { type: 'Branches', coverage: latestCoverage.branchesCoverage },
    { type: 'Functions', coverage: latestCoverage.functionsCoverage },
    { type: 'Lines', coverage: latestCoverage.linesCoverage }
  ] : [];

  // Check if we have trend data
  const hasTrendData = trendData && trendData.length > 0;
  console.log('✅ Has trend data?', hasTrendData, 'Count:', trendData?.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Test Coverage Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and analyze test coverage across all your projects
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                disabled={isPending}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {TIME_RANGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Project:</span>
              <select
                value={selectedProject}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={isPending}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[200px]"
              >
                {projectSummaries.map(project => (
                  <option key={project.projectName} value={project.projectName}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Updating...</span>
            </div>
          </div>
        )}

        {/* Projects Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {projectSummaries.map((project) => {
            const avgCoverage = calculateAverageCoverage(
              projects.filter(p => p.projectName === project.projectName)
            );

            return (
              <div
                key={project.projectName}
                className={`bg-white p-5 rounded-xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  selectedProject === project.projectName
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200'
                }`}
                onClick={() => handleProjectChange(project.projectName)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleProjectChange(project.projectName);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 truncate" title={project.projectName}>
                    {project.projectName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectHealthColor(avgCoverage)}`}>
                    {getCoverageStatus(avgCoverage)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Statements</span>
                    <p className={`font-bold ${getProjectHealthClass(project.avgStatements)}`}>
                      {formatPercentage(project.avgStatements)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Branches</span>
                    <p className={`font-bold ${getProjectHealthClass(project.avgBranches)}`}>
                      {formatPercentage(project.avgBranches)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Functions</span>
                    <p className={`font-bold ${getProjectHealthClass(project.avgFunctions)}`}>
                      {formatPercentage(project.avgFunctions)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">Lines</span>
                    <p className={`font-bold ${getProjectHealthClass(project.avgLines)}`}>
                      {formatPercentage(project.avgLines)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      {project.totalRuns} runs
                    </span>
                    <span>Updated {format(new Date(project.lastUpdated), 'MMM d')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Project Details */}
        {latestCoverage && selectedProjectSummary && (
          <>
            {/* Current Coverage Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Statements', value: latestCoverage.statementsCoverage, type: 'statements' as const },
                { label: 'Branches', value: latestCoverage.branchesCoverage, type: 'branches' as const },
                { label: 'Functions', value: latestCoverage.functionsCoverage, type: 'functions' as const },
                { label: 'Lines', value: latestCoverage.linesCoverage, type: 'lines' as const }
              ].map((metric) => (
                <div
                  key={metric.type}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700">{metric.label}</h3>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COVERAGE_COLORS[metric.type] }} />
                  </div>
                  <p className={`text-3xl font-bold ${getProjectHealthClass(metric.value)}`}>
                    {formatPercentage(metric.value)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Latest run • {formatDate(latestCoverage.createdAt)}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Coverage Trend Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Coverage Trend - {selectedProject}
                  </h2>
                  <span className="text-sm text-gray-500">Last {timeRange} days</span>
                </div>

                {hasTrendData ? (
                  <ChartContainer height={300} key={`trend-${chartKey}`}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          try {
                            return format(new Date(value), 'MMM dd');
                          } catch {
                            return value;
                          }
                        }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Coverage']}
                        labelFormatter={(label) => `Date: ${format(new Date(label), 'PPP')}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="statements"
                        stroke={COVERAGE_COLORS.statements}
                        name="Statements"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="branches"
                        stroke={COVERAGE_COLORS.branches}
                        name="Branches"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="functions"
                        stroke={COVERAGE_COLORS.functions}
                        name="Functions"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lines"
                        stroke={COVERAGE_COLORS.lines}
                        name="Lines"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="text-gray-400 text-4xl mb-4">📈</div>
                    <p className="text-gray-600 font-medium">No trend data available</p>
                    <p className="text-gray-500 text-sm mt-1">Submit more coverage reports to see trends</p>
                  </div>
                )}
              </div>

              {/* Test Results */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Results</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-2xl font-bold text-green-700">{latestCoverage.passedTests}</p>
                    <p className="text-sm text-green-600 font-medium">Passed</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-2xl font-bold text-red-700">{latestCoverage.failedTests}</p>
                    <p className="text-sm text-red-600 font-medium">Failed</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-2xl font-bold text-gray-700">{latestCoverage.totalTests}</p>
                    <p className="text-sm text-gray-600 font-medium">Total</p>
                  </div>
                </div>

                {testResultsData.length > 0 ? (
                  <ChartContainer height={200} key={`pie-${chartKey}`}>
                    <PieChart>
                      <Pie
                        data={testResultsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                      >
                        {testResultsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} tests`, 'Count']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <p className="text-gray-600 font-medium">No test data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coverage Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Coverage Breakdown</h2>

              {coverageBreakdownData.length > 0 ? (
                <ChartContainer height={250} key={`bar-${chartKey}`}>
                  <BarChart
                    data={coverageBreakdownData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Coverage']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar
                      dataKey="coverage"
                      radius={[0, 8, 8, 0]}
                      background={{ fill: '#f3f4f6', radius: 8 }}
                    >
                      {coverageBreakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COVERAGE_COLORS[
                              entry.type.toLowerCase() as keyof typeof COVERAGE_COLORS
                            ]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px]">
                  <div className="text-gray-400 text-4xl mb-4">📈</div>
                  <p className="text-gray-600 font-medium">No coverage breakdown data</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Recent Runs Table */}
        {projects.length > 0 && selectedProject && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Coverage Runs - {selectedProject}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {Math.min(projects.length, 10)} of {projects.length} runs
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Functions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lines
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.slice(0, 10).map((run) => (
                    <tr
                      key={run.id}
                      className="hover:bg-gray-50 transition-all duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(run.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg border border-blue-200">
                          {run.branch}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded" title={run.commitHash}>
                          {run.commitHash.substring(0, 7)}
                        </code>
                      </td>
                      {['statementsCoverage', 'branchesCoverage', 'functionsCoverage', 'linesCoverage'].map((key) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getProjectHealthClass(run[key as keyof CoverageResult] as number)}`}>
                            {formatPercentage(run[key as keyof CoverageResult] as number)}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-medium">
                            {run.passedTests}/{run.totalTests}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-lg border ${
                            run.failedTests === 0
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {((run.passedTests / run.totalTests) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {projects.length > 10 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  ... and {projects.length - 10} more runs
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}