package com.taskflow.service;

import com.taskflow.entity.Task;
import com.taskflow.entity.TaskStatus;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            task.setStatus(TaskStatus.PENDING);
        }
        return taskRepository.save(task);
    }

    /**
     * Obtiene todas las tareas.
     */
    @Transactional(readOnly = true)
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
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
     * Actualiza una tarea.
     */
    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setDepartment(taskDetails.getDepartment());
        task.setAssignee(taskDetails.getAssignee());
        return taskRepository.save(task);
    }

    /**
     * Elimina una tarea.
     */
    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    /**
     * Inicia una tarea y el contador de tiempo.
     */
    @Transactional
    public Task startTask(Long taskId, User user) {
        Task task = getTaskById(taskId);
        
        task.setStatus(TaskStatus.IN_PROGRESS);
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
        task.setStatus(TaskStatus.PENDING);
        
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
        if (task.getStatus() == TaskStatus.IN_PROGRESS) {
            timeLogService.stopTimeLog(user);
        }
        
        task.setStatus(TaskStatus.COMPLETED);
        return taskRepository.save(task);
    }

    /**
     * Lista tareas de un departamento.
     */
    @Transactional(readOnly = true)
    public List<Task> getTasksByDepartment(Long departmentId) {
        return taskRepository.findByDepartmentId(departmentId);
    }

    /**
     * Lista tareas asignadas a un usuario.
     */
    @Transactional(readOnly = true)
    public List<Task> getTasksByAssignee(Long assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Obtiene estadísticas de tareas.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTaskStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", taskRepository.count());
        stats.put("pending", taskRepository.countByStatus(TaskStatus.PENDING));
        stats.put("inProgress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        stats.put("completed", taskRepository.countByStatus(TaskStatus.COMPLETED));
        return stats;
    }
}
