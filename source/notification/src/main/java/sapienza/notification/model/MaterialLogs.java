package sapienza.notification.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "material_logs")
public class MaterialLogs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column()
    private Integer used = 0;

    @Column()
    private Integer added = 0;

    @Column(length = 20)
    private String status = "None";

    @ManyToOne
    @JoinColumn(name = "material_id", nullable = false)
    private ResearchMaterial material;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne
    @JoinColumn(name = "user_id",nullable = false)
    private LabUser labUser;



    // getters and setters
}
