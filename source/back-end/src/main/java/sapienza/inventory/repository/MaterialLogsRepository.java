package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sapienza.inventory.dto.ResearchMaterialDto;
import sapienza.inventory.model.MaterialLogs;
import sapienza.inventory.model.ResearchMaterial;

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

    @Query("select sum(l.added) from MaterialLogs l where l.department.id = :departmentId and l.timestamp >= :minus and l.added > 0 ")
    Long findLast30DaysTotRestocked(@Param("departmentId") Long departmentId,@Param("minus") LocalDateTime minus);

    @Query("select l from MaterialLogs l where l.department.id = :departmentId and l.timestamp >= :minus and l.added > 0 ")
    List<MaterialLogs> findRestockedMaterialsBeforeDate(@Param("departmentId") Long departmentId, @Param("minus") LocalDateTime localDateTime);
}