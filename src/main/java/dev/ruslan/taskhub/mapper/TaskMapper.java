package dev.ruslan.taskhub.mapper;

import dev.ruslan.taskhub.model.dto.TaskCreateDto;
import dev.ruslan.taskhub.model.dto.TaskDto;
import dev.ruslan.taskhub.model.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TaskMapper {

    TaskDto toDto(Task task);
    
    Task toEntity(TaskDto taskDto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Task toEntity(TaskCreateDto taskCreateDto);
    
    List<TaskDto> toDtoList(List<Task> tasks);
    
    List<Task> toEntityList(List<TaskDto> taskDtos);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(TaskDto taskDto, @MappingTarget Task task);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromCreateDto(TaskCreateDto taskCreateDto, @MappingTarget Task task);
}