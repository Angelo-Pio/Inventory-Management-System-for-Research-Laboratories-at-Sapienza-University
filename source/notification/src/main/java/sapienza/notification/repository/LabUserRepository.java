package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.notification.model.LabUser;

import java.util.List;

public interface LabUserRepository extends JpaRepository<LabUser, Long> {
    LabUser findByEmail(String email);
    List<LabUser> findAllByOrderByNameAsc();
}