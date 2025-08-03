package dev.ruslan.taskhub.service;

import dev.ruslan.taskhub.model.dto.openrouter.OpenRouterMessage;
import dev.ruslan.taskhub.model.dto.openrouter.OpenRouterRequest;
import dev.ruslan.taskhub.model.dto.openrouter.OpenRouterResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;


import java.time.Duration;
import java.util.List;

@Service
public class OpenRouterClient {

    private static final Logger logger = LoggerFactory.getLogger(OpenRouterClient.class);
    
    private final WebClient webClient;
    private final String apiKey;

    public OpenRouterClient(@Value("${openrouter.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + this.apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("HTTP-Referer", "https://taskhub.dev")
                .defaultHeader("X-Title", "TaskHub AI Integration")
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(1024 * 1024)) // 1MB buffer
                .build();
    }

    /**
     * Генерирует техническую задачу на основе переданной темы
     * 
     * @param topic тема для генерации задачи
     * @return сгенерированный текст задачи
     */
    public String generateTask(String topic) {
        try {
            logger.info("Генерация задачи для темы: {}", topic);

            OpenRouterRequest request = getOpenRouterRequest(topic);

            OpenRouterResponse response = webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OpenRouterResponse.class)
                .timeout(Duration.ofSeconds(30))
                .block();

            if (response != null && response.getFirstChoiceContent() != null) {
                String generatedContent = response.getFirstChoiceContent();
                logger.info("Успешно сгенерирована задача. Длина ответа: {} символов", generatedContent.length());
                return generatedContent;
            } else {
                logger.warn("Получен пустой ответ от OpenRouter API");
                return "Не удалось сгенерировать задачу. Пустой ответ от AI.";
            }

        } catch (WebClientResponseException e) {
            logger.error("Ошибка при запросе к OpenRouter API. Статус: {}, Тело ответа: {}", 
                        e.getStatusCode(), e.getResponseBodyAsString(), e);
            return String.format("Ошибка при обращении к AI сервису: %s", e.getMessage());
        } catch (Exception e) {
            logger.error("Неожиданная ошибка при генерации задачи", e);
            return String.format("Неожиданная ошибка: %s", e.getMessage());
        }
    }

    private static OpenRouterRequest getOpenRouterRequest(String topic) {
        String systemPrompt = """
            Ты - технический аналитик, который создает детальные технические задачи для разработчиков.
            
            Создай техническую задачу на основе переданной темы. Задача должна включать:
            1. Четкое описание цели
            2. Технические требования 
            3. Критерии приемки
            4. Примерную оценку сложности
            
            Формат ответа должен быть структурированным и готовым к использованию разработчиком.
            Используй русский язык для описания.
            """;

        String userPrompt = String.format("Создай техническую задачу на тему: %s", topic);

        return new OpenRouterRequest(
            "mistralai/mistral-7b-instruct:free",
            List.of(
                OpenRouterMessage.systemMessage(systemPrompt),
                OpenRouterMessage.userMessage(userPrompt)
            )
        );
    }

    /**
     * Проверяет доступность OpenRouter API
     * 
     * @return true если API доступно, false иначе
     */
    public boolean isApiAvailable() {
        try {
            // Простой тестовый запрос
            webClient
                .post()
                .uri("/chat/completions")
                .bodyValue(new OpenRouterRequest(
                    "mistralai/mistral-7b-instruct:free",
                    List.of(OpenRouterMessage.userMessage("test"))
                ))
                .retrieve()
                .bodyToMono(OpenRouterResponse.class)
                .timeout(Duration.ofSeconds(5))
                .block();
            return true;
        } catch (Exception e) {
            logger.warn("OpenRouter API недоступно: {}", e.getMessage());
            return false;
        }
    }
}