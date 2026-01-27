package com.taskflow.controller;

import com.taskflow.entity.Task;
import com.taskflow.entity.User;
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

/**
 * Controlador para la gestión de tareas.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    /**
     * Crear tarea (solo ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    /**
     * Obtener todas las tareas
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    /**
     * Obtener tarea por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
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
    public ResponseEntity<List<Task>> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(taskService.getTasksByDepartment(deptId));
    }

    /**
     * Obtener MIS tareas (del usuario actual)
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(taskService.getTasksByAssignee(user.getId()));
    }

    /**
     * Iniciar contador de tiempo para una tarea.
     */
    @PostMapping("/{taskId}/start")
    public ResponseEntity<Task> startTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.startTask(taskId, user));
    }

    /**
     * Pausar contador de tiempo.
     */
    @PostMapping("/{taskId}/pause")
    public ResponseEntity<Task> pauseTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.pauseTask(taskId, user));
    }

    /**
     * Completar tarea.
     */
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<Task> completeTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.completeTask(taskId, user));
    }

    /**
     * Obtener estadísticas de tareas (para Admin)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStats() {
        return ResponseEntity.ok(taskService.getTaskStats());
    }
}
