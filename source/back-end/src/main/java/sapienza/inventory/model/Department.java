package sapienza.inventory.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String details;

    @OneToMany(mappedBy = "department")
    private List<UserRole> userRoles;

    @OneToMany(mappedBy = "department")
    private List<ResearchMaterial> researchMaterials;

    @OneToMany(mappedBy = "department")
    private List<MaterialLogs> materialLogs;

    // getters and setters
}
