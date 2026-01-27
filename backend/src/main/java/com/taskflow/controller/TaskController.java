package com.taskflow.controller;

import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.service.TaskService;
import com.taskflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador para la gestión de tareas.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<List<Task>> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(taskService.getTasksByDepartment(deptId));
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
}
