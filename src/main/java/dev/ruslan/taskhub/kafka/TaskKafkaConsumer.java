package dev.ruslan.taskhub.kafka;

import dev.ruslan.taskhub.model.dto.events.TaskEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka Consumer для обработки событий задач
 */
@Service
public class TaskKafkaConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TaskKafkaConsumer.class);

    /**
     * Обрабатывает события создания задач
     */
    @KafkaListener(topics = TaskKafkaProducer.TASK_CREATED_TOPIC, groupId = "taskhub-group")
    public void handleTaskCreatedEvent(
            @Payload TaskEvent taskEvent,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received TASK_CREATED event from topic: {}, partition: {}, offset: {}, event: {}", 
                topic, partition, offset, taskEvent);
            
            // Здесь может быть бизнес-логика обработки создания задачи
            // Например, отправка уведомлений, обновление других микросервисов и т.д.
            processTaskCreated(taskEvent);
            
            // Подтверждаем успешную обработку
            acknowledgment.acknowledge();
            logger.debug("Successfully processed TASK_CREATED event for task ID: {}", taskEvent.getId());
            
        } catch (Exception e) {
            logger.error("Error processing TASK_CREATED event for task ID: {}: {}", 
                taskEvent.getId(), e.getMessage(), e);
            // Здесь можно добавить логику повторной обработки или отправки в DLQ
        }
    }

    /**
     * Обрабатывает события обновления задач
     */
    @KafkaListener(topics = TaskKafkaProducer.TASK_UPDATED_TOPIC, groupId = "taskhub-group")
    public void handleTaskUpdatedEvent(
            @Payload TaskEvent taskEvent,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        
        try {
            logger.info("Received TASK_UPDATED event from topic: {}, partition: {}, offset: {}, event: {}", 
                topic, partition, offset, taskEvent);
            
            // Здесь может быть бизнес-логика обработки обновления задачи
            processTaskUpdated(taskEvent);
            
            // Подтверждаем успешную обработку
            acknowledgment.acknowledge();
            logger.debug("Successfully processed TASK_UPDATED event for task ID: {}", taskEvent.getId());
            
        } catch (Exception e) {
            logger.error("Error processing TASK_UPDATED event for task ID: {}: {}", 
                taskEvent.getId(), e.getMessage(), e);
            // Здесь можно добавить логику повторной обработки или отправки в DLQ
        }
    }

    /**
     * Обрабатывает создание задачи
     */
    private void processTaskCreated(TaskEvent taskEvent) {
        logger.info("Processing task creation: Task '{}' with ID {} has been created with status {}", 
            taskEvent.getTitle(), taskEvent.getId(), taskEvent.getStatus());
        
        // Здесь может быть дополнительная бизнес-логика:
        // - Отправка уведомлений пользователям
        // - Обновление статистики
        // - Интеграция с внешними системами
        // - Индексирование для поиска
    }

    /**
     * Обрабатывает обновление задачи
     */
    private void processTaskUpdated(TaskEvent taskEvent) {
        logger.info("Processing task update: Task '{}' with ID {} has been updated to status {}", 
            taskEvent.getTitle(), taskEvent.getId(), taskEvent.getStatus());
        
        // Здесь может быть дополнительная бизнес-логика:
        // - Отправка уведомлений о изменениях
        // - Обновление кеша в других сервисах
        // - Аудит изменений
        // - Триггеры для автоматизации
    }
}