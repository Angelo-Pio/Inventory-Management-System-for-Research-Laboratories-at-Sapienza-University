package sapienza.inventory.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sapienza.inventory.dto.DepartmentDto;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.mapper.AppMapper;
import sapienza.inventory.model.Department;
import sapienza.inventory.model.LabUser;
import sapienza.inventory.repository.DepartmentRepository;
import sapienza.inventory.repository.LabUserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private LabUserRepository labUserRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AppMapper appMapper;

    public Boolean createUser(LabUserDto labuserdto) {
        labUserRepository.save(appMapper.toLabUser(labuserdto));
        return true;
    }

    public List<LabUserDto> getAllUsers() {
        List<LabUser> users =  labUserRepository.findAllOrderByNameAsc();
        List<LabUserDto> labUserDtos = new ArrayList<>();
        for (LabUser labUser : users) {
            labUserDtos.add(appMapper.toLabUserDto(labUser));
        }
        return labUserDtos;
    }

    public Optional<LabUserDto> getUser(Long userId) {
        Optional<LabUser> labUser = labUserRepository.findById(userId);
        return labUser.map(user -> appMapper.toLabUserDto(user));
    }

    public Boolean deleteUser(Long id) {
        labUserRepository.deleteById(id);
        return true;
    }

    @Transactional
    public Boolean updateUser(Long userId, LabUserDto dto, Long department_id) {
         LabUser user = labUserRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("LabUser not found"));
        Department department = departmentRepository.findById(department_id).orElseThrow(() -> new EntityNotFoundException("Department does not exists"));

        user.setName(dto.getName());
        user.setSurname(dto.getSurname());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setDepartment(department);

        labUserRepository.save(user);

        return true;
    }

    public Boolean createDepartment(DepartmentDto department) {
        departmentRepository.save(appMapper.toDepartment(department));
        return true;
    }

    public Boolean updateDepartment(Long department_id) {
        Department department = departmentRepository.findById(department_id)getId())
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));


        department.setName(departmentdto.getName());
        department.setDetails(departmentdto.getDetails());

        departmentRepository.save(department);

        return true;
    }
}
