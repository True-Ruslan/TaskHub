package dev.ruslan.taskhub.api;

import dev.ruslan.taskhub.model.dto.GeneratedTaskResponse;
import dev.ruslan.taskhub.model.dto.TaskPromptRequest;
import dev.ruslan.taskhub.service.OpenRouterClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "AI Task Generation", description = "API для генерации задач с помощью искусственного интеллекта")
public class TaskGenerationController {

    private static final Logger logger = LoggerFactory.getLogger(TaskGenerationController.class);
    
    private final OpenRouterClient openRouterClient;

    @Autowired
    public TaskGenerationController(OpenRouterClient openRouterClient) {
        this.openRouterClient = openRouterClient;
    }

    @PostMapping("/generate")
    @Operation(
        summary = "Генерация технической задачи с помощью AI", 
        description = "Принимает тему задачи и возвращает полноценную техническую задачу, сгенерированную AI"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Задача успешно сгенерирована"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные запроса"),
        @ApiResponse(responseCode = "500", description = "Ошибка при генерации задачи")
    })
    public ResponseEntity<GeneratedTaskResponse> generateTask(
            @Valid @RequestBody TaskPromptRequest request) {
        
        try {
            logger.info("Получен запрос на генерацию задачи для темы: {}", request.getTopic());
            
            String generatedContent = openRouterClient.generateTask(request.getTopic());
            
            GeneratedTaskResponse response = new GeneratedTaskResponse(
                generatedContent, 
                request.getTopic()
            );
            
            logger.info("Задача успешно сгенерирована для темы: {}", request.getTopic());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Ошибка при генерации задачи для темы: {}", request.getTopic(), e);
            
            GeneratedTaskResponse errorResponse = new GeneratedTaskResponse(
                "Произошла ошибка при генерации задачи: " + e.getMessage(),
                request.getTopic()
            );
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/generate/health")
    @Operation(
        summary = "Проверка работоспособности AI сервиса", 
        description = "Проверяет доступность OpenRouter API"
    )
    @ApiResponse(responseCode = "200", description = "AI сервис доступен")
    @ApiResponse(responseCode = "503", description = "AI сервис недоступен")
    public ResponseEntity<String> checkAiHealth() {
        boolean isAvailable = openRouterClient.isApiAvailable();
        
        if (isAvailable) {
            return ResponseEntity.ok("AI сервис работает корректно");
        } else {
            return ResponseEntity.status(503).body("AI сервис временно недоступен");
        }
    }
}