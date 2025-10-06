package sapienza.notification.routine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import sapienza.notification.model.MaterialRequest;
import sapienza.notification.model.ResearchMaterial;
import sapienza.notification.repository.MaterialRequestRepository;
import sapienza.notification.repository.ResearchMaterialRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class NotificationRoutine {

    private static final Logger logger = LoggerFactory.getLogger(NotificationRoutine.class);
    private static final String QUEUE_NAME = "notifications";

    private final ResearchMaterialRepository researchMaterialRepository;
    private final MaterialRequestRepository materialRequestRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AmqpAdmin amqpAdmin;

    public NotificationRoutine(ResearchMaterialRepository researchMaterialRepository,
                               MaterialRequestRepository materialRequestRepository,
                               RabbitTemplate rabbitTemplate,
                               AmqpAdmin amqpAdmin) {
        this.researchMaterialRepository = researchMaterialRepository;
        this.materialRequestRepository = materialRequestRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.amqpAdmin = amqpAdmin;
    }

    // runs every 30 seconds
    @Scheduled(fixedRateString = "30000")
    public void checkLowStockAndPendingRequests() {
        try {
            checkLowStock();
            checkPendingRequests();
        } catch (Exception e) {
            logger.error("Error while running notification routine", e);
        }
    }

    private void checkLowStock() {
        List<ResearchMaterial> materials = researchMaterialRepository.findLowStockMaterials();
        for (ResearchMaterial m : materials) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "LOW_STOCK");
            payload.put("materialId", m.getId());
            payload.put("name", m.getName());
            payload.put("quantity", m.getQuantity());
            sendMessage(payload, m.getDepartment().getId());
        }
    }

    private void checkPendingRequests() {
        List<MaterialRequest> requests = materialRequestRepository.findPendingRequests();
        for (MaterialRequest r : requests) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "PENDING_REQUEST");
            payload.put("requestId", r.getId());
            payload.put("labUser", r.getResearcher().getName());
            if (r.getMaterial() != null) payload.put("materialId", r.getMaterial().getId());
            String materialStatus = r.getMaterialStatus();
            if (materialStatus.equals("Damaged")){
                payload.put("materialStatus", materialStatus);
            }else{
                payload.put("quantity", r.getQuantity());
            }

            sendMessage(payload, r.getMaterial().getDepartment().getId());

        }
    }

    private void sendMessage(Map<String, Object> payload, Long id) {
        try {
            String msg = objectMapper.writeValueAsString(payload);
            String queueName = id + "/" + QUEUE_NAME ;
            // ensure queue exists (declare if missing) so consumers can bind later
            try {
                if (amqpAdmin.getQueueProperties(queueName) == null) {
                    amqpAdmin.declareQueue(new Queue(queueName, true));
                    logger.info("Declared queue {}", queueName);
                }
            } catch (Exception e) {
                // log but continue to attempt sending; declaration failures shouldn't stop the routine
                logger.warn("Could not declare queue {}: {}", queueName, e.getMessage());
            }
            rabbitTemplate.convertAndSend(queueName, msg);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize notification payload", e);
        } catch (Exception e) {
            logger.error("Failed to send notification message", e);
        }
    }


}
