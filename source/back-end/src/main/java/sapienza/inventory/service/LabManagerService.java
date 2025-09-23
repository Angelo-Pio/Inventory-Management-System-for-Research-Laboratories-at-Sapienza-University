package sapienza.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import sapienza.inventory.dto.CategoryDto;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.dto.MaterialDto;
import sapienza.inventory.dto.MaterialRequestDto;
import sapienza.inventory.mapper.AppMapper;
import sapienza.inventory.model.*;
import sapienza.inventory.repository.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LabManagerService {

    @Autowired
    ResearchMaterialRepository researchMaterialRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    LabUserRepository labUserRepository;

    @Autowired
    MaterialLogsRepository materialLogsRepository;

    @Autowired
    MaterialRequestRepository materialRequestRepository;

    @Autowired
    AppMapper appMapper;

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
        } else {
            List<ResearchMaterial> researchMaterialList = department.get().getResearchMaterials();
            List<MaterialDto> materialDtoList = new LinkedList<>();
            for (ResearchMaterial researchMaterial : researchMaterialList) {
                materialDtoList.add(appMapper.toResearchMaterialDto(researchMaterial));
            }
            return materialDtoList;
        }


    }

    public Boolean updateMaterialQuantity(Long departmentId, Long materialId, Integer quantity) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isPresent()) {
            for (ResearchMaterial researchMaterial : department.get().getResearchMaterials()) {
                if (researchMaterial.getId().equals(materialId)) {
                    researchMaterial.setQuantity(quantity);
                    return true;
                }

            }
        }
        return false;
    }

    public Boolean deleteMaterial(Long departmentId, Long materialId) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isPresent()) {
            List<ResearchMaterial> researchMaterialList = department.get().getResearchMaterials();
            for (ResearchMaterial researchMaterial : researchMaterialList) {
                if (researchMaterial.getId().equals(materialId)) {
                    researchMaterialList.remove(researchMaterial);
                    return true;
                }

            }
        }
        return false;
    }

    public Boolean createCategory(CategoryDto categoryDto) {
        Optional<Category> category = categoryRepository.findByTitle(categoryDto.getTitle());
        if (category.isEmpty()) {
            categoryRepository.save(appMapper.toCategory(categoryDto));
            return true;
        }
        return false;
    }

    public List<CategoryDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDto> categoryDtoList = new LinkedList<>();
        for (Category category : categories) {
            categoryDtoList.add(appMapper.toCategoryDto(category));
        }
        return categoryDtoList;
    }

    public Boolean addResearcherToDepartment(Long departmentId, LabUserDto labUserDto) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isPresent()) {
            LabUser labUser = appMapper.toLabUser(labUserDto);
            labUser.setDepartment(department.get());
            labUserRepository.save(labUser);
            return true;
        }
        return false;
    }

    public Boolean removeResearcherFromDepartment(Long departmentId, Long researcherId) {

        labUserRepository.findById(researcherId).ifPresent(labUser -> {
            labUserRepository.delete(labUser);
        });
        return true;
    }

    public Resource getReport(Long departmentId, LocalDateTime startDate, LocalDateTime endDate) {

        /* Report format
         *
         * Usages:
         * Timestamp | Material | quantity | Researcher name - surname
         *
         * Restock:
         *
         * Timestamp | Material | quantity | Lab manager
         *
         *
         * Equipment damaged:
         * Timestamp | Material | request status | Researche name - surname
         * */

        Report report = new Report();

        Integer tot_used = 0;
        Integer tot_added = 0;
        Integer tot_damaged = 0;


        List<MaterialLogs> logs = materialLogsRepository.findByDepartmentIdAndStartDateAfterAndStartDateBefore(departmentId,startDate,endDate);

        String format = "%s,%s,%d,%s";
        for (MaterialLogs log : logs) {
            if (log.getAdded() > 0) {
                report.getRestock().add(
                        String.format(format, log.getTimestamp().format(DateTimeFormatter.ofPattern("EEEE M/d/yyyy 'at' HH:mm", Locale.ENGLISH)),
                                log.getMaterial().getName(),
                                log.getAdded(),
                                log.getLabUser().getName()

                        ));
                tot_added += log.getAdded();

            }
            if (log.getUsed() > 0) {
                report.getUsages().add(
                        String.format(format, log.getTimestamp().format(DateTimeFormatter.ofPattern("EEEE M/d/yyyy 'at' HH:mm", Locale.ENGLISH)),
                                log.getMaterial().getName(),
                                log.getUsed(),
                                log.getLabUser().getName()

                        ));
                tot_used += log.getUsed();
            }

        }

        return report.toCSV(tot_used,tot_added);




    }

    public List<MaterialRequestDto> getAllRequests(Long departmentId) {

        List<MaterialRequest> requestRepositoryAll = materialRequestRepository.findAll();
        List<MaterialRequestDto> materialRequestDtoList = new LinkedList<>();
        for (MaterialRequest materialRequest : requestRepositoryAll) {
            if(materialRequest.getResearcher().getDepartment().getId().equals(departmentId) ) {
                materialRequestDtoList.add(appMapper.toMaterialRequestDto(materialRequest));
            }
        }
        return materialRequestDtoList;

    }

    public Boolean markRequestAsDone(Long requestId) {

        materialRequestRepository.findById(requestId).ifPresent(materialRequest -> {materialRequest.setRequestStatus("Processed");});
        return true;
    }
}
