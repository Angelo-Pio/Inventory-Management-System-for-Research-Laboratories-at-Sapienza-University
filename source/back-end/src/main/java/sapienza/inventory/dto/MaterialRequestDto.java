package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;
import sapienza.inventory.model.LabUser;
import sapienza.inventory.model.ResearchMaterial;

import java.time.LocalDateTime;


@Data
public class MaterialRequestDto {

    private Long material_id;

    private Long researcher_id;

    private String researcher_name;

    private String researcher_surname;

    private LocalDateTime created_at ;

    private LocalDateTime processed_at ;

    private String materialStatus = "None";

    private Integer quantity = 0;

    private String requestStatus = "Pending";

    // getters and setters
}
