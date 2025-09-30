package sapienza.inventory.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.service.LabManagerService;
import sapienza.inventory.dto.*;

import java.io.IOException;
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
    public Boolean addMaterial(@PathVariable Long departmentId, @RequestBody ResearchMaterialDto materialDto) {
        return service.addMaterial(departmentId, materialDto);
    }

    @GetMapping("/{departmentId}/material")
    public List<ResearchMaterialDto> getAllMaterials(@PathVariable Long departmentId) {
        return service.getMaterials(departmentId);
    }

    // quantity can be a negative value to sum to the stock
    @PutMapping("/{departmentId}/material")
    public Boolean updateMaterialQuantity(
            @PathVariable Long departmentId,
            @RequestParam Long materialId,
            @RequestParam Long userId,
            @RequestParam Integer quantity) {
        return service.updateMaterialQuantity(departmentId, materialId, quantity, userId);
    }

    @DeleteMapping("/{departmentId}/material")
    public Boolean deleteMaterial(@PathVariable Long departmentId, @RequestParam Long materialId) {

        return service.deleteMaterial(departmentId, materialId);
    }

    // Categories
    @PostMapping("/material/category")
    public Boolean createCategory(@RequestBody CategoryDto request) {
        return service.createCategory(request);
    }

    @GetMapping("/material/category")
    public List<CategoryDto> getAllCategories() {
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

    @GetMapping("/{departmentId}/researchers")
    public List<LabUserDto> getAllResearchersOfADepartment(@PathVariable Long departmentId) {
        return service.getAllResearchersOfADepartment(departmentId);
    }

    @GetMapping("/researcher")
    public LabUserDto getResearcher(@RequestParam Long researcherId) {
        return service.getResearcherInfo(researcherId);
    }



    // Monthly report
    @GetMapping("/report/{departmentId}")
    public ResponseEntity<Resource> getReport(
            @PathVariable Long departmentId,
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {

        Resource report = service.getReport(departmentId, startDate, endDate);

        try {
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report.csv\"")
                .contentLength(report.contentLength())
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(report);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // Requests from all researchers of the department
    @GetMapping("/{departmentId}/requests")
    public List<MaterialRequestDto> getAllRequests(@PathVariable Long departmentId) {
        return service.getAllRequests(departmentId);
    }

    @PostMapping("/requests/{requestId}/done")
    public Boolean markRequestAsDone(@PathVariable Long requestId) {
        return service.markRequestAsDone(requestId);
    }
}
