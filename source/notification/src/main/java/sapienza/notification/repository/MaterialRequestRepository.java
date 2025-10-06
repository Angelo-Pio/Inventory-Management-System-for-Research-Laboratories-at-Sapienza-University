package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sapienza.notification.model.MaterialRequest;
import java.util.List;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    List<MaterialRequest> findByResearcherId(Long researcherId);
    List<MaterialRequest> findByMaterialId(Long materialId);


    @Query(value = "select distinct r from MaterialRequest r where r.requestStatus = 'Pending' ")
    List<MaterialRequest> findPendingRequests();


}