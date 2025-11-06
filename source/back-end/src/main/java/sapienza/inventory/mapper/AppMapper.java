package sapienza.inventory.mapper;

import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sapienza.inventory.dto.*;
import sapienza.inventory.model.*;
import sapienza.inventory.repository.DepartmentRepository;
import sapienza.inventory.repository.LabUserRepository;
import sapienza.inventory.repository.ResearchMaterialRepository;

import java.util.Optional;

@Component
public class AppMapper {

    private final ModelMapper mapper;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private LabUserRepository labUserRepository;

    @Autowired
    private ResearchMaterialRepository researchMaterialRepository;

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

    public ResearchMaterial toResearchMaterial(ResearchMaterialDto researchMaterialDto) {
        return mapper.map(researchMaterialDto, ResearchMaterial.class);
    }

    public ResearchMaterialDto toResearchMaterialDto(ResearchMaterial researchMaterial) {
        ResearchMaterialDto ret = mapper.map(researchMaterial, ResearchMaterialDto.class);
        ret.setCategory(this.toCategoryDto(researchMaterial.getCategory()));
        ret.setDepartment_id(researchMaterial.getDepartment().getId());
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
        requestDto.setRequest_id(materialRequest.getId());
        requestDto.setMaterial_id(materialRequest.getMaterial().getId());
        requestDto.setResearcher_id(materialRequest.getResearcher().getId());
        requestDto.setResearcher_name(materialRequest.getResearcher().getName());
        requestDto.setResearcher_surname(materialRequest.getResearcher().getSurname());
        return requestDto;
    }

    public DepartmentDto toDepartmentDto(Department department) {
        return mapper.map(department, DepartmentDto.class);
    }

    public MaterialRequest toMaterialRequest(MaterialRequestDto request) {
        MaterialRequest materialRequest = mapper.map(request, MaterialRequest.class);

        ResearchMaterial researchMaterial = researchMaterialRepository.findById(request.getMaterial_id()).orElseThrow(EntityNotFoundException::new);
        LabUser labUser = labUserRepository.findById(request.getResearcher_id()).orElseThrow(EntityNotFoundException::new);

        materialRequest.setId(materialRequest.getId());
        materialRequest.setMaterial(researchMaterial);
        materialRequest.setResearcher(labUser);
        return materialRequest;



    }


    // Add more methods for other entities/DTOs
}
