package sapienza.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sapienza.inventory.dto.MaterialDto;
import sapienza.inventory.mapper.AppMapper;
import sapienza.inventory.model.Category;
import sapienza.inventory.model.Department;
import sapienza.inventory.model.ResearchMaterial;
import sapienza.inventory.repository.CategoryRepository;
import sapienza.inventory.repository.DepartmentRepository;
import sapienza.inventory.repository.ResearchMaterialRepository;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

@Service
public class LabManagerService {

    @Autowired
    ResearchMaterialRepository researchMaterialRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    AppMapper  appMapper;

    public Boolean addMaterial(Long departmentId, MaterialDto materialDto) {

        Optional<Category> category = categoryRepository.findByTitle(materialDto.getCategory());
        if (category.isEmpty()) {
                Category cat = new Category();
                cat.setTitle(materialDto.getCategory());
                categoryRepository.save(cat);
            }
        category = categoryRepository.findByTitle(materialDto.getCategory());

        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isPresent()) {
            ResearchMaterial material = appMapper.toResearchMaterial(materialDto);
            material.setDepartment(department.get());
            material.setCategory(category.get());


            researchMaterialRepository.save(material);

        }
        return true;
    }

    public List<MaterialDto> getMaterials(Long departmentId) {

        Optional<Department> department = departmentRepository.findById(departmentId);

        if (department.isEmpty()) {
            return null;
        }else{
            List<ResearchMaterial> researchMaterialList = department.get().getResearchMaterials();
            List<MaterialDto> materialDtoList = new LinkedList<>();
            for (ResearchMaterial researchMaterial : researchMaterialList) {
                materialDtoList.add(appMapper.toResearchMaterialDto(researchMaterial));
            }
            return materialDtoList;
        }


    }
}
