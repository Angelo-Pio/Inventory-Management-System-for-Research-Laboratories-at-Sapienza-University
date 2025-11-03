package sapienza.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MaterialRequestGD {

    private Long request_id;

    private LocalDateTime created_at ;

    private String materialStatus = "None";

    private String requestStatus = "Pending";


}
