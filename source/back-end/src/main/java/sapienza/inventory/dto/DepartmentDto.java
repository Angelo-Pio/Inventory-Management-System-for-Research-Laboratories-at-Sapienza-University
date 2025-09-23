package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
public class DepartmentDto {

    private Long id;
    private String name;
    private String details;
    private List<ResearchMaterialDto> researchMaterials;

    // getters and setters
}
