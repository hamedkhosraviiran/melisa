package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.dto.CoverageTrendDTO;
import org.acme.dto.ProjectSummaryDTO;
import org.acme.model.CoverageResult;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class CoverageRepository implements PanacheRepository<CoverageResult> {

    private static final String BASE_FIELDS =
            "AVG(cr.statementsCoverage), " +
                    "AVG(cr.branchesCoverage), " +
                    "AVG(cr.functionsCoverage), " +
                    "AVG(cr.linesCoverage)";

    public List<CoverageTrendDTO> getCoverageTrend(String projectName, int days) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        List<Object[]> rows = getEntityManager().createQuery(
                        "SELECT CAST(cr.createdAt AS date), " + BASE_FIELDS + " " +
                                "FROM CoverageResult cr " +
                                "WHERE cr.projectName = :projectName AND cr.createdAt >= :cutoff " +
                                "GROUP BY CAST(cr.createdAt AS date) " +
                                "ORDER BY CAST(cr.createdAt AS date)", Object[].class
                )
                .setParameter("projectName", projectName)
                .setParameter("cutoff", cutoff)
                .getResultList();

        return rows.stream()
                .map(r -> new CoverageTrendDTO(
                        r[0].toString(),
                        ((Number) r[1]).doubleValue(),
                        ((Number) r[2]).doubleValue(),
                        ((Number) r[3]).doubleValue(),
                        ((Number) r[4]).doubleValue()
                ))
                .toList();
    }

    public List<ProjectSummaryDTO> getProjectCoverageSummary() {

        List<Object[]> rows = getEntityManager().createQuery(
                "SELECT cr.projectName, " + BASE_FIELDS + ", MAX(cr.createdAt) " +
                        "FROM CoverageResult cr GROUP BY cr.projectName", Object[].class
        ).getResultList();

        return rows.stream()
                .map(r -> new ProjectSummaryDTO(
                        (String) r[0],
                        ((Number) r[1]).doubleValue(),
                        ((Number) r[2]).doubleValue(),
                        ((Number) r[3]).doubleValue(),
                        ((Number) r[4]).doubleValue(),
                        (LocalDateTime) r[5],
                        0
                ))
                .toList();
    }

    public List<ProjectSummaryDTO> getProjectSummaries() {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(90);
        List<Object[]> rows = getEntityManager().createQuery(
                        "SELECT cr.projectName, " + BASE_FIELDS + ", MAX(cr.createdAt), COUNT(cr.id) " +
                                "FROM CoverageResult cr " +
                                "WHERE cr.createdAt >= :cutoff " +
                                "GROUP BY cr.projectName " +
                                "ORDER BY cr.projectName", Object[].class
                )
                .setParameter("cutoff", cutoff)
                .getResultList();
        return rows.stream()
                .map(r -> new ProjectSummaryDTO(
                        (String) r[0],
                        ((Number) r[1]).doubleValue(),
                        ((Number) r[2]).doubleValue(),
                        ((Number) r[3]).doubleValue(),
                        ((Number) r[4]).doubleValue(),
                        (LocalDateTime) r[5],
                        ((Number) r[6]).intValue()
                ))
                .toList();
    }
}
