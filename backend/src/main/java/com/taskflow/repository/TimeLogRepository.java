package com.taskflow.repository;

import com.taskflow.entity.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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
    
    // Listar todos los registros de un usuario
    List<TimeLog> findByUserIdOrderByStartTimeDesc(Long userId);
    
    // Registros de un usuario en un rango de fechas
    @Query("SELECT t FROM TimeLog t WHERE t.user.id = :userId AND t.startTime >= :startDate AND t.startTime <= :endDate ORDER BY t.startTime DESC")
    List<TimeLog> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Total de minutos por usuario
    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.user.id = :userId")
    Long getTotalMinutesByUser(@Param("userId") Long userId);
    
    // Total de minutos por tarea
    @Query("SELECT COALESCE(SUM(t.durationMinutes), 0) FROM TimeLog t WHERE t.task.id = :taskId")
    Long getTotalMinutesByTask(@Param("taskId") Long taskId);
    
    // Registros de hoy para un usuario (usando rango de fechas)
    @Query("SELECT t FROM TimeLog t WHERE t.user.id = :userId AND t.startTime >= :startOfDay AND t.startTime < :endOfDay ORDER BY t.startTime DESC")
    List<TimeLog> findTodayByUserId(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}
