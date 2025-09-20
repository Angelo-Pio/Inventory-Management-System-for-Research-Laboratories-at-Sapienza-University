package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;
import sapienza.inventory.model.Department;

import java.time.LocalDateTime;

@Data
public class MaterialLogsDto {

    private Long id;
    private LocalDateTime timestamp = LocalDateTime.now();
    private ResearchMaterial material;
    private Department department;
    private Integer used = 0;
    private Integer added = 0;
    private String status = "None";

}
