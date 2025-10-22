package sapienza.notification.config; // Assumi che sia in questo package

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

@Configuration
public class RabbitMQConfig {

    // Deve corrispondere al valore in application.properties e NotificationRoutine
    public static final String EXCHANGE_NAME = "notification.exchange"; 
    
    // Nota: la routing key "1/notifications" non è più una costante qui, 
    // ma un pattern gestito dinamicamente nella Routine.

    /**
     * Definisce un Topic Exchange. Cruciale per il routing basato su pattern (come in MQTT).
     */
    @Bean
    public TopicExchange exchange() {
        // TopicExchange supporta il routing basato su wildcard, 
        // essenziale per il mapping con i topic MQTT.
        return new TopicExchange(EXCHANGE_NAME);
    }
    
    /**
     * Configura il MessageConverter per usare JSON, essenziale per il client React.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
