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

    private String materialStatus = "None";

    private Integer quantity = 0;

    private LocalDateTime timestamp ;

    private String requestStatus = "Pending";

    // getters and setters
}
