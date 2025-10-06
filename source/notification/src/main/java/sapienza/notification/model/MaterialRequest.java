package sapienza.notification.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
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

    @Column(name = "material_status", length = 100)
    private String materialStatus = "None"; // Damaged

    @Column(name = "quantity")
    private Integer quantity = 0;

    @Column(name="created_at")
    private LocalDateTime created_at ;

    @Column(name = "processed_at")
    private LocalDateTime processed_at ;

    @Column(name = "request_status")
    private String requestStatus = "Pending";



}
