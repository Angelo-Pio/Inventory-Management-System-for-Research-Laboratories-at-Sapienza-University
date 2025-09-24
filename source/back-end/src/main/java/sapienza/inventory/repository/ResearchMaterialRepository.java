package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.inventory.model.ResearchMaterial;
import java.util.List;

public interface ResearchMaterialRepository extends JpaRepository<ResearchMaterial, Long> {
    List<ResearchMaterial> findByDepartmentId(Long departmentId);
}