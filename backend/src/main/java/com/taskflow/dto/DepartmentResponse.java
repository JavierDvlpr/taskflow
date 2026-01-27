package com.taskflow.dto;

import com.taskflow.entity.Department;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para respuestas de Department con usuarios.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private int usersCount;
    private List<UserSummary> users;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String role;
    }

    /**
     * Convierte una entidad Department a DepartmentResponse.
     */
    public static DepartmentResponse fromEntity(Department dept, List<UserSummary> users) {
        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .createdAt(dept.getCreatedAt())
                .usersCount(users != null ? users.size() : 0)
                .users(users)
                .build();
    }
}
