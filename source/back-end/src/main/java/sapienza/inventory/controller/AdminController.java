package sapienza.inventory.controller;


import org.hibernate.annotations.WhereJoinTable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.dto.DepartmentDto;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.service.AdminService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Create new user (researcher or lab manager)
    @PostMapping("/user")
    public Boolean createUser(@RequestBody LabUserDto labuser) {
        return adminService.createUser(labuser);
    }

    // Get all users
    @GetMapping("/users")
    public List<LabUserDto> getAllUsers() {
        return adminService.getAllUsers();
    }

    // Delete user
    @DeleteMapping("/user")
    public LabUserDto getUser(@RequestParam(name = "user_id") Long user_id) {

        Optional<LabUserDto> user = adminService.getUser(user_id);
        if (user.isPresent()) {
            return user.get();
        }else {
            return null;
        }
    }

    @DeleteMapping("/user")
    public Boolean deleteUser(@RequestParam(name = "user_id") Long user_id) {

        return adminService.deleteUser(user_id);
    }

    // Update user info
    @PutMapping("/user")
    public Boolean updateUser(
            @RequestParam(name = "user_id") Long user_id,
            @RequestBody LabUserDto labuser,
            @RequestParam Long department_id) {
        return adminService.updateUser(user_id, labuser, department_id);
    }

    // Create new department
    @PostMapping("/department")
    public Boolean createDepartment(@RequestBody DepartmentDto department) {
        return adminService.createDepartment(department);
    }

    // Update department data
    @PutMapping("/department/{id}")
    public Boolean updateDepartment(@PathVariable Long id, @RequestBody UpdateDepartmentRequest request) {
        return adminService.updateDepartment(id, request);
    }
}
