package com.taskflow.dto;

import com.taskflow.entity.UserRole;
import lombok.Data;

/**
 * DTO para el registro y respuesta de usuario.
 */
@Data
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private Long departmentId;
    private String departmentName;
}
