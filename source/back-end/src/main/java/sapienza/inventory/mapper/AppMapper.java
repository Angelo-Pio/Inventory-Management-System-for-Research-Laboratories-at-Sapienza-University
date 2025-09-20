package sapienza.inventory.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import sapienza.inventory.dto.DepartmentDto;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.model.Department;
import sapienza.inventory.model.LabUser;

@Component
public class AppMapper {

    private final ModelMapper mapper;

    public AppMapper(ModelMapper mapper) {
        this.mapper = mapper;
    }

    // LabUser -> LabUserDto
    public LabUserDto toLabUserDto(LabUser labUser) {
        LabUserDto dto = mapper.map(labUser, LabUserDto.class);

        return dto;
    }

    public LabUser toLabUser(LabUserDto labuserdto) {
        return mapper.map(labuserdto, LabUser.class);
    }

    public Department toDepartment(DepartmentDto department) {
        return  mapper.map(department, Department.class);

    }


    // Add more methods for other entities/DTOs
}
