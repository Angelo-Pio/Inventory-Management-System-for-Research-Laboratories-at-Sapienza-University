package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sapienza.notification.model.MaterialLogs;

import java.time.LocalDateTime;
import java.util.List;

public interface MaterialLogsRepository extends JpaRepository<MaterialLogs, Long> {
    List<MaterialLogs> findByDepartmentId(Long departmentId);
    List<MaterialLogs> findByMaterialId(Long materialId);

    @Query(value = "SELECT log FROM MaterialLogs log WHERE log.department.id = :departmentId and  log.timestamp >= :startDate and log.timestamp  <= :endDate")
    List<MaterialLogs> findByDepartmentIdAndStartDateAfterAndEndDateBefore(
            @Param("departmentId") Long departmentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}