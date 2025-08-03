package dev.ruslan.taskhub.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ответ с сгенерированной AI задачей")
public class GeneratedTaskResponse {

    @Schema(
        description = "Сгенерированное содержимое задачи", 
        example = "Создать Kafka Consumer на Java для обработки сообщений..."
    )
    private String content;

    @Schema(
        description = "Исходная тема, по которой была сгенерирована задача",
        example = "Kafka Consumer на Java"
    )
    private String originalTopic;

    // Конструкторы
    public GeneratedTaskResponse() {}

    public GeneratedTaskResponse(String content, String originalTopic) {
        this.content = content;
        this.originalTopic = originalTopic;
    }

    // Геттеры и сеттеры
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getOriginalTopic() {
        return originalTopic;
    }

    public void setOriginalTopic(String originalTopic) {
        this.originalTopic = originalTopic;
    }
}