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

import java.time.LocalDateTime;
import java.util.List;

/**
 * Inicializa datos de prueba al arrancar la aplicación.
 * Solo se ejecuta si no hay datos previos.
 * 
 * NOTA: Si ves errores de constraint, ejecuta primero el script:
 * database/seed_data.sql en Supabase para actualizar las restricciones.
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
        log.info("Verificando datos iniciales...");
        
        try {
            // Crear departamentos si no existen
            if (departmentRepository.count() == 0) {
                createDepartments();
            }
            
            // Crear admin si no existe
            if (userRepository.findByEmail("admin@taskflow.com").isEmpty()) {
                createAdmin();
            }
            
            // Crear empleados de prueba si hay muy pocos usuarios
            if (userRepository.count() < 5) {
                createSampleEmployees();
            }
            
            // Crear tareas de prueba si no hay
            if (taskRepository.count() == 0) {
                createSampleTasks();
            }
            
            log.info("Datos iniciales verificados correctamente.");
        } catch (Exception e) {
            log.warn("Error al crear datos iniciales: {}. Ejecuta database/seed_data.sql en Supabase para actualizar las restricciones.", e.getMessage());
        }
    }

    private void createDepartments() {
        log.info("Creando departamentos...");
        
        List<Department> departments = List.of(
            Department.builder().name("Tecnología").description("Desarrollo de software, infraestructura y soporte técnico").build(),
            Department.builder().name("Recursos Humanos").description("Gestión del talento, contratación y bienestar laboral").build(),
            Department.builder().name("Marketing").description("Estrategias de marketing, branding y comunicación").build(),
            Department.builder().name("Finanzas").description("Contabilidad, presupuestos y análisis financiero").build(),
            Department.builder().name("Operaciones").description("Logística, procesos y mejora continua").build()
        );
        
        departmentRepository.saveAll(departments);
        log.info("Creados {} departamentos", departments.size());
    }

    private void createAdmin() {
        log.info("Creando usuario administrador...");
        
        Department techDept = departmentRepository.findAll().stream()
            .filter(d -> d.getName().equals("Tecnología"))
            .findFirst()
            .orElse(null);
        
        User admin = User.builder()
            .email("admin@taskflow.com")
            .password(passwordEncoder.encode("admin123"))
            .firstName("Carlos")
            .lastName("Administrador")
            .role(UserRole.ADMIN)
            .department(techDept)
            .active(true)
            .build();
        
        userRepository.save(admin);
        log.info("Admin creado: admin@taskflow.com / admin123");
    }

    private void createSampleEmployees() {
        log.info("Creando empleados de prueba...");
        
        List<Department> departments = departmentRepository.findAll();
        Department techDept = departments.stream().filter(d -> d.getName().equals("Tecnología")).findFirst().orElse(departments.get(0));
        Department hrDept = departments.stream().filter(d -> d.getName().equals("Recursos Humanos")).findFirst().orElse(departments.get(0));
        Department mktDept = departments.stream().filter(d -> d.getName().equals("Marketing")).findFirst().orElse(departments.get(0));
        Department finDept = departments.stream().filter(d -> d.getName().equals("Finanzas")).findFirst().orElse(departments.get(0));
        
        String defaultPassword = passwordEncoder.encode("password123");
        
        List<User> employees = List.of(
            // Tecnología
            User.builder().email("juan.perez@taskflow.com").password(defaultPassword).firstName("Juan").lastName("Pérez").role(UserRole.EMPLOYEE).department(techDept).active(true).build(),
            User.builder().email("maria.garcia@taskflow.com").password(defaultPassword).firstName("María").lastName("García").role(UserRole.EMPLOYEE).department(techDept).active(true).build(),
            // Recursos Humanos
            User.builder().email("ana.martinez@taskflow.com").password(defaultPassword).firstName("Ana").lastName("Martínez").role(UserRole.EMPLOYEE).department(hrDept).active(true).build(),
            // Marketing
            User.builder().email("sofia.lopez@taskflow.com").password(defaultPassword).firstName("Sofía").lastName("López").role(UserRole.EMPLOYEE).department(mktDept).active(true).build(),
            // Finanzas
            User.builder().email("carmen.diaz@taskflow.com").password(defaultPassword).firstName("Carmen").lastName("Díaz").role(UserRole.EMPLOYEE).department(finDept).active(true).build()
        );
        
        for (User emp : employees) {
            if (userRepository.findByEmail(emp.getEmail()).isEmpty()) {
                userRepository.save(emp);
            }
        }
        
        log.info("Creados empleados de prueba. Password: password123");
    }

    private void createSampleTasks() {
        log.info("Creando tareas de prueba...");
        
        User admin = userRepository.findByEmail("admin@taskflow.com").orElse(null);
        if (admin == null) return;
        
        List<Department> departments = departmentRepository.findAll();
        Department techDept = departments.stream().filter(d -> d.getName().equals("Tecnología")).findFirst().orElse(departments.get(0));
        Department mktDept = departments.stream().filter(d -> d.getName().equals("Marketing")).findFirst().orElse(departments.get(0));
        
        User juanPerez = userRepository.findByEmail("juan.perez@taskflow.com").orElse(null);
        User mariaGarcia = userRepository.findByEmail("maria.garcia@taskflow.com").orElse(null);
        User sofiaLopez = userRepository.findByEmail("sofia.lopez@taskflow.com").orElse(null);
        
        List<Task> tasks = List.of(
            Task.builder()
                .title("Implementar autenticación JWT")
                .description("Desarrollar sistema de autenticación seguro con tokens JWT para la API REST")
                .status(TaskStatus.COMPLETED)
                .priority(Priority.HIGH)
                .department(techDept)
                .requester(admin)
                .assignee(juanPerez)
                .build(),
            Task.builder()
                .title("Optimizar consultas de base de datos")
                .description("Revisar y optimizar las queries más lentas identificadas en el monitoreo")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.MEDIUM)
                .department(techDept)
                .requester(admin)
                .assignee(mariaGarcia)
                .build(),
            Task.builder()
                .title("Configurar CI/CD en GitHub Actions")
                .description("Implementar pipeline de integración continua para automatizar deploys")
                .status(TaskStatus.PENDING)
                .priority(Priority.HIGH)
                .department(techDept)
                .requester(admin)
                .assignee(juanPerez)
                .build(),
            Task.builder()
                .title("Campaña redes sociales Q1")
                .description("Diseñar y programar contenido para redes sociales del primer trimestre")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.HIGH)
                .department(mktDept)
                .requester(admin)
                .assignee(sofiaLopez)
                .build(),
            Task.builder()
                .title("Documentar API REST")
                .description("Crear documentación Swagger/OpenAPI para todos los endpoints")
                .status(TaskStatus.PENDING)
                .priority(Priority.LOW)
                .department(techDept)
                .requester(admin)
                .assignee(null)
                .build()
        );
        
        taskRepository.saveAll(tasks);
        log.info("Creadas {} tareas de prueba", tasks.size());
        
        // Crear algunos registros de tiempo
        createSampleTimeLogs();
    }

    private void createSampleTimeLogs() {
        Task jwtTask = taskRepository.findAll().stream()
            .filter(t -> t.getTitle().contains("JWT"))
            .findFirst()
            .orElse(null);
        
        User juanPerez = userRepository.findByEmail("juan.perez@taskflow.com").orElse(null);
        
        if (jwtTask != null && juanPerez != null) {
            List<TimeLog> logs = List.of(
                TimeLog.builder()
                    .task(jwtTask)
                    .user(juanPerez)
                    .startTime(LocalDateTime.now().minusDays(5).withHour(9))
                    .endTime(LocalDateTime.now().minusDays(5).withHour(12))
                    .durationMinutes(180L)
                    .build(),
                TimeLog.builder()
                    .task(jwtTask)
                    .user(juanPerez)
                    .startTime(LocalDateTime.now().minusDays(5).withHour(14))
                    .endTime(LocalDateTime.now().minusDays(5).withHour(18))
                    .durationMinutes(240L)
                    .build(),
                TimeLog.builder()
                    .task(jwtTask)
                    .user(juanPerez)
                    .startTime(LocalDateTime.now().minusDays(4).withHour(9))
                    .endTime(LocalDateTime.now().minusDays(4).withHour(13))
                    .durationMinutes(240L)
                    .build()
            );
            
            timeLogRepository.saveAll(logs);
            log.info("Creados {} registros de tiempo de prueba", logs.size());
        }
    }
}
