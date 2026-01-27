package com.taskflow.repository;

import com.taskflow.entity.User;
import com.taskflow.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(UserRole role);
    long countByRole(UserRole role);
}
