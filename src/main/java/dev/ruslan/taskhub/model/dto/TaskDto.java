package dev.ruslan.taskhub.model.dto;

import dev.ruslan.taskhub.model.entity.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "DTO для задачи")
public class TaskDto {

    @Schema(description = "Уникальный идентификатор задачи", example = "1")
    private Long id;

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Schema(description = "Заголовок задачи", example = "Выполнить задачу", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Schema(description = "Описание задачи", example = "Подробное описание задачи")
    private String description;

    @Schema(description = "Статус задачи", example = "IN_PROGRESS")
    private TaskStatus status;

    @Schema(description = "Дата создания задачи")
    private LocalDateTime createdAt;

    @Schema(description = "Дата последнего обновления задачи")
    private LocalDateTime updatedAt;

    // Конструкторы
    public TaskDto() {}

    public TaskDto(String title, String description) {
        this.title = title;
        this.description = description;
    }

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}