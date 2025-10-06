package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.notification.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}