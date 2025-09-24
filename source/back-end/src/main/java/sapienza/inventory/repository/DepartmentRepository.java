package sapienza.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.inventory.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}