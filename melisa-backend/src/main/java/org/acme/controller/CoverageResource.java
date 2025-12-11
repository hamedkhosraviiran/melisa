package org.acme.controller;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.CoverageTrendDTO;
import org.acme.dto.ProjectSummaryDTO;
import org.acme.model.CoverageResult;
import org.acme.repository.CoverageRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/coverage")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CoverageResource {

    @Inject
    CoverageRepository coverageRepository;

    @POST
    @Transactional
    public Response submitCoverage(CoverageRequest request) {
        try {
            if (request.projectName == null || request.projectName.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Project name is required"))
                        .build();
            }
            CoverageResult coverage = new CoverageResult();
            coverage.projectName = request.projectName.trim();
            coverage.branch = request.branch != null ? request.branch.trim() : "main";
            coverage.commitHash = request.commitHash != null ? request.commitHash.trim() : "unknown";
            coverage.statementsCoverage = request.summary.statements.pct;
            coverage.branchesCoverage = request.summary.branches.pct;
            coverage.functionsCoverage = request.summary.functions.pct;
            coverage.linesCoverage = request.summary.lines.pct;
            coverage.totalTests = request.summary.tests != null ? request.summary.tests.total : 0;
            coverage.passedTests = request.summary.tests != null ? request.summary.tests.passed : 0;
            coverage.failedTests = request.summary.tests != null ? request.summary.tests.failed : 0;
            coverage.duration = request.duration != null ? request.duration : 0L;
            coverage.createdAt = LocalDateTime.now();
            coverage.persist();
            return Response.status(Response.Status.CREATED).entity(
                    Map.of(
                            "message", "Coverage results saved successfully",
                            "id", coverage.id,
                            "project", coverage.projectName
                    )
            ).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to save coverage results: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/projects/summary")
    public Response getProjectsCoverageSummary() {
        try {
            List<ProjectSummaryDTO> summaries = coverageRepository.getProjectSummaries();
            List<Map<String, Object>> result = summaries.stream().map(summary -> {
                Map<String, Object> map = new HashMap<>();
                map.put("projectName", summary.projectName());
                map.put("avgStatements", summary.avgStatements());
                map.put("avgBranches", summary.avgBranches());
                map.put("avgFunctions", summary.avgFunctions());
                map.put("avgLines", summary.avgLines());
                map.put("lastUpdated", summary.lastUpdated().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                map.put("totalRuns", summary.totalRuns());
                return map;
            }).collect(Collectors.toList());

            return Response.ok(result).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch projects summary: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/project/{projectName}")
    public Response getProjectCoverage(@PathParam("projectName") String projectName) {
        try {
            List<CoverageResult> coverageResults = CoverageResult.findByProject(projectName);
            return Response.ok(coverageResults).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch coverage: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/project/{projectName}/trend")
    public Response getCoverageTrend(
            @PathParam("projectName") String projectName,
            @QueryParam("days") @DefaultValue("30") int days) {
        try {
            List<CoverageTrendDTO> trendData = coverageRepository.getCoverageTrend(projectName, days);
            return Response.ok(trendData).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch trend: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/summary")
    public Response getCoverageSummary() {
        try {
            List<ProjectSummaryDTO> summary = coverageRepository.getProjectCoverageSummary();
            return Response.ok(summary).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch summary: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/projects")
    public Response getAllProjectsCoverage() {
        try {
            List<CoverageResult> projects = CoverageResult.findLatestForAllProjects();
            return Response.ok(projects).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch projects: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/project/{projectName}/latest")
    public Response getLatestCoverage(@PathParam("projectName") String projectName) {
        try {
            CoverageResult latest = CoverageResult.findLatestByProject(projectName);
            if (latest == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "No coverage data found for project: " + projectName))
                        .build();
            }
            return Response.ok(latest).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch latest coverage: " + e.getMessage()))
                    .build();
        }
    }

    public static class CoverageRequest {
        public String projectName;
        public String branch;
        public String commitHash;
        public Long duration;
        public CoverageSummary summary;
    }

    public static class CoverageSummary {
        public CoverageMetric statements;
        public CoverageMetric branches;
        public CoverageMetric functions;
        public CoverageMetric lines;
        public TestSummary tests;
    }

    public static class CoverageMetric {
        public Double pct;
        public Integer covered;
        public Integer total;
    }

    public static class TestSummary {
        public Integer total;
        public Integer passed;
        public Integer failed;
    }

}
