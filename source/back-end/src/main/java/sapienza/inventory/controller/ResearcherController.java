package sapienza.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sapienza.inventory.service.ResearcherService;
import sapienza.inventory.dto.MaterialRequestDto;
import sapienza.inventory.dto.UseMaterialRequest;

@RestController
@RequestMapping
public class ResearcherController {

    private final ResearcherService service;
    public ResearcherController(ResearcherService service) {
        this.service = service;
    }

    // All materials of researcher's department
    @GetMapping("/material")
    public ResponseEntity<?> getMaterialsByResearcher(@RequestParam Long researcherId) {
        return ResponseEntity.ok(service.getMaterialsByResearcher(researcherId));
    }

    // Material info
    @GetMapping("/material/{materialId}")
    public ResponseEntity<?> getMaterialInfo(@PathVariable Long materialId) {
        return ResponseEntity.ok(service.getMaterialInfo(materialId));
    }

    // Decrease material quantity
    @PostMapping("/material/{materialId}/use")
    public ResponseEntity<?> useMaterial(@PathVariable Long materialId,
                                         @RequestBody UseMaterialRequest request) {
        return ResponseEntity.ok(service.useMaterial(materialId, request));
    }

    // Issue a material request
    @PostMapping("/material/{materialId}/request")
    public ResponseEntity<?> requestMaterial(@PathVariable Long materialId,
                                             @RequestBody MaterialRequestDto request) {
        return ResponseEntity.ok(service.requestMaterial(materialId, request));
    }

    // Mark material as damaged and issue ticket
    @PostMapping("/material/{materialId}/issue")
    public ResponseEntity<?> markDamagedAndIssue(@PathVariable Long materialId) {
        return ResponseEntity.ok(service.markDamagedAndIssue(materialId));
    }

    // All requests opened by researcher
    @GetMapping("/researcher/requests")
    public ResponseEntity<?> getResearcherRequests(@RequestParam Long researcherId) {
        return ResponseEntity.ok(service.getResearcherRequests(researcherId));
    }
}
