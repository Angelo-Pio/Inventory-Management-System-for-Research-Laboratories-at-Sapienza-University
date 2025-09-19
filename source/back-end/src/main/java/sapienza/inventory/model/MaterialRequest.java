package sapienza.inventory.model;

import jakarta.persistence.*;

@Entity
@Table(name = "material_request")
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private ResearchMaterial material;

    @ManyToOne
    @JoinColumn(name = "researcher_id", nullable = false)
    private LabUser researcher;

    @Column(name = "material_condition", length = 100)
    private String materialCondition = "None";

    private Integer requestedQuantity = 0;

    @Column(name = "request_status")
    private Boolean requestStatus = false;

    // getters and setters
}
