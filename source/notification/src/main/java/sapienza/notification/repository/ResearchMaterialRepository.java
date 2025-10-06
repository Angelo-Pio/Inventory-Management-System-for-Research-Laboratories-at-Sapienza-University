package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sapienza.notification.model.ResearchMaterial;
import java.util.List;

public interface ResearchMaterialRepository extends JpaRepository<ResearchMaterial, Long> {

    List<ResearchMaterial> findByDepartmentId(Long departmentId);

    @Query(value = "select distinct u from ResearchMaterial u where u.quantity < u.threshold")
    List<ResearchMaterial> findLowStockMaterials();
}