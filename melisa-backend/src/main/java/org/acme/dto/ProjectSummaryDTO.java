package org.acme.dto;

import java.time.LocalDateTime;

public record ProjectSummaryDTO(String projectName, double avgStatements, double avgBranches, double avgFunctions,
                                double avgLines, LocalDateTime lastUpdated, int totalRuns) {
}
