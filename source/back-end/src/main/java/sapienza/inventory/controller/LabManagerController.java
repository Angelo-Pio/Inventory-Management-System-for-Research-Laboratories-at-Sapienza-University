package sapienza.inventory.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.service.LabManagerService;
import sapienza.inventory.dto.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/management")
public class LabManagerController {

    private final LabManagerService service;
    public LabManagerController(LabManagerService service) {
        this.service = service;
    }

    // Material in a department
    @PostMapping("/{departmentId}/material")
    public Boolean addMaterial(@PathVariable Long departmentId, @RequestBody MaterialDto materialDto) {
        return service.addMaterial(departmentId, materialDto);
    }

    @GetMapping("/{departmentId}/material")
    public List<MaterialDto> getAllMaterials(@PathVariable Long departmentId) {
        return service.getMaterials(departmentId);
    }

    // quantity can be a negative value to sum to the stock
    @PutMapping("/{departmentId}/material")
    public Boolean updateMaterialQuantity(
            @PathVariable Long departmentId,
            @RequestParam Long materialId,
            @RequestParam Integer quantity) {
        return service.updateMaterialQuantity(departmentId, materialId, quantity);
    }

    @DeleteMapping("/{departmentId}/material")
    public Boolean deleteMaterial(@PathVariable Long departmentId, @RequestParam Long materialId) {

        return service.deleteMaterial(departmentId, materialId);
    }

    // Categories
    /*@PostMapping("/material/category")
    public Boolean createCategory(@RequestBody CreateCategoryRequest request) {
        return service.createCategory(request);
    }*/

    @GetMapping("/material/category")
    public Boolean getAllCategories() {
        return service.getAllCategories();
    }

    // Researcher in department
    @PostMapping("/{departmentId}/researcher")
    public Boolean addResearcher(@PathVariable Long departmentId, @RequestBody LabUserDto labUserDto) {
        return service.addResearcherToDepartment(departmentId, labUserDto);
    }

    @DeleteMapping("/{departmentId}/researcher")
    public Boolean removeResearcher(@PathVariable Long departmentId, @RequestParam Long researcherId) {
        return service.removeResearcherFromDepartment(departmentId, researcherId);
    }

    // Monthly report
    @GetMapping("/report/{departmentId}")
    public ResponseEntity<Resource> getMonthlyReport(
            @PathVariable Long departmentId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return service.getMonthlyReport(departmentId, startDate, endDate);
    }

    // Requests from all researchers of the department
    @GetMapping("/{departmentId}/requests")
    public Boolean getAllRequests(@PathVariable Long departmentId) {
        return service.getAllRequests(departmentId);
    }

    @PostMapping("/requests/{requestId}/done")
    public Boolean markRequestAsDone(@PathVariable Long requestId) {
        return service.markRequestAsDone(requestId);
    }
}
