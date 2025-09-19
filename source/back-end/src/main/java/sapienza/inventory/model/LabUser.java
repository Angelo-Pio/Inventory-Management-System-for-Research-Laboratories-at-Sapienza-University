package sapienza.inventory.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "lab_user")
public class LabUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String surname;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    // One-to-one to UserRole
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserRole userRole;

    // e.g. requests by researcher
    @OneToMany(mappedBy = "researcher")
    private List<MaterialRequest> materialRequests;

    // getters and setters
}
