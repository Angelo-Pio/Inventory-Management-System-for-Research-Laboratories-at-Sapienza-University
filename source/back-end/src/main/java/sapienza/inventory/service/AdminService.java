package sapienza.inventory.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.repository.LabUserRepository;

@Service
public class AdminService {

    @Autowired
    private LabUserRepository labUserRepository;

    public LabUserDto createUser(LabUserDto labuser) {
    }
}
