package sapienza.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sapienza.auth.model.AuthUser;

import java.util.List;
import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    Optional<AuthUser> findByEmail(String email);

}