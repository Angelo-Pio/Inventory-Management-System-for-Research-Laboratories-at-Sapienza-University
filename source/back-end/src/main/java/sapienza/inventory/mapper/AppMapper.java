package sapienza.inventory.mapper;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sapienza.inventory.dto.*;
import sapienza.inventory.model.*;
import sapienza.inventory.repository.DepartmentRepository;

import java.util.Optional;

@Component
public class AppMapper {

    private final ModelMapper mapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    public AppMapper(ModelMapper mapper, DepartmentRepository departmentRepository) {
        this.mapper = mapper;

    }

    // LabUser -> LabUserDto
    public LabUserDto toLabUserDto(LabUser labUser) {
        LabUserDto dto = mapper.map(labUser, LabUserDto.class);
        dto.setDepartmentId(labUser.getDepartment().getId());

        return dto;
    }

    public LabUser toLabUser(LabUserDto labuserdto) {
        LabUser labUser = mapper.map(labuserdto, LabUser.class);
        Optional<Department> department = departmentRepository.findById(labuserdto.getDepartmentId());
        if (department.isPresent()) {
            labUser.setDepartment(department.get());
        }else {
            throw new RuntimeException("Department does not exists");
        }
        return labUser;
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
