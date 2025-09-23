package sapienza.inventory.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "research_material")
public class ResearchMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private int quantity = 0;

    @ManyToOne
    @JoinColumn(name = "category", nullable = false) // column is 'category' in your SQL
    private Category category;

    @Column(length = 20)
    private String status = "None";

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @OneToMany(mappedBy = "material")
    private List<MaterialLogs> logs;

    @OneToMany(mappedBy = "material")
    private List<MaterialRequest> requests;

    // getters and setters
}
