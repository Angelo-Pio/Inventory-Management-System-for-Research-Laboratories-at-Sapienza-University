package sapienza.inventory.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @OneToMany(mappedBy = "category")
    private List<ResearchMaterial> researchMaterials;

    // getters and setters
}
