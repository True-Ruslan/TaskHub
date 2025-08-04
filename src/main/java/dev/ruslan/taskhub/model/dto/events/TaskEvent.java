package dev.ruslan.taskhub.model.dto.events;

import dev.ruslan.taskhub.model.entity.TaskStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO для событий задач в Kafka
 */
public class TaskEvent {

    private Long id;
    private String title;
    private TaskStatus status;
    private String eventType;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    // Конструкторы
    public TaskEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public TaskEvent(Long id, String title, TaskStatus status, String eventType) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.eventType = eventType;
        this.timestamp = LocalDateTime.now();
    }

    // Константы для типов событий
    public static final String TASK_CREATED = "task.created";
    public static final String TASK_UPDATED = "task.updated";

    // Геттеры и сеттеры
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "TaskEvent{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", eventType='" + eventType + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}