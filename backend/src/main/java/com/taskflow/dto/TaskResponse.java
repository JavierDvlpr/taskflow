package com.taskflow.dto;

import com.taskflow.entity.Task;
import com.taskflow.entity.TaskStatus;
import com.taskflow.entity.Priority;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para respuestas de Task con datos aplanados.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueDate;
    
    // Datos del departamento
    private Long departmentId;
    private String departmentName;
    
    // Datos del asignado
    private Long assigneeId;
    private String assigneeFirstName;
    private String assigneeLastName;
    
    // Datos del solicitante
    private Long requesterId;
    private String requesterFirstName;
    private String requesterLastName;
    
    // Tiempo total registrado (calculado)
    private Long totalTimeLogged;

    /**
     * Convierte una entidad Task a TaskResponse.
     */
    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .departmentId(task.getDepartment() != null ? task.getDepartment().getId() : null)
                .departmentName(task.getDepartment() != null ? task.getDepartment().getName() : null)
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeFirstName(task.getAssignee() != null ? task.getAssignee().getFirstName() : null)
                .assigneeLastName(task.getAssignee() != null ? task.getAssignee().getLastName() : null)
                .requesterId(task.getRequester() != null ? task.getRequester().getId() : null)
                .requesterFirstName(task.getRequester() != null ? task.getRequester().getFirstName() : null)
                .requesterLastName(task.getRequester() != null ? task.getRequester().getLastName() : null)
                .totalTimeLogged(0L)
                .build();
    }
}
