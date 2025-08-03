package dev.ruslan.taskhub.model.dto.openrouter;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OpenRouterResponse {

    @JsonProperty("id")
    private String id;

    @JsonProperty("object")
    private String object;

    @JsonProperty("created")
    private Long created;

    @JsonProperty("model")
    private String model;

    @JsonProperty("choices")
    private List<OpenRouterChoice> choices;

    @JsonProperty("usage")
    private OpenRouterUsage usage;

    // Конструкторы
    public OpenRouterResponse() {}

    // Метод для получения содержимого ответа
    public String getFirstChoiceContent() {
        if (choices != null && !choices.isEmpty() && choices.get(0).getMessage() != null) {
            return choices.get(0).getMessage().getContent();
        }
        return null;
    }

    // Геттеры и сеттеры
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public Long getCreated() {
        return created;
    }

    public void setCreated(Long created) {
        this.created = created;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<OpenRouterChoice> getChoices() {
        return choices;
    }

    public void setChoices(List<OpenRouterChoice> choices) {
        this.choices = choices;
    }

    public OpenRouterUsage getUsage() {
        return usage;
    }

    public void setUsage(OpenRouterUsage usage) {
        this.usage = usage;
    }

    public static class OpenRouterChoice {
        @JsonProperty("index")
        private Integer index;

        @JsonProperty("message")
        private OpenRouterMessage message;

        @JsonProperty("finish_reason")
        private String finishReason;

        // Конструкторы
        public OpenRouterChoice() {}

        // Геттеры и сеттеры
        public Integer getIndex() {
            return index;
        }

        public void setIndex(Integer index) {
            this.index = index;
        }

        public OpenRouterMessage getMessage() {
            return message;
        }

        public void setMessage(OpenRouterMessage message) {
            this.message = message;
        }

        public String getFinishReason() {
            return finishReason;
        }

        public void setFinishReason(String finishReason) {
            this.finishReason = finishReason;
        }
    }

    public static class OpenRouterUsage {
        @JsonProperty("prompt_tokens")
        private Integer promptTokens;

        @JsonProperty("completion_tokens")
        private Integer completionTokens;

        @JsonProperty("total_tokens")
        private Integer totalTokens;

        // Конструкторы
        public OpenRouterUsage() {}

        // Геттеры и сеттеры
        public Integer getPromptTokens() {
            return promptTokens;
        }

        public void setPromptTokens(Integer promptTokens) {
            this.promptTokens = promptTokens;
        }

        public Integer getCompletionTokens() {
            return completionTokens;
        }

        public void setCompletionTokens(Integer completionTokens) {
            this.completionTokens = completionTokens;
        }

        public Integer getTotalTokens() {
            return totalTokens;
        }

        public void setTotalTokens(Integer totalTokens) {
            this.totalTokens = totalTokens;
        }
    }
}