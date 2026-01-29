package com.taskflow.service;

import com.taskflow.entity.Department;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskStatus;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.DepartmentRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
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
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    /**
     * Crea una nueva tarea.
     * Resuelve las referencias a department y assignee desde la BD.
     */
    @Transactional
    public Task createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }
        
        // Resolver departamento desde la BD
        if (task.getDepartment() != null && task.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(task.getDepartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado"));
            task.setDepartment(dept);
        }
        
        // Resolver assignee desde la BD (puede ser null)
        if (task.getAssignee() != null && task.getAssignee().getId() != null) {
            User assignee = userRepository.findById(task.getAssignee().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
            task.setAssignee(assignee);
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
     * Resuelve las referencias a department y assignee desde la BD.
     */
    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        
        // Resolver departamento desde la BD
        if (taskDetails.getDepartment() != null && taskDetails.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(taskDetails.getDepartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento no encontrado"));
            task.setDepartment(dept);
        }
        
        // Resolver assignee desde la BD (puede ser null)
        if (taskDetails.getAssignee() != null && taskDetails.getAssignee().getId() != null) {
            User assignee = userRepository.findById(taskDetails.getAssignee().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario asignado no encontrado"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
        
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
     * Si hay un time log activo, lo cierra automáticamente.
     */
    @Transactional
    public Task completeTask(Long taskId, User user) {
        Task task = getTaskById(taskId);
        
        // Intentar detener el tiempo si hay uno activo (no fallar si no hay)
        try {
            timeLogService.stopTimeLog(user);
        } catch (Exception e) {
            // No hay time log activo, está bien continuar
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
