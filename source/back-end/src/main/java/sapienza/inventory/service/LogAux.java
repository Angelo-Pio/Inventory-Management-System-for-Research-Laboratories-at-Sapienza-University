package sapienza.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sapienza.inventory.model.LabUser;
import sapienza.inventory.model.MaterialLogs;
import sapienza.inventory.model.ResearchMaterial;
import sapienza.inventory.repository.LabUserRepository;
import sapienza.inventory.repository.MaterialLogsRepository;

import java.time.LocalDateTime;

@Component
public class LogAux {

    @Autowired
    MaterialLogsRepository materialLogsRepository;

    @Autowired
    LabUserRepository labUserRepository;

    public Boolean logLabManagerUpdateQuantity(ResearchMaterial researchMaterial, Integer quantity, Long userId) {

        LabUser user = labUserRepository.findById(userId).orElse(null);

        MaterialLogs log = new MaterialLogs();
        log.setMaterial(researchMaterial);
        log.setDepartment(researchMaterial.getDepartment());
        log.setTimestamp(LocalDateTime.now());
        log.setLabUser(user);

        if (quantity < 0) {
            log.setUsed(quantity);
        } else {
            log.setAdded(quantity);
        }
        materialLogsRepository.save(log);
        return true;
    }


}
