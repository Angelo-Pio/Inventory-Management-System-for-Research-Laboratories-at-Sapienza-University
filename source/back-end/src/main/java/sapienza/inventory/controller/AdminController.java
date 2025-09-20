package sapienza.inventory.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.dto.LabUserDto;
import sapienza.inventory.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Create new user (researcher or lab manager)
    @PostMapping("/user")
    public ResponseEntity<?> createUser(@RequestBody LabUserDto labuser) {
        return ResponseEntity.ok(adminService.createUser(labuser));
    }

    // Get all users
    @GetMapping("/user")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Delete user
    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Update user info
    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    // Create new department
    @PostMapping("/department")
    public ResponseEntity<?> createDepartment(@RequestBody CreateDepartmentRequest request) {
        return ResponseEntity.ok(adminService.createDepartment(request));
    }

    // Update department data
    @PutMapping("/department/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody UpdateDepartmentRequest request) {
        return ResponseEntity.ok(adminService.updateDepartment(id, request));
    }
}
