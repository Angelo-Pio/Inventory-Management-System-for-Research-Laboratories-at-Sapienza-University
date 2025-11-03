package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sapienza.inventory.model.MaterialRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByResearcherId(Long researcherId);
    List<MaterialRequest> findByMaterialId(Long materialId);

    @Query("select distinct r from MaterialRequest r where r.researcher.department.id = :depId and r.created_at >= :timestamp ")
    List<MaterialRequest> findAllByDepartmentIdLastDays(@Param("depId") Long departmentId, @Param("timestamp") LocalDateTime timestamp);
}