package sapienza.inventory.dto;

import lombok.Data;
import sapienza.inventory.model.LabUser;

@Data
public class MaterialDto {

    private Long id;
    private String name;
    private String quantity;
    private String status = "None";
    private String category;

    // getters and setters
}
