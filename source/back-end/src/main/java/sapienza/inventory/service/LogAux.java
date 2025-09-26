package sapienza.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sapienza.inventory.model.MaterialLogs;
import sapienza.inventory.model.ResearchMaterial;
import sapienza.inventory.repository.MaterialLogsRepository;

import java.time.LocalDateTime;

@Component
public class LogAux {

    @Autowired
    MaterialLogsRepository materialLogsRepository;

    public Boolean logLabManagerUpdateQuantity(ResearchMaterial researchMaterial, Integer quantity) {

        int researchMaterialQuantity = researchMaterial.getQuantity();

        MaterialLogs log = new MaterialLogs();
        log.setMaterial(researchMaterial);
        log.setDepartment(researchMaterial.getDepartment());
        log.setTimestamp(LocalDateTime.now());

        if (quantity < 0) {
            log.setUsed(quantity);
        } else {
            log.setAdded(quantity);
        }
        materialLogsRepository.save(log);
        return true;
    }


}
