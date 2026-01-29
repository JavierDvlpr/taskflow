package com.taskflow.controller;

import com.taskflow.dto.TaskResponse;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.repository.TimeLogRepository;
import com.taskflow.service.TaskService;
import com.taskflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

/**
 * Controlador para la gestión de tareas.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final TimeLogRepository timeLogRepository;

    /**
     * Convierte Task a TaskResponse incluyendo el tiempo total registrado
     */
    private TaskResponse toTaskResponse(Task task) {
        TaskResponse response = TaskResponse.fromEntity(task);
        Long totalMinutes = timeLogRepository.getTotalMinutesByTask(task.getId());
        response.setTotalTimeLogged(totalMinutes != null ? totalMinutes : 0L);
        return response;
    }

    /**
     * Crear tarea (solo ADMIN)
     * El usuario autenticado se asigna automáticamente como requester
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Task task, Authentication auth) {
        User requester = userService.getUserByEmail(auth.getName());
        task.setRequester(requester);
        return ResponseEntity.ok(taskService.createTask(task));
    }

    /**
     * Obtener todas las tareas
     */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        List<TaskResponse> response = tasks.stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener tarea por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(toTaskResponse(task));
    }

    /**
     * Actualizar tarea (solo ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    /**
     * Eliminar tarea (solo ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener tareas por departamento
     */
    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<TaskResponse>> getByDepartment(@PathVariable Long deptId) {
        List<Task> tasks = taskService.getTasksByDepartment(deptId);
        List<TaskResponse> response = tasks.stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener MIS tareas (del usuario actual)
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskResponse>> getMyTasks(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        List<Task> tasks = taskService.getTasksByAssignee(user.getId());
        List<TaskResponse> response = tasks.stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Iniciar contador de tiempo para una tarea.
     */
    @PostMapping("/{taskId}/start")
    public ResponseEntity<TaskResponse> startTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Task task = taskService.startTask(taskId, user);
        return ResponseEntity.ok(toTaskResponse(task));
    }

    /**
     * Pausar contador de tiempo.
     */
    @PostMapping("/{taskId}/pause")
    public ResponseEntity<TaskResponse> pauseTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Task task = taskService.pauseTask(taskId, user);
        return ResponseEntity.ok(toTaskResponse(task));
    }

    /**
     * Completar tarea.
     */
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<TaskResponse> completeTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        Task task = taskService.completeTask(taskId, user);
        return ResponseEntity.ok(toTaskResponse(task));
    }

    /**
     * Obtener estadísticas de tareas (para Admin)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStats() {
        return ResponseEntity.ok(taskService.getTaskStats());
    }
}
