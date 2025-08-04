package dev.ruslan.taskhub.service;

import dev.ruslan.taskhub.kafka.TaskKafkaProducer;
import dev.ruslan.taskhub.mapper.TaskMapper;
import dev.ruslan.taskhub.model.dto.TaskCreateDto;
import dev.ruslan.taskhub.model.dto.TaskDto;
import dev.ruslan.taskhub.model.dto.events.TaskEvent;
import dev.ruslan.taskhub.model.entity.Task;
import dev.ruslan.taskhub.model.entity.TaskStatus;
import dev.ruslan.taskhub.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final CacheManager cacheManager;
    private final TaskKafkaProducer taskKafkaProducer;

    @Autowired
    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper, 
                      CacheManager cacheManager, TaskKafkaProducer taskKafkaProducer) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.cacheManager = cacheManager;
        this.taskKafkaProducer = taskKafkaProducer;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        logger.debug("Fetching all tasks from database");
        List<Task> tasks = taskRepository.findAll();
        List<TaskDto> taskDtos = taskMapper.toDtoList(tasks);
        logger.debug("Loaded {} tasks from database", taskDtos.size());

        // Кешируем каждую задачу по отдельности напрямую через CacheManager
        Cache taskCache = cacheManager.getCache("task");
        if (taskCache != null) {
            taskDtos.forEach(taskDto -> taskCache.put(taskDto.getId(), taskDto));
            logger.debug("Cached {} tasks individually", taskDtos.size());
        }

        return taskDtos;
    }

    @Transactional(readOnly = true)
    public Optional<TaskDto> getTaskById(Long id) {
        // Сначала пытаемся получить из кеша
        Cache taskCache = cacheManager.getCache("task");
        if (taskCache != null) {
            Cache.ValueWrapper cachedValue = taskCache.get(id);
            if (cachedValue != null) {
                Object cachedObject = cachedValue.get();
                if (cachedObject instanceof TaskDto) {
                    logger.debug("Task with ID: {} found in cache", id);
                    return Optional.of((TaskDto) cachedObject);
                } else if (cachedObject instanceof java.util.LinkedHashMap) {
                    // Обрабатываем случай когда Jackson десериализовал как Map
                    logger.debug("Task with ID: {} found in cache as Map, converting to TaskDto", id);
                    TaskDto taskDto = convertMapToTaskDto((java.util.LinkedHashMap<?, ?>) cachedObject);
                    if (taskDto != null) {
                        // Обновляем кеш правильным объектом
                        taskCache.put(id, taskDto);
                        return Optional.of(taskDto);
                    }
                }
            }
        }

        // Если в кеше нет, идем в БД
        logger.debug("Fetching task with ID: {} from database (cache miss)", id);
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            TaskDto result = taskMapper.toDto(task.get());
            // Кешируем результат
            if (taskCache != null) {
                taskCache.put(id, result);
                logger.debug("Loaded task with ID: {} from database and cached", id);
            }
            return Optional.of(result);
        } else {
            logger.debug("Task with ID: {} not found in database", id);
            return Optional.empty();
        }
    }

    @CachePut(value = "task", key = "#result.id")
    public TaskDto createTask(TaskCreateDto taskCreateDto) {
        logger.debug("Creating new task and adding to cache");
        Task task = taskMapper.toEntity(taskCreateDto);
        Task savedTask = taskRepository.save(task);
        TaskDto result = taskMapper.toDto(savedTask);
        logger.debug("Created task with ID: {} and added to task cache", result.getId());
        
        // Отправка события создания задачи в Kafka
        try {
            TaskEvent taskEvent = new TaskEvent(
                result.getId(),
                result.getTitle(),
                result.getStatus(),
                TaskEvent.TASK_CREATED
            );
            taskKafkaProducer.sendTaskCreatedEvent(taskEvent);
            logger.debug("Task created event sent to Kafka for task ID: {}", result.getId());
        } catch (Exception e) {
            logger.error("Failed to send task created event to Kafka for task ID: {}: {}", 
                result.getId(), e.getMessage(), e);
            // Не прерываем выполнение, так как задача уже создана
        }
        
        return result;
    }

    public Optional<TaskDto> updateTask(Long id, TaskDto taskDto) {
        logger.debug("Updating task with ID: {}", id);
        Optional<Task> existingTaskOptional = taskRepository.findById(id);

        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            taskMapper.updateEntityFromDto(taskDto, existingTask);
            Task updatedTask = taskRepository.save(existingTask);
            TaskDto result = taskMapper.toDto(updatedTask);

            // Обновляем кеш конкретной задачи напрямую через CacheManager
            Cache taskCache = cacheManager.getCache("task");
            if (taskCache != null) {
                taskCache.put(id, result);
                logger.debug("Updated task with ID: {} in database and cache", id);
            } else {
                logger.debug("Updated task with ID: {} in database (cache not available)", id);
            }
            
            // Отправка события обновления задачи в Kafka
            try {
                TaskEvent taskEvent = new TaskEvent(
                    result.getId(),
                    result.getTitle(),
                    result.getStatus(),
                    TaskEvent.TASK_UPDATED
                );
                taskKafkaProducer.sendTaskUpdatedEvent(taskEvent);
                logger.debug("Task updated event sent to Kafka for task ID: {}", result.getId());
            } catch (Exception e) {
                logger.error("Failed to send task updated event to Kafka for task ID: {}: {}", 
                    result.getId(), e.getMessage(), e);
                // Не прерываем выполнение, так как задача уже обновлена
            }
            
            return Optional.of(result);
        }

        logger.debug("Task with ID: {} not found for update", id);
        return Optional.empty();
    }

    /**
     * Конвертирует LinkedHashMap в TaskDto (fallback для проблем с десериализацией)
     */
    private TaskDto convertMapToTaskDto(java.util.LinkedHashMap<?, ?> map) {
        try {
            TaskDto taskDto = new TaskDto();
            if (map.get("id") != null) {
                taskDto.setId(((Number) map.get("id")).longValue());
            }
            if (map.get("title") != null) {
                taskDto.setTitle((String) map.get("title"));
            }
            if (map.get("description") != null) {
                taskDto.setDescription((String) map.get("description"));
            }
            if (map.get("status") != null) {
                taskDto.setStatus(TaskStatus.valueOf((String) map.get("status")));
            }
            // LocalDateTime поля будут null - это норм для кеша
            logger.debug("Successfully converted Map to TaskDto for task ID: {}", taskDto.getId());
            return taskDto;
        } catch (Exception e) {
            logger.error("Failed to convert Map to TaskDto: {}", e.getMessage());
            return null;
        }
    }

    @CacheEvict(value = "task", key = "#id")
    public boolean deleteTask(Long id) {
        logger.debug("Deleting task with ID: {} and evicting from task cache", id);
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            logger.debug("Deleted task with ID: {} and evicted from task cache", id);
            return true;
        }
        logger.debug("Task with ID: {} not found for deletion", id);
        return false;
    }
}