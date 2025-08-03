package dev.ruslan.taskhub.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Запрос для генерации задачи с помощью AI")
public class TaskPromptRequest {

    @NotBlank(message = "Topic cannot be blank")
    @Size(max = 255, message = "Topic cannot exceed 255 characters")
    @Schema(
        description = "Тема задачи для генерации", 
        example = "Kafka Consumer на Java",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String topic;

    // Конструкторы
    public TaskPromptRequest() {}

    public TaskPromptRequest(String topic) {
        this.topic = topic;
    }

    // Геттеры и сеттеры
    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }
}