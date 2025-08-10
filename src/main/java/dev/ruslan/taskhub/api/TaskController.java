package dev.ruslan.taskhub.api;

import dev.ruslan.taskhub.model.dto.TaskCreateDto;
import dev.ruslan.taskhub.model.dto.TaskDto;
import dev.ruslan.taskhub.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Task Management", description = "API для управления задачами")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/ping")
    @Operation(summary = "Проверка работоспособности", description = "Эндпоинт для проверки работы сервиса")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @GetMapping
    @Operation(summary = "Получить все задачи", description = "Возвращает список всех задач")
    @ApiResponse(responseCode = "200", description = "Список задач успешно получен")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить задачу по ID", description = "Возвращает задачу по указанному идентификатору")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Задача найдена"),
        @ApiResponse(responseCode = "404", description = "Задача не найдена")
    })
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        Optional<TaskDto> task = taskService.getTaskById(id);
        return task.map(taskDto -> ResponseEntity.ok(taskDto))
                   .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Создать новую задачу", description = "Создает новую задачу с указанными данными")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Задача успешно создана"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные")
    })
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskCreateDto taskCreateDto) {
        TaskDto createdTask = taskService.createTask(taskCreateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Обновить задачу", description = "Обновляет существующую задачу по ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Задача успешно обновлена"),
        @ApiResponse(responseCode = "404", description = "Задача не найдена"),
        @ApiResponse(responseCode = "400", description = "Некорректные данные")
    })
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        Optional<TaskDto> updatedTask = taskService.updateTask(id, taskDto);
        return updatedTask.map(taskDto1 -> ResponseEntity.ok(taskDto1))
                          .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Удалить задачу", description = "Удаляет задачу по указанному ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Задача успешно удалена"),
        @ApiResponse(responseCode = "404", description = "Задача не найдена")
    })
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        return deleted ? ResponseEntity.noContent().build() 
                       : ResponseEntity.notFound().build();
    }
}