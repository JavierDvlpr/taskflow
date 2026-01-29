package com.taskflow.config;

import com.taskflow.entity.*;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Inicializa solo el usuario administrador al arrancar la aplicación.
 * Los demás datos (usuarios, departamentos, tareas) se crean desde el panel de admin.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // No ejecutar durante tests
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final TaskRepository taskRepository;
    private final TimeLogRepository timeLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("==============================================");
        log.info("Iniciando TaskFlow PRO - Modo Producción");
        log.info("==============================================");
        
        try {
            // Verificar si hay datos existentes
            long usersCount = userRepository.count();
            long deptCount = departmentRepository.count();
            long tasksCount = taskRepository.count();
            
            log.info("Estado actual de la base de datos:");
            log.info("  - Usuarios: {}", usersCount);
            log.info("  - Departamentos: {}", deptCount);
            log.info("  - Tareas: {}", tasksCount);
            
            // Solo crear admin si no existe ningún usuario admin
            if (userRepository.findByEmail("admin@taskflow.com").isEmpty()) {
                createAdmin();
            } else {
                log.info("Usuario admin ya existe.");
            }
            
            log.info("==============================================");
            log.info("Sistema listo. Credenciales de administrador:");
            log.info("  Email: admin@taskflow.com");
            log.info("  Password: admin123");
            log.info("==============================================");
            
        } catch (Exception e) {
            log.error("Error durante la inicialización: {}", e.getMessage());
        }
    }

    private void createAdmin() {
        log.info("Creando usuario administrador...");
        
        User admin = User.builder()
            .email("admin@taskflow.com")
            .password(passwordEncoder.encode("admin123"))
            .firstName("Administrador")
            .lastName("Sistema")
            .role(UserRole.ADMIN)
            .department(null) // Sin departamento asignado
            .active(true)
            .build();
        
        userRepository.save(admin);
        log.info("✓ Usuario administrador creado exitosamente");
    }
}
