package dev.ruslan.taskhub.service;

import dev.ruslan.taskhub.mapper.TaskMapper;
import dev.ruslan.taskhub.model.dto.TaskCreateDto;
import dev.ruslan.taskhub.model.dto.TaskDto;
import dev.ruslan.taskhub.model.entity.Task;
import dev.ruslan.taskhub.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Autowired
    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return taskMapper.toDtoList(tasks);
    }

    @Transactional(readOnly = true)
    public Optional<TaskDto> getTaskById(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(taskMapper::toDto);
    }

    public TaskDto createTask(TaskCreateDto taskCreateDto) {
        Task task = taskMapper.toEntity(taskCreateDto);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }

    public Optional<TaskDto> updateTask(Long id, TaskDto taskDto) {
        Optional<Task> existingTaskOptional = taskRepository.findById(id);
        
        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            taskMapper.updateEntityFromDto(taskDto, existingTask);
            Task updatedTask = taskRepository.save(existingTask);
            return Optional.of(taskMapper.toDto(updatedTask));
        }
        
        return Optional.empty();
    }

    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
}