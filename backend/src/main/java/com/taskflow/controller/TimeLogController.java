package com.taskflow.controller;

import com.taskflow.entity.Task;
import com.taskflow.entity.TimeLog;
import com.taskflow.entity.User;
import com.taskflow.repository.TimeLogRepository;
import com.taskflow.service.TaskService;
import com.taskflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controlador para el registro de tiempo.
 */
@RestController
@RequestMapping("/api/time-logs")
@RequiredArgsConstructor
public class TimeLogController {

    private final TimeLogRepository timeLogRepository;
    private final UserService userService;
    private final TaskService taskService;

    /**
     * Iniciar registro de tiempo en una tarea
     */
    @PostMapping("/start/{taskId}")
    public ResponseEntity<?> startTimeLog(@PathVariable Long taskId, Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        
        // Verificar si ya tiene una tarea activa
        Optional<TimeLog> activeLog = timeLogRepository.findByUserIdAndEndTimeIsNull(user.getId());
        if (activeLog.isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Ya tienes una tarea en progreso. Finalízala primero.");
            return ResponseEntity.badRequest().body(error);
        }
        
        Task task = taskService.getTaskById(taskId);
        
        TimeLog log = TimeLog.builder()
                .user(user)
                .task(task)
                .startTime(LocalDateTime.now())
                .build();
        
        return ResponseEntity.ok(timeLogRepository.save(log));
    }

    /**
     * Detener registro de tiempo activo
     */
    @PostMapping("/stop")
    public ResponseEntity<?> stopTimeLog(Authentication auth, @RequestBody(required = false) Map<String, String> body) {
        User user = userService.getUserByEmail(auth.getName());
        
        Optional<TimeLog> activeLog = timeLogRepository.findByUserIdAndEndTimeIsNull(user.getId());
        if (activeLog.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No tienes ninguna tarea activa.");
            return ResponseEntity.badRequest().body(error);
        }
        
        TimeLog log = activeLog.get();
        log.setEndTime(LocalDateTime.now());
        
        // Calcular duración en minutos
        long minutes = Duration.between(log.getStartTime(), log.getEndTime()).toMinutes();
        log.setDurationMinutes(minutes);
        
        return ResponseEntity.ok(timeLogRepository.save(log));
    }

    /**
     * Obtener tarea activa del usuario actual
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveTimeLog(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        Optional<TimeLog> activeLog = timeLogRepository.findByUserIdAndEndTimeIsNull(user.getId());
        
        if (activeLog.isEmpty()) {
            return ResponseEntity.ok(Map.of("active", false));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("active", true);
        response.put("timeLog", activeLog.get());
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener historial del usuario actual
     */
    @GetMapping("/my-history")
    public ResponseEntity<List<TimeLog>> getMyHistory(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(timeLogRepository.findByUserIdOrderByStartTimeDesc(user.getId()));
    }

    /**
     * Obtener registros de hoy del usuario actual
     */
    @GetMapping("/today")
    public ResponseEntity<List<TimeLog>> getTodayLogs(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return ResponseEntity.ok(timeLogRepository.findTodayByUserId(user.getId(), startOfDay, endOfDay));
    }

    /**
     * Obtener estadísticas del usuario actual
     */
    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyStats(Authentication auth) {
        User user = userService.getUserByEmail(auth.getName());
        
        Long totalMinutes = timeLogRepository.getTotalMinutesByUser(user.getId());
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        List<TimeLog> todayLogs = timeLogRepository.findTodayByUserId(user.getId(), startOfDay, endOfDay);
        long todayMinutes = todayLogs.stream()
                .mapToLong(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                .sum();
        
        // Calcular horas de la semana
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(LocalDateTime.now().getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfWeek = LocalDateTime.now();
        List<TimeLog> weekLogs = timeLogRepository.findByUserIdAndDateRange(user.getId(), startOfWeek, endOfWeek);
        long weekMinutes = weekLogs.stream()
                .mapToLong(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                .sum();
        
        // Calcular horas del mes
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<TimeLog> monthLogs = timeLogRepository.findByUserIdAndDateRange(user.getId(), startOfMonth, endOfWeek);
        long monthMinutes = monthLogs.stream()
                .mapToLong(log -> log.getDurationMinutes() != null ? log.getDurationMinutes() : 0)
                .sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalHours", totalMinutes / 60.0);
        stats.put("todayHours", Math.round(todayMinutes / 6.0) / 10.0);
        stats.put("weekHours", Math.round(weekMinutes / 6.0) / 10.0);
        stats.put("monthHours", Math.round(monthMinutes / 6.0) / 10.0);
        stats.put("todayEntries", todayLogs.size());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Obtener registros de una tarea específica
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeLog>> getTaskTimeLogs(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeLogRepository.findByTaskId(taskId));
    }
}
