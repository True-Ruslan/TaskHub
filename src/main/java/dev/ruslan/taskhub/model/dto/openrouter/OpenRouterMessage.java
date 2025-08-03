package dev.ruslan.taskhub.model.dto.openrouter;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OpenRouterMessage {

    @JsonProperty("role")
    private String role;

    @JsonProperty("content")
    private String content;

    // Конструкторы
    public OpenRouterMessage() {}

    public OpenRouterMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }

    // Статические методы для удобства
    public static OpenRouterMessage systemMessage(String content) {
        return new OpenRouterMessage("system", content);
    }

    public static OpenRouterMessage userMessage(String content) {
        return new OpenRouterMessage("user", content);
    }

    // Геттеры и сеттеры
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}