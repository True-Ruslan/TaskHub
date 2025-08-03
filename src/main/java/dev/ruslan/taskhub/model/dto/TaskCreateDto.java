package dev.ruslan.taskhub.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "DTO для создания новой задачи")
public class TaskCreateDto {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Schema(description = "Заголовок задачи", example = "Выполнить задачу", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Schema(description = "Описание задачи", example = "Подробное описание задачи")
    private String description;

    // Конструкторы
    public TaskCreateDto() {}

    public TaskCreateDto(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // Геттеры и сеттеры
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
}