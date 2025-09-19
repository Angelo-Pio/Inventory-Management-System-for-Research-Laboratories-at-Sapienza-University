package sapienza.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.service.LabManagerService;
import sapienza.inventory.dto.*;

@RestController
@RequestMapping("/management")
public class LabManagerController {

    private final LabManagerService service;
    public LabManagerController(LabManagerService service) {
        this.service = service;
    }

    // Material in a department
    @PostMapping("/{departmentId}/material")
    public ResponseEntity<?> addMaterial(@PathVariable Long departmentId, @RequestBody CreateMaterialRequest request) {
        return ResponseEntity.ok(service.addMaterial(departmentId, request));
    }

    @GetMapping("/{departmentId}/material")
    public ResponseEntity<?> getAllMaterials(@PathVariable Long departmentId) {
        return ResponseEntity.ok(service.getMaterials(departmentId));
    }

    @PutMapping("/{departmentId}/material/{materialId}")
    public ResponseEntity<?> updateMaterialQuantity(
            @PathVariable Long departmentId,
            @PathVariable Long materialId,
            @RequestBody UpdateMaterialQuantityRequest request) {
        return ResponseEntity.ok(service.updateMaterialQuantity(departmentId, materialId, request));
    }

    @DeleteMapping("/{departmentId}/material/{materialId}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long departmentId, @PathVariable Long materialId) {
        service.deleteMaterial(departmentId, materialId);
        return ResponseEntity.ok().build();
    }

    // Categories
    @PostMapping("/material/category")
    public ResponseEntity<?> createCategory(@RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(service.createCategory(request));
    }

    @GetMapping("/material/category")
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity.ok(service.getAllCategories());
    }

    @PutMapping("/material/category/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable Long categoryId, @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(service.updateCategory(categoryId, request));
    }

    @DeleteMapping("/material/category/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId) {
        service.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }

    // Researcher in department
    @PostMapping("/{departmentId}/researcher")
    public ResponseEntity<?> addResearcher(@PathVariable Long departmentId, @RequestBody AddResearcherRequest request) {
        return ResponseEntity.ok(service.addResearcherToDepartment(departmentId, request));
    }

    @DeleteMapping("/{departmentId}/researcher/{researcherId}")
    public ResponseEntity<?> removeResearcher(@PathVariable Long departmentId, @PathVariable Long researcherId) {
        service.removeResearcherFromDepartment(departmentId, researcherId);
        return ResponseEntity.ok().build();
    }

    // Monthly report
    @GetMapping("/report/{departmentId}")
    public ResponseEntity<?> getMonthlyReport(@PathVariable Long departmentId,
                                              @RequestParam int month,
                                              @RequestParam int year) {
        return ResponseEntity.ok(service.getMonthlyReport(departmentId, month, year));
    }

    // Requests
    @GetMapping("/requests")
    public ResponseEntity<?> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @PostMapping("/requests/{requestId}/done")
    public ResponseEntity<?> markRequestAsDone(@PathVariable Long requestId) {
        return ResponseEntity.ok(service.markRequestAsDone(requestId));
    }
}
