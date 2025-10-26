package sapienza.inventory.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    @JsonManagedReference
    private List<LabUser> labUsers;

    @OneToMany(mappedBy = "department")
    @JsonManagedReference
    private List<ResearchMaterial> researchMaterials;

    @OneToMany(mappedBy = "department")
    @JsonManagedReference
    private List<MaterialLogs> materialLogs;

    // getters and setters
}
