package sapienza.notification.routine;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    
    // Use RabbitMQ's default topic exchange for interoperability with MQTT plugin.
    // The RabbitMQ MQTT/WebSocket plugin maps MQTT topics to AMQP routing keys
    // on the 'amq.topic' exchange by default, so publish there.
    private static final String NOTIFICATION_EXCHANGE = "amq.topic"; 
    
    // La parte del topic che segue l'ID del dipartimento
    private static final String TOPIC_SUFFIX = ".notifications"; 

    private final ResearchMaterialRepository researchMaterialRepository;
    private final MaterialRequestRepository materialRequestRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    // Non è più necessario AmqpAdmin se non dichiariamo code, quindi lo rimuoviamo
    // private final AmqpAdmin amqpAdmin; 

    // Rimuoviamo AmqpAdmin dal costruttore
    public NotificationRoutine(ResearchMaterialRepository researchMaterialRepository,
                               MaterialRequestRepository materialRequestRepository,
                               RabbitTemplate rabbitTemplate) {
        this.researchMaterialRepository = researchMaterialRepository;
        this.materialRequestRepository = materialRequestRepository;
        this.rabbitTemplate = rabbitTemplate;
        // this.amqpAdmin = amqpAdmin; // AmqpAdmin rimosso
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
            // Uso dell'ID del dipartimento come parte della routing key
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

            // Uso dell'ID del dipartimento come parte della routing key
            sendMessage(payload, r.getMaterial().getDepartment().getId());

        }
    }

    /**
     * Invia un messaggio tramite RabbitTemplate al Topic Exchange.
     * La routing key creata funge da topic MQTT (e.g., "1/notifications").
     * @param payload Il payload della notifica.
     * @param id L'ID del dipartimento (usato come parte del topic).
     */
    private void sendMessage(Map<String, Object> payload, Long id) {
        try {
            // Serializza il payload in JSON
            String msg = objectMapper.writeValueAsString(payload);
            
            // Crea la Routing Key (e.g., "1/notifications", "2/notifications")
            String routingKey = id + TOPIC_SUFFIX;
            
            // Utilizza convertAndSend con Exchange e Routing Key
            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, routingKey, msg);
            
            logger.info("Notifica inviata al Topic Exchange: {} con Routing Key: {}", NOTIFICATION_EXCHANGE, routingKey);

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize notification payload", e);
        } catch (Exception e) {
            logger.error("Failed to send notification message", e);
        }
    }
}
