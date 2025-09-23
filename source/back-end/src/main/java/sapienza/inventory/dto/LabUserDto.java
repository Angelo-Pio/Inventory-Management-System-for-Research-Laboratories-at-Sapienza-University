package sapienza.inventory.dto;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
public class LabUserDto {

    private String name;
    private String surname;
    private String email;
    private String password;
    private String role; // admin / researcher / labmanager
    private Long departmentId;

}
