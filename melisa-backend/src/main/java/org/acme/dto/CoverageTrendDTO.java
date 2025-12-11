package org.acme.dto;

public record CoverageTrendDTO(
        String date,
        double avgStatements,
        double avgBranches,
        double avgFunctions,
        double avgLines
) {}
