package sapienza.inventory.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.dto.MaterialRequestDto;
import sapienza.inventory.dto.ResearchMaterialDto;
import sapienza.inventory.mapper.AppMapper;
import sapienza.inventory.model.LabUser;
import sapienza.inventory.model.MaterialLogs;
import sapienza.inventory.model.MaterialRequest;
import sapienza.inventory.model.ResearchMaterial;
import sapienza.inventory.repository.LabUserRepository;
import sapienza.inventory.repository.MaterialLogsRepository;
import sapienza.inventory.repository.MaterialRequestRepository;
import sapienza.inventory.repository.ResearchMaterialRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ResearcherService {

    @Autowired
    LabUserRepository labUserRepository;

    @Autowired
    ResearchMaterialRepository researchMaterialRepository;

    @Autowired
    MaterialRequestRepository materialRequestRepository;

    @Autowired
    MaterialLogsRepository materialLogsRepository;

    @Autowired
    AppMapper appMapper;


    public Boolean useMaterial(Long materialId, Integer quantityUsed) {
        Optional<ResearchMaterial> researchMaterial = researchMaterialRepository.findById(materialId);
        if (researchMaterial.isPresent()) {
            int set_quantity = researchMaterial.get().getQuantity();
            if (set_quantity - quantityUsed < 0) {
                throw new ArithmeticException("Not enough material");
            } else {
                researchMaterial.get().setQuantity(set_quantity - quantityUsed);
                researchMaterialRepository.save(researchMaterial.get());
            }

        } else {
            throw new EntityNotFoundException("Research material not found");
        }
        return true;
    }

    public List<ResearchMaterialDto> getMaterialsByResearcher(Long researcherId) {
        LabUser labUser = labUserRepository.findById(researcherId).orElseThrow(EntityNotFoundException::new);
        List<ResearchMaterial> researchMaterialList = labUser.getDepartment().getResearchMaterials();
        List<ResearchMaterialDto> researchMaterialDtoList = new ArrayList<>();
        for (ResearchMaterial researchMaterial : researchMaterialList) {
            researchMaterialDtoList.add(appMapper.toResearchMaterialDto(researchMaterial));
        }
        return researchMaterialDtoList;
    }

    public Boolean requestMaterial(MaterialRequestDto request) {

        //create material request
        MaterialRequest materialRequest = appMapper.toMaterialRequest(request);
        if (request.getCreated_at() == null) {
            materialRequest.setCreated_at(LocalDateTime.now());
        }else{
            materialRequest.setCreated_at(request.getCreated_at());
        }
        materialRequestRepository.save(materialRequest);
        return true;
    }

    public Boolean markDamagedAndIssue(Long materialId, Long labUserId, LocalDateTime timestamp) {
        ResearchMaterial researchMaterial = researchMaterialRepository.findById(materialId).orElseThrow(EntityNotFoundException::new);
        LabUser labUser = labUserRepository.findById(labUserId).orElseThrow(EntityNotFoundException::new);

        researchMaterial.setStatus("Damaged");
        researchMaterialRepository.save(researchMaterial);

        // LOG
        MaterialLogs materialLogs = new MaterialLogs();
        materialLogs.setMaterial(researchMaterial);
        if(timestamp != null){
        materialLogs.setTimestamp(timestamp);
        }else{
        materialLogs.setTimestamp(LocalDateTime.now());

        }
        materialLogs.setStatus("Damaged");
        materialLogs.setLabUser(labUser);
        materialLogs.setDepartment(labUser.getDepartment());

        materialLogsRepository.save(materialLogs);


        return true;
    }

    public List<MaterialRequestDto> getResearcherRequests(Long researcherId) {

        List<MaterialRequest> materialRequests = materialRequestRepository.findByResearcherId(researcherId);
        List<MaterialRequestDto> materialRequestDtoList = new ArrayList<>();
        for (MaterialRequest materialRequest : materialRequests) {
            materialRequestDtoList.add(appMapper.toMaterialRequestDto(materialRequest));
        }
        return materialRequestDtoList;
    }
}
