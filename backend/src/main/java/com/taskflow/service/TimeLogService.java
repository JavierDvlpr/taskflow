package com.taskflow.service;

import com.taskflow.entity.TimeLog;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.BusinessException;
import com.taskflow.repository.TimeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio para gestionar el registro de tiempo.
 */
@Service
@RequiredArgsConstructor
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;

    /**
     * Inicia un registro de tiempo para un usuario en una tarea específica.
     * RF6.1: Un usuario no puede tener más de una tarea activa simultáneamente.
     */
    @Transactional
    public TimeLog startTimeLog(User user, Task task) {
        // Verificar si el usuario ya tiene un registro activo
        Optional<TimeLog> activeLog = timeLogRepository.findByUserIdAndEndTimeIsNull(user.getId());
        if (activeLog.isPresent()) {
            throw new BusinessException("El usuario ya tiene una tarea en progreso");
        }

        TimeLog log = TimeLog.builder()
                .user(user)
                .task(task)
                .startTime(LocalDateTime.now())
                .build();

        return timeLogRepository.save(log);
    }

    /**
     * Finaliza un registro de tiempo activo.
     */
    @Transactional
    public TimeLog stopTimeLog(User user) {
        TimeLog activeLog = timeLogRepository.findByUserIdAndEndTimeIsNull(user.getId())
                .orElseThrow(() -> new BusinessException("No hay ningún registro de tiempo activo para este usuario"));

        activeLog.setEndTime(LocalDateTime.now());
        
        // Calcular duración en minutos (RF5.5)
        long minutes = Duration.between(activeLog.getStartTime(), activeLog.getEndTime()).toMinutes();
        activeLog.setDurationMinutes(minutes);

        return timeLogRepository.save(activeLog);
    }
}
