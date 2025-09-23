package sapienza.inventory.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import sapienza.inventory.dto.*;
import sapienza.inventory.model.*;

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

    public Category toCategory(CategoryDto categoryDto) {
        return mapper.map(categoryDto, Category.class);
    }

    public CategoryDto toCategoryDto(Category category) {
        return mapper.map(category, CategoryDto.class);
    }

    public MaterialRequestDto toMaterialRequestDto(MaterialRequest materialRequest) {

        MaterialRequestDto requestDto = mapper.map(materialRequest, MaterialRequestDto.class);
        requestDto.setMaterial_id(materialRequest.getMaterial().getId());
        requestDto.setResearcher_id(materialRequest.getResearcher().getId());
        return requestDto;
    }


    // Add more methods for other entities/DTOs
}
