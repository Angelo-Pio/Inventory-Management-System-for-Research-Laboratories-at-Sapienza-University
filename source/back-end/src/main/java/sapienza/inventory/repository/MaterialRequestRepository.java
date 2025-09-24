package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.inventory.model.MaterialRequest;
import java.util.List;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByResearcherId(Long researcherId);
    List<MaterialRequest> findByMaterialId(Long materialId);
}