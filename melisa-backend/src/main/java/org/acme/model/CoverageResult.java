package org.acme.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coverage_results")
public class CoverageResult extends PanacheEntity {
    @Column(nullable = false)
    public String projectName;
    @Column(nullable = false)
    public String branch;
    @Column(nullable = false)
    public String commitHash;
    @Column(nullable = false)
    public Double statementsCoverage;
    @Column(nullable = false)
    public Double branchesCoverage;
    @Column(nullable = false)
    public Double functionsCoverage;
    @Column(nullable = false)
    public Double linesCoverage;
    @Column(nullable = false)
    public Integer totalTests;
    @Column(nullable = false)
    public Integer passedTests;
    @Column(nullable = false)
    public Integer failedTests;
    @Column(nullable = false)
    public Long duration;
    @Column(nullable = false)
    public LocalDateTime createdAt;

    public static CoverageResult findLatestByProject(String projectName) {
        return find("projectName = ?1 order by createdAt desc", projectName).firstResult();
    }

    public static List<CoverageResult> findByProject(String projectName) {
        return find("projectName = ?1 order by createdAt desc", projectName).list();
    }

    public static List<CoverageResult> findLatestForAllProjects() {
        return getEntityManager().createQuery(
                "SELECT cr FROM CoverageResult cr WHERE cr.createdAt = (" +
                        "SELECT MAX(cr2.createdAt) FROM CoverageResult cr2 WHERE cr2.projectName = cr.projectName" +
                        ")", CoverageResult.class
        ).getResultList();
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
