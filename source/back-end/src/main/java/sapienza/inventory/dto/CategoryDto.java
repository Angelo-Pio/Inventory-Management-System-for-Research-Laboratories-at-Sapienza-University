package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;


@Data
public class CategoryDto {

    private Long id;
    private String title;
    private List<ResearchMaterial> researchMaterials;

}
