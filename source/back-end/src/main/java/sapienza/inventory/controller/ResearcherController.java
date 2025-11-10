package sapienza.inventory.controller;

import org.springframework.web.bind.annotation.*;
import sapienza.inventory.dto.MaterialRequestDto;
import sapienza.inventory.dto.ResearchMaterialDto;
import sapienza.inventory.service.ResearcherService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping
public class ResearcherController {

    private final ResearcherService service;
    public ResearcherController(ResearcherService service) {
        this.service = service;
    }

    // All materials of researcher's department
    @GetMapping("/materials")
    public List<ResearchMaterialDto> getMaterialsByResearcher(@RequestParam Long researcherId) {
        return service.getMaterialsByResearcher(researcherId);
    }

    // Decrease material quantity
    @PostMapping("/material/{materialId}/use")
    public Boolean useMaterial(
            @PathVariable Long materialId,
            @RequestParam Integer quantity_used) {
        return service.useMaterial(materialId, quantity_used);
    }

    // Issue a material request
    @PostMapping("/material/request")
    public Boolean requestMaterial(
            @RequestBody MaterialRequestDto request) {
        return service.requestMaterial(request);
    }

    // Mark material as damaged and issue ticket
    @PostMapping("/material/{materialId}/issue")
    public Boolean markDamagedAndIssue(@PathVariable Long materialId, @RequestParam Long labUserId, @RequestParam(required = false) LocalDateTime timestamp) {
        return service.markDamagedAndIssue(materialId, labUserId, timestamp);
    }

    // All requests opened by researcher
    @GetMapping("/researcher/requests")
    public List<MaterialRequestDto> getResearcherRequests(@RequestParam Long researcherId) {
        return service.getResearcherRequests(researcherId);
    }
}
