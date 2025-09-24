package sapienza.inventory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String details;

    @OneToMany(mappedBy = "department")
    private List<LabUser> labUsers;

    @OneToMany(mappedBy = "department")
    private List<ResearchMaterial> researchMaterials;

    @OneToMany(mappedBy = "department")
    private List<MaterialLogs> materialLogs;

    // getters and setters
}
