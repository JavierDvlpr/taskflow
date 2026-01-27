-- Script de creación de base de datos para TaskFlow Pro
-- Destino: Supabase (PostgreSQL)

-- 1. Tabla de Departamentos
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Tareas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDIENTE', 'EN_PROGRESO', 'PAUSADA', 'COMPLETADA')),
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    requester_id INTEGER NOT NULL REFERENCES users(id),
    assignee_id INTEGER REFERENCES users(id),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- 4. Tabla de Registros de Tiempo (Time Logs)
CREATE TABLE time_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    duration_minutes BIGINT
);

-- Comentarios sobre el diseño:
-- - Se utilizan SERIAL para IDs autoincrementales.
-- - Las restricciones CHECK aseguran que los ENUMs de Java se respeten en DB.
-- - Se incluyen timestamps para auditoría básica.
-- - Se utiliza ON DELETE SET NULL para departamentos en usuarios para no perder el usuario si se borra el depto.
-- - Se utiliza ON DELETE CASCADE para time_logs si se borra la tarea.

-- Inserción de datos iniciales sugeridos (ADMIN por defecto)
-- La contraseña debería ser cifrada por BCrypt en la aplicación. 
-- Aquí se deja un registro de ejemplo (password: admin123 -> $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqS./T66PVD9tVWhnHLG98t89fV2)
INSERT INTO departments (name, description) VALUES ('Sistemas', 'Departamento de TI y Desarrollo');
INSERT INTO users (email, password, first_name, last_name, role, department_id) 
VALUES ('admin@taskflow.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqS./T66PVD9tVWhnHLG98t89fV2', 'Admin', 'TaskFlow', 'ADMIN', 1);
