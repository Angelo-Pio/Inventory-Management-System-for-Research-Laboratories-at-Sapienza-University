package sapienza.inventory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.List;

@Entity
@Getter
@Setter
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

    @Column(nullable = false, length = 20)
    private String role;

    @ManyToOne( cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Department department;

    @OneToMany(mappedBy = "researcher")
    private List<MaterialRequest> materialRequests;

    @OneToMany(mappedBy = "labUser")
    private List<MaterialLogs> materialLogs;


    // getters and setters
}
