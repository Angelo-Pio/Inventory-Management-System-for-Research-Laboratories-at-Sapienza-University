package sapienza.inventory.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(nullable = false)
    private int quantity = 0;

    @Column(nullable = false)
    private Integer threshold = 1;

    @ManyToOne
    @JoinColumn(name = "category", nullable = false) // column is 'category' in your SQL
    @JsonBackReference
    private Category category;

    @Column(length = 20)
    private String status = "None";

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    @JsonBackReference
    private Department department;

    @OneToMany(mappedBy = "material")
    @JsonManagedReference
    private List<MaterialLogs> logs;

    @OneToMany(mappedBy = "material")
    @JsonManagedReference
    private List<MaterialRequest> requests;

}
