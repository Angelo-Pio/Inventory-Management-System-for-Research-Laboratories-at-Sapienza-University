package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;
import sapienza.inventory.model.LabUser;

@Data
public class MaterialRequestDto {

    private Long id;
    private ResearchMaterial material;
    private LabUser researcher;
    private String materialCondition = "None";
    private Integer requestedQuantity = 0;
    private Boolean requestStatus = false;

    // getters and setters
}
