package com.taskflow.controller;

import com.taskflow.entity.Department;
import com.taskflow.entity.User;
import com.taskflow.service.DepartmentService;
import com.taskflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de departamentos.
 * Solo ADMIN puede crear, editar y eliminar departamentos.
 */
@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;
    private final UserService userService;

    /**
     * Crear departamento (solo ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.createDepartment(department));
    }

    /**
     * Obtener todos los departamentos
     */
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    /**
     * Obtener departamento por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    /**
     * Actualizar departamento (solo ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    /**
     * Eliminar departamento (solo ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener usuarios de un departamento
     */
    @GetMapping("/{id}/users")
    public ResponseEntity<List<User>> getDepartmentUsers(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUsersByDepartment(id));
    }

    /**
     * Obtener estadísticas de departamentos
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDepartmentStats() {
        List<Department> departments = departmentService.getAllDepartments();
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", departments.size());
        stats.put("departments", departments);
        return ResponseEntity.ok(stats);
    }
}
