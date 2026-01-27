package com.taskflow.service;

import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar la lógica de negocio de los usuarios.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.max-users:50}")
    private int maxUsers;

    /**
     * Crea un nuevo usuario cifrando su contraseña.
     * Limita a máximo 50 usuarios para evitar abusos.
     */
    @Transactional
    public User createUser(User user) {
        long currentCount = userRepository.count();
        if (currentCount >= maxUsers) {
            throw new IllegalStateException("Límite de usuarios alcanzado (" + maxUsers + "). No se pueden crear más usuarios.");
        }
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado: " + user.getEmail());
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Obtiene todos los usuarios.
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Busca un usuario por su ID.
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    /**
     * Busca un usuario por su email.
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    /**
     * Actualiza un usuario existente.
     */
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setRole(userDetails.getRole());
        user.setDepartment(userDetails.getDepartment());
        user.setActive(userDetails.isActive());
        
        // Solo actualizar contraseña si viene una nueva
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }

    /**
     * Elimina un usuario.
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    /**
     * Obtiene el conteo de usuarios.
     */
    @Transactional(readOnly = true)
    public long getUserCount() {
        return userRepository.count();
    }

    /**
     * Cambia el estado activo/inactivo de un usuario.
     */
    @Transactional
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    /**
     * Obtiene usuarios por departamento.
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId);
    }
}
