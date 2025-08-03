package dev.ruslan.taskhub.model.dto.openrouter;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OpenRouterRequest {

    @JsonProperty("model")
    private String model;

    @JsonProperty("messages")
    private List<OpenRouterMessage> messages;

    @JsonProperty("max_tokens")
    private Integer maxTokens;

    @JsonProperty("temperature")
    private Double temperature;

    // Конструкторы
    public OpenRouterRequest() {}

    public OpenRouterRequest(String model, List<OpenRouterMessage> messages) {
        this.model = model;
        this.messages = messages;
        this.maxTokens = 1000;
        this.temperature = 0.7;
    }

    // Геттеры и сеттеры
    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<OpenRouterMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<OpenRouterMessage> messages) {
        this.messages = messages;
    }

    public Integer getMaxTokens() {
        return maxTokens;
    }

    public void setMaxTokens(Integer maxTokens) {
        this.maxTokens = maxTokens;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
}