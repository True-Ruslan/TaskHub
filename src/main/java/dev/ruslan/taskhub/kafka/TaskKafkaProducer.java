package dev.ruslan.taskhub.kafka;

import dev.ruslan.taskhub.model.dto.events.TaskEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka Producer для отправки событий задач
 */
@Service
public class TaskKafkaProducer {

    private static final Logger logger = LoggerFactory.getLogger(TaskKafkaProducer.class);

    // Названия топиков
    public static final String TASK_CREATED_TOPIC = "task.created";
    public static final String TASK_UPDATED_TOPIC = "task.updated";

    private final KafkaTemplate<String, TaskEvent> kafkaTemplate;

    @Autowired
    public TaskKafkaProducer(KafkaTemplate<String, TaskEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Отправляет событие создания задачи
     */
    public void sendTaskCreatedEvent(TaskEvent taskEvent) {
        sendEvent(TASK_CREATED_TOPIC, taskEvent);
    }

    /**
     * Отправляет событие обновления задачи
     */
    public void sendTaskUpdatedEvent(TaskEvent taskEvent) {
        sendEvent(TASK_UPDATED_TOPIC, taskEvent);
    }

    /**
     * Общий метод для отправки событий в Kafka
     */
    private void sendEvent(String topic, TaskEvent taskEvent) {
        try {
            logger.info("Sending event to topic {}: {}", topic, taskEvent);
            
            CompletableFuture<SendResult<String, TaskEvent>> future = 
                kafkaTemplate.send(topic, taskEvent.getId().toString(), taskEvent);
            
            future.thenAccept(result -> {
                logger.info("Successfully sent event to topic {} with key {}: offset={}",
                    topic, taskEvent.getId(), result.getRecordMetadata().offset());
            }).exceptionally(ex -> {
                logger.error("Failed to send event to topic {} with key {}: {}", 
                    topic, taskEvent.getId(), ex.getMessage(), ex);
                return null;
            });
            
        } catch (Exception e) {
            logger.error("Error while sending event to topic {} with key {}: {}", 
                topic, taskEvent.getId(), e.getMessage(), e);
        }
    }
}