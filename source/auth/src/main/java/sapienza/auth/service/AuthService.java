package sapienza.auth.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import sapienza.auth.model.AuthUser;
import sapienza.auth.repository.AuthUserRepository;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthUserRepository authUserRepository;

    public ResponseEntity<String> login(String email, String password, HttpServletResponse response) {

        Optional<AuthUser> authUser = authUserRepository.findByEmail(email);

        if (authUser.isPresent()) {
            AuthUser user = authUser.get();
            String userPassword = user.getPassword();
            if (PasswordUtils.checkPassword(password, userPassword)) {

                // Set cookie with role/id
                Cookie roleCookie = new Cookie("role", user.getRole());
                roleCookie.setHttpOnly(false);   // prevents JS access
                roleCookie.setPath("/");        // available across app
                response.addCookie(roleCookie);

                Cookie idCookie = new Cookie("userId", user.getId().toString());
                idCookie.setHttpOnly(false);
                idCookie.setPath("/");
                response.addCookie(idCookie);

                return ResponseEntity.ok("Login successful!");
            } else {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        }else  {
            return ResponseEntity.status(401).body("User with such email does not exist");
        }


    }

    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0); // expire immediately
                response.addCookie(cookie);
            }
        }
        return ResponseEntity.ok("Logout successful!");
    }
}
