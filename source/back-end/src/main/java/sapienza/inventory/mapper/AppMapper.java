package sapienza.inventory.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import sapienza.inventory.dto.DepartmentDto;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.dto.MaterialDto;
import sapienza.inventory.model.Department;
import sapienza.inventory.model.LabUser;
import sapienza.inventory.model.ResearchMaterial;

@Component
public class AppMapper {

    private final ModelMapper mapper;

    public AppMapper(ModelMapper mapper) {
        this.mapper = mapper;
    }

    // LabUser -> LabUserDto
    public LabUserDto toLabUserDto(LabUser labUser) {
        LabUserDto dto = mapper.map(labUser, LabUserDto.class);
        dto.setDepartmentId(labUser.getDepartment().getId());

        return dto;
    }

    public LabUser toLabUser(LabUserDto labuserdto) {
        return mapper.map(labuserdto, LabUser.class);
    }

    public Department toDepartment(DepartmentDto department) {
        return mapper.map(department, Department.class);

    }

    public ResearchMaterial toResearchMaterial(MaterialDto materialDto) {
        return mapper.map(materialDto, ResearchMaterial.class);
    }

    public MaterialDto toResearchMaterialDto(ResearchMaterial researchMaterial) {
        MaterialDto ret = mapper.map(researchMaterial, MaterialDto.class);
        ret.setCategory(researchMaterial.getCategory().getTitle());
        return ret;
    }


    // Add more methods for other entities/DTOs
}
