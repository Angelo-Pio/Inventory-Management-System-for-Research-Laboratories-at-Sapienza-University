package sapienza.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.inventory.model.Category;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByTitle(String title);
}