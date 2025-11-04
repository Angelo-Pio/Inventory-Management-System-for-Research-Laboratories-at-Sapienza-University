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

        LabUser labUser = appMapper.toLabUser(labuserdto);
        labUser.setPassword(PasswordUtils.hashPassword(labuserdto.getPassword()));
        labUserRepository.save(labUser);
        return true;
    }

    public List<LabUserDto> getAllUsers() {
        List<LabUser> users =  labUserRepository.findAllByOrderByNameAsc();
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
    public Boolean updateUser(LabUserDto dto) {
         LabUser user = labUserRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("LabUser not found"));
        Department department = departmentRepository.findById(dto.getDepartmentId()).orElseThrow(() -> new EntityNotFoundException("Department does not exists"));

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


    public List<DepartmentDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        List<DepartmentDto> departmentDtos = new ArrayList<>();
        for (Department department : departments) {
            departmentDtos.add(appMapper.toDepartmentDto(department));
        }
        return departmentDtos;
    }

    public DepartmentDto getDepartment(Long departmentId) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isPresent()) {
            return appMapper.toDepartmentDto(department.get());
        }else{
            throw new EntityNotFoundException("Department does not exists");
        }

    }
}
