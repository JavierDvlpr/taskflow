import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Panel de Control</h1>
      <p>Bienvenido a TaskFlow Pro. Aquí verás tus tareas pronto.</p>
    </div>
  `
})
export class DashboardComponent {}
