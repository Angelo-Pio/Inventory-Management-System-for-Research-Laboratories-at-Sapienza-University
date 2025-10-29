package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.inventory.model.ResearchMaterial;
import java.util.List;
import java.util.Optional;

public interface ResearchMaterialRepository extends JpaRepository<ResearchMaterial, Long> {
    List<ResearchMaterial> findByDepartmentId(Long departmentId);
    Optional<ResearchMaterial> findById(Long id);
}