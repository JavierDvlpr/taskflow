-- =====================================================
-- Script para LIMPIAR TODOS LOS DATOS de TaskFlow PRO
-- =====================================================
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- de la base de datos. Ejecútalo con precaución.
-- =====================================================

-- Desactivar temporalmente las restricciones de FK
SET session_replication_role = 'replica';

-- 1. Eliminar todos los registros de tiempo
DELETE FROM time_logs;
SELECT 'Registros de tiempo eliminados' as status;

-- 2. Eliminar todas las tareas
DELETE FROM tasks;
SELECT 'Tareas eliminadas' as status;

-- 3. Eliminar todos los usuarios (excepto el admin que se recreará)
DELETE FROM users;
SELECT 'Usuarios eliminados' as status;

-- 4. Eliminar todos los departamentos
DELETE FROM departments;
SELECT 'Departamentos eliminados' as status;

-- Reactivar las restricciones de FK
SET session_replication_role = 'origin';

-- Reiniciar las secuencias (opcional, para que los IDs empiecen desde 1)
ALTER SEQUENCE IF EXISTS time_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS departments_id_seq RESTART WITH 1;

SELECT '========================================' as mensaje;
SELECT 'Base de datos limpiada exitosamente' as mensaje;
SELECT 'Al reiniciar el backend, se creará:' as mensaje;
SELECT '  - Usuario: admin@taskflow.com' as mensaje;
SELECT '  - Password: admin123' as mensaje;
SELECT '========================================' as mensaje;
