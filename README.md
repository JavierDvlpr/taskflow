# 🚀 TaskFlow PRO

Sistema de gestión de tareas empresarial con roles de Administrador y Empleado.

## 📋 Características

- ✅ **Admin Dashboard** - Panel completo para administradores
- ✅ **Gestión de Usuarios** - Crear, editar, activar/desactivar empleados
- ✅ **Gestión de Departamentos** - Organizar equipos
- ✅ **Gestión de Tareas** - Asignar tareas con prioridades
- ✅ **Employee Dashboard** - Panel para empleados
- ✅ **Mis Tareas** - Los empleados ven solo sus tareas asignadas
- ✅ **Registro de Tiempo** - Control de horas trabajadas
- ✅ **Reportes** - Estadísticas y métricas

## 🛠️ Tecnologías

| Backend | Frontend |
|---------|----------|
| Java 21 | Angular 17 |
| Spring Boot 3.2 | TypeScript |
| PostgreSQL (Supabase) | TailwindCSS |
| JWT Auth | Standalone Components |

## ⚡ Inicio Rápido

### Opción 1: Un solo comando (recomendado)
```bash
# Doble clic en:
start-all.bat
```
Esto abre Backend y Frontend en ventanas separadas.

### Opción 2: Por separado
```bash
# Terminal 1 - Backend
start-backend.bat

# Terminal 2 - Frontend
start-frontend.bat
```

### Opción 3: Manual
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

## 🔧 Configuración

1. Copia `.env.example` a `.env`
2. Configura tus credenciales de base de datos
3. Ejecuta `start-all.bat`

## 📍 URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8081 |
| Swagger UI | http://localhost:8081/swagger-ui.html |

## 👤 Usuarios de Prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | ADMIN |
| empleado | emp123 | EMPLOYEE |

## 📁 Estructura

```
TaskFlow PRO/
├── backend/               # Spring Boot API
│   ├── src/main/java/    # Código Java
│   └── pom.xml           # Dependencias Maven
├── frontend/             # Angular App
│   ├── src/app/
│   │   ├── core/         # Servicios, guards, interceptors
│   │   └── features/     # Módulos funcionales
│   │       ├── admin/    # Dashboards y gestión admin
│   │       ├── employee/ # Vistas de empleado
│   │       ├── auth/     # Login
│   │       └── dashboard/# Redirect por rol
│   └── package.json
├── start-all.bat         # 🚀 Inicia todo
├── start-backend.bat     # Solo backend
├── start-frontend.bat    # Solo frontend
└── .env.example          # Template de configuración
```

## 📝 Licencia

MIT License
