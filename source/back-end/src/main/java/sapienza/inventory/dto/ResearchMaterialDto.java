package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;
import sapienza.inventory.model.Department;

import java.util.List;

@Data
public class ResearchMaterialDto {

    private Long id;
    private String name;
    private int quantity = 0;
    private CategoryDto category;
    private String status = "None";
    private Long department_id;
    private Integer threshold = 2;

    // getters and setters
}
