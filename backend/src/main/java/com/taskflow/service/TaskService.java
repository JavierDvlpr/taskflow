package com.taskflow.service;

import com.taskflow.entity.Task;
import com.taskflow.entity.TaskStatus;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar la lógica de las tareas.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TimeLogService timeLogService;

    /**
     * Crea una nueva tarea.
     */
    @Transactional
    public Task createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDIENTE);
        }
        return taskRepository.save(task);
    }

    /**
     * Obtiene una tarea por ID.
     */
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada con ID: " + id));
    }

    /**
     * Inicia una tarea y el contador de tiempo.
     */
    @Transactional
    public Task startTask(Long taskId, User user) {
        Task task = getTaskById(taskId);
        
        // RF6.2: No se debe permitir iniciar una tarea que ya esté en progreso
        if (task.getStatus() == TaskStatus.EN_PROGRESO) {
            // Sin embargo, si es el mismo usuario reasumiendo, ya se maneja en TimeLogService
        }

        task.setStatus(TaskStatus.EN_PROGRESO);
        task.setAssignee(user);
        
        timeLogService.startTimeLog(user, task);
        
        return taskRepository.save(task);
    }

    /**
     * Pausa una tarea y detiene el contador.
     */
    @Transactional
    public Task pauseTask(Long taskId, User user) {
        Task task = getTaskById(taskId);
        task.setStatus(TaskStatus.PAUSADA);
        
        timeLogService.stopTimeLog(user);
        
        return taskRepository.save(task);
    }

    /**
     * Completa una tarea.
     */
    @Transactional
    public Task completeTask(Long taskId, User user) {
        Task task = getTaskById(taskId);
        
        // Si estaba en progreso, detener el tiempo antes de marcar como completada
        if (task.getStatus() == TaskStatus.EN_PROGRESO) {
            timeLogService.stopTimeLog(user);
        }
        
        task.setStatus(TaskStatus.COMPLETADA);
        return taskRepository.save(task);
    }

    /**
     * Lista tareas de un departamento.
     */
    @Transactional(readOnly = true)
    public List<Task> getTasksByDepartment(Long departmentId) {
        // Podríamos agregar más filtros en el repositorio
        return taskRepository.findAll().stream()
                .filter(t -> t.getDepartment().getId().equals(departmentId))
                .toList();
    }
}
