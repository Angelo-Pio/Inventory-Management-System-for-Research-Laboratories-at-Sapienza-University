package sapienza.inventory.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_logs")
public class MaterialLogs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private ResearchMaterial material;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    private Integer used = 0;
    private Integer added = 0;

    @Column(length = 20)
    private String status = "None";

    // getters and setters
}
