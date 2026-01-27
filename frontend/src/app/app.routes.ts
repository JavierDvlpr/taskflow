import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, employeeGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ===== AUTH ROUTES (públicas) =====
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  // Registro deshabilitado - Solo el Admin crea usuarios
  // {
  //   path: 'register',
  //   loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  // },

  // ===== ADMIN ROUTES =====
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users/users-management.component').then(m => m.UsersManagementComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/departments',
    loadComponent: () => import('./features/admin/departments/departments-management.component').then(m => m.DepartmentsManagementComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/tasks',
    loadComponent: () => import('./features/admin/tasks/admin-tasks.component').then(m => m.AdminTasksComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/reports',
    loadComponent: () => import('./features/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent),
    canActivate: [authGuard, adminGuard]
  },

  // ===== EMPLOYEE ROUTES =====
  {
    path: 'employee/dashboard',
    loadComponent: () => import('./features/employee/dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./features/employee/my-tasks/my-tasks.component').then(m => m.MyTasksComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'time-tracking',
    loadComponent: () => import('./features/employee/time-tracking/time-tracking.component').then(m => m.TimeTrackingComponent),
    canActivate: [authGuard, employeeGuard]
  },
  {
    path: 'my-history',
    loadComponent: () => import('./features/employee/history/my-history.component').then(m => m.MyHistoryComponent),
    canActivate: [authGuard, employeeGuard]
  },

  // ===== DASHBOARD REDIRECT (basado en rol) =====
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // ===== DEFAULT ROUTES =====
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
