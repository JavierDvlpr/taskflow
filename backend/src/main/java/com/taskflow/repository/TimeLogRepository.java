package com.taskflow.repository;

import com.taskflow.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad TimeLog.
 */
public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    
    // Buscar registros activos de un usuario (donde endTime es null)
    Optional<TimeLog> findByUserIdAndEndTimeIsNull(Long userId);
    
    // Listar todos los registros de una tarea
    List<TimeLog> findByTaskId(Long taskId);
}
