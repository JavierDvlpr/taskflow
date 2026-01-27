package com.taskflow.dto;

import com.taskflow.entity.Priority;
import com.taskflow.entity.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO para tareas.
 */
@Data
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private Long departmentId;
    private String departmentName;
    private Long requesterId;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime createdAt;
}
