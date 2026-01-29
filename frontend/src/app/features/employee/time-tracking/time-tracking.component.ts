import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface TaskForTracking {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timeLogged: number;
  isActive: boolean;
}

interface TimeEntry {
  id: number;
  taskId: number;
  taskTitle: string;
  startTime: string;
  endTime?: string;
  duration: number;
  comment?: string;
}

/**
 * Control de Tiempo del Empleado.
 * Iniciar/pausar/reanudar/finalizar tarea.
 * Agregar comentarios.
 * REGLA: Solo UNA tarea activa a la vez.
 */
@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
    <div class="time-tracking-page">
      <header class="page-header">
        <div>
          <h1>Control de Tiempo</h1>
          <p>Registra tu tiempo de trabajo en cada tarea</p>
        </div>
      </header>

      <!-- Active Timer Section -->
      <div class="timer-section" [class.active]="activeTask()">
        <div class="timer-card" *ngIf="activeTask(); else noActiveTask">
          <div class="timer-status">
            <div class="pulse-dot"></div>
            <span>Tarea activa</span>
          </div>
          
          <h2 class="timer-task-title">{{ activeTask()!.title }}</h2>
          <p class="timer-task-desc">{{ activeTask()!.description | slice:0:100 }}{{ activeTask()!.description.length > 100 ? '...' : '' }}</p>
          
          <div class="timer-display">
            <span class="timer-time">{{ formatElapsedTime(elapsedSeconds()) }}</span>
            <span class="timer-label">Tiempo de sesión actual</span>
          </div>

          <div class="timer-actions">
            <button class="btn btn-pause" *ngIf="isRunning()" (click)="pauseTimer()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
              Pausar
            </button>
            <button class="btn btn-resume" *ngIf="!isRunning() && activeTask()" (click)="resumeTimer()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Reanudar
            </button>
            <button class="btn btn-finish" (click)="openFinishModal()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              Finalizar Sesión
            </button>
            <button class="btn btn-cancel" (click)="cancelActiveSession()" title="Cancelar sin guardar tiempo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancelar
            </button>
          </div>

          <div class="timer-accumulated">
            <span>Tiempo acumulado en esta tarea:</span>
            <strong>{{ formatTime(activeTask()!.timeLogged + elapsedSeconds() / 3600) }}</strong>
          </div>
        </div>

        <ng-template #noActiveTask>
          <div class="no-active-task">
            <div class="no-active-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <h3>No hay tarea activa</h3>
            <p>Selecciona una tarea de la lista para comenzar a registrar tiempo</p>
          </div>
        </ng-template>
      </div>

      <!-- Available Tasks -->
      <div class="tasks-section">
        <h2>Mis Tareas Disponibles</h2>
        <p class="section-hint">Solo puedes tener una tarea activa a la vez</p>

        <div class="tasks-list">
          <div 
            class="task-row" 
            *ngFor="let task of availableTasks()"
            [class.active]="task.id === activeTask()?.id"
            [class.disabled]="activeTask() && task.id !== activeTask()?.id">
            
            <div class="task-priority" [class]="'priority-' + task.priority.toLowerCase()"></div>
            
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">
                {{ getStatusName(task.status) }} • {{ formatTime(task.timeLogged) }} registradas
              </span>
            </div>

            <div class="task-actions">
              <button 
                class="btn-start" 
                *ngIf="!activeTask() && task.status !== 'COMPLETED'"
                (click)="startTask(task)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                Iniciar
              </button>
              <span class="working-badge" *ngIf="task.id === activeTask()?.id">
                <div class="mini-pulse"></div>
                Trabajando
              </span>
              <span class="completed-badge" *ngIf="task.status === 'COMPLETED'">
                ✓ Completada
              </span>
            </div>
          </div>

          <div class="empty-tasks" *ngIf="availableTasks().length === 0">
            <p>No tienes tareas disponibles</p>
          </div>
        </div>
      </div>

      <!-- Today's Entries -->
      <div class="entries-section">
        <h2>Registros de Hoy</h2>
        <div class="entries-list" *ngIf="todayEntries().length > 0">
          <div class="entry-row" *ngFor="let entry of todayEntries()">
            <div class="entry-time">
              {{ entry.startTime | date:'HH:mm' }} - {{ entry.endTime ? (entry.endTime | date:'HH:mm') : 'En curso' }}
            </div>
            <div class="entry-info">
              <span class="entry-task">{{ entry.taskTitle }}</span>
              <span class="entry-comment" *ngIf="entry.comment">{{ entry.comment }}</span>
            </div>
            <div class="entry-duration">
              {{ formatTime(entry.duration) }}
            </div>
          </div>
        </div>
        <div class="no-entries" *ngIf="todayEntries().length === 0">
          <p>No hay registros para hoy</p>
        </div>
      </div>

      <!-- Finish Session Modal -->
      <div class="modal-overlay" *ngIf="showFinishModal()" (click)="closeFinishModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Finalizar Sesión de Trabajo</h2>
            <button class="btn-close" (click)="closeFinishModal()">×</button>
          </div>
          <div class="modal-body">
            <div class="session-summary">
              <div class="summary-item">
                <label>Tarea</label>
                <p>{{ activeTask()?.title }}</p>
              </div>
              <div class="summary-item">
                <label>Tiempo de esta sesión</label>
                <p class="time-highlight">{{ formatElapsedTime(elapsedSeconds()) }}</p>
              </div>
            </div>

            <div class="form-group">
              <label>Comentario (opcional)</label>
              <textarea 
                [(ngModel)]="finishComment" 
                placeholder="¿Qué avanzaste en esta sesión?"
                rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>¿Marcar tarea como completada?</label>
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" [(ngModel)]="markAsCompleted">
                  <span>Sí, la tarea está terminada</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeFinishModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="finishSession()">Guardar y Finalizar</button>
          </div>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .time-tracking-page {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .page-header p {
      color: #6b7280;
      margin: 0.25rem 0 0;
    }

    /* Timer Section */
    .timer-section {
      margin-bottom: 2rem;
    }

    .timer-card {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 1.5rem;
      padding: 2rem;
      color: white;
      text-align: center;
    }

    .timer-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }

    .timer-task-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }

    .timer-task-desc {
      opacity: 0.9;
      margin: 0 0 1.5rem;
      font-size: 0.875rem;
    }

    .timer-display {
      margin-bottom: 1.5rem;
    }

    .timer-time {
      display: block;
      font-size: 4rem;
      font-weight: 700;
      font-family: 'SF Mono', 'Fira Code', monospace;
      line-height: 1;
    }

    .timer-label {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .timer-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-pause {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .btn-pause:hover {
      background: rgba(255,255,255,0.3);
    }

    .btn-resume {
      background: white;
      color: #059669;
    }

    .btn-resume:hover {
      transform: scale(1.05);
    }

    .btn-finish {
      background: rgba(0,0,0,0.2);
      color: white;
    }

    .btn-finish:hover {
      background: rgba(0,0,0,0.3);
    }

    .btn-cancel {
      background: rgba(220,53,69,0.3);
      color: white;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .btn-cancel:hover {
      background: rgba(220,53,69,0.5);
    }

    .timer-accumulated {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .timer-accumulated strong {
      font-size: 1rem;
    }

    .no-active-task {
      background: white;
      border: 2px dashed #d1d5db;
      border-radius: 1.5rem;
      padding: 3rem 2rem;
      text-align: center;
    }

    .no-active-icon {
      color: #9ca3af;
      margin-bottom: 1rem;
    }

    .no-active-task h3 {
      color: #374151;
      margin: 0 0 0.5rem;
    }

    .no-active-task p {
      color: #6b7280;
      margin: 0;
    }

    /* Tasks Section */
    .tasks-section h2,
    .entries-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 0.25rem;
    }

    .section-hint {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem;
    }

    .tasks-list {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .task-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      transition: all 0.2s;
    }

    .task-row:last-child { border-bottom: none; }

    .task-row.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    .task-row.active {
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
    }

    .task-priority {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    .task-priority.priority-low { background: #9ca3af; }
    .task-priority.priority-medium { background: #f59e0b; }
    .task-priority.priority-high { background: #ef4444; }

    .task-info {
      flex: 1;
    }

    .task-info .task-title {
      display: block;
      font-weight: 500;
      color: #111827;
    }

    .task-info .task-meta {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .task-actions {
      display: flex;
      align-items: center;
    }

    .btn-start {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-start:hover {
      background: #059669;
      transform: scale(1.05);
    }

    .working-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #d1fae5;
      color: #065f46;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mini-pulse {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .completed-badge {
      color: #10b981;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .empty-tasks {
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
    }

    /* Entries Section */
    .entries-list {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .entry-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .entry-row:last-child { border-bottom: none; }

    .entry-time {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      color: #6b7280;
      min-width: 120px;
    }

    .entry-info {
      flex: 1;
    }

    .entry-task {
      display: block;
      font-weight: 500;
      color: #111827;
    }

    .entry-comment {
      font-size: 0.75rem;
      color: #6b7280;
      font-style: italic;
    }

    .entry-duration {
      font-weight: 600;
      color: #8b5cf6;
    }

    .no-entries {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      color: #9ca3af;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #9ca3af;
      border-radius: 0.375rem;
    }

    .modal-body { padding: 1.5rem; }

    .session-summary {
      background: #f9fafb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      margin-bottom: 0.75rem;
    }

    .summary-item:last-child { margin-bottom: 0; }

    .summary-item label {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .summary-item p {
      margin: 0;
      font-weight: 500;
      color: #111827;
    }

    .time-highlight {
      font-size: 1.25rem;
      color: #10b981 !important;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-family: inherit;
      resize: none;
    }

    .checkbox-group { margin-top: 0.5rem; }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox input { width: 16px; height: 16px; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-primary {
      background: #10b981;
      color: white;
    }

    .btn-primary:hover {
      background: #059669;
    }
  `]
})
export class TimeTrackingComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  
  availableTasks = signal<TaskForTracking[]>([]);
  activeTask = signal<TaskForTracking | null>(null);
  todayEntries = signal<TimeEntry[]>([]);
  
  isRunning = signal(false);
  elapsedSeconds = signal(0);
  
  showFinishModal = signal(false);
  finishComment = '';
  markAsCompleted = false;
  
  private timerInterval: any = null;
  private sessionStartTime: Date | null = null;

  ngOnInit() {
    this.checkBackendActiveSession();
    this.loadTasks();
    this.loadTodayEntries();
  }
  /**
   * Consulta al backend si hay una tarea activa o pausada
   */
  checkBackendActiveSession() {
    this.http.get<any>(`${environment.apiUrl}/time-logs/active`).subscribe({
      next: (data) => {
        if (data.active && data.timeLog && data.timeLog.task) {
          const t = data.timeLog.task;
          this.activeTask.set({
            id: t.id,
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            timeLogged: (t.totalTimeLogged || 0) / 60,
            isActive: t.status === 'IN_PROGRESS'
          });
          this.isRunning.set(t.status === 'IN_PROGRESS');
          // Si está pausada, no iniciar timer
        } else {
          this.activeTask.set(null);
          this.isRunning.set(false);
        }
      },
      error: () => {
        this.activeTask.set(null);
        this.isRunning.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  loadTasks() {
    this.http.get<any[]>(`${environment.apiUrl}/tasks/my-tasks`)
      .subscribe({
        next: (data) => {
          const tasks = data
            .filter(t => t.status !== 'COMPLETED')
            .map(t => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              status: t.status,
              priority: t.priority,
              timeLogged: (t.totalTimeLogged || 0) / 60, // Convertir minutos a horas
              isActive: false
            }));
          this.availableTasks.set(tasks);
          // Verificar sesión activa DESPUÉS de cargar las tareas
          this.checkActiveSession();
        },
        error: (err) => {
          console.error('Error al cargar tareas:', err);
        }
      });
  }

  loadTodayEntries() {
    this.http.get<any[]>(`${environment.apiUrl}/time-logs/today`)
      .subscribe({
        next: (data) => {
          const entries = data
            .filter(e => e.endTime) // Solo mostrar registros finalizados
            .map(e => ({
              id: e.id,
              taskId: e.task?.id,
              taskTitle: e.task?.title || 'Tarea',
              startTime: e.startTime,
              endTime: e.endTime,
              duration: e.durationMinutes ? e.durationMinutes / 60 : 0, // de minutos a horas
              comment: ''
            }));
          this.todayEntries.set(entries);
        },
        error: (err) => {
          console.error('Error al cargar entradas de hoy:', err);
        }
      });
  }

  checkActiveSession() {
    // Verificar si hay una sesión activa guardada
    const savedSession = localStorage.getItem('activeTimeSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const task = this.availableTasks().find(t => t.id === session.taskId);
      if (task) {
        this.activeTask.set(task);
        this.sessionStartTime = new Date(session.startTime);
        this.elapsedSeconds.set(Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000));
        if (session.isRunning) {
          this.startTimer();
        }
      }
    }
  }

  startTask(task: TaskForTracking) {
    if (this.activeTask()) return; // Solo una tarea activa
    
    // Primero notificar al backend
    this.http.post(`${environment.apiUrl}/time-logs/start/${task.id}`, {})
      .subscribe({ 
        next: (response) => {
          console.log('Tarea iniciada en backend:', response);
          // Solo actualizar UI si el backend respondió OK
          this.activeTask.set(task);
          this.sessionStartTime = new Date();
          this.elapsedSeconds.set(0);
          this.isRunning.set(true);
          this.saveSession();
          this.startTimer();
          // Recargar tareas para ver el nuevo estado
          this.loadTasks();
        },
        error: (err) => {
          console.error('Error al iniciar registro:', err);
          alert('Error al iniciar la tarea: ' + (err.error?.error || err.message || 'Error desconocido'));
        }
      });
  }

  startTimer() {
    this.isRunning.set(true);
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(v => v + 1);
    }, 1000);
  }

  pauseTimer() {
    this.isRunning.set(false);
    this.clearTimer();
    this.saveSession();
  }

  resumeTimer() {
    const task = this.activeTask();
    if (!task) return;
    // Llama al backend para reanudar (cambia a IN_PROGRESS)
    this.http.post(`${environment.apiUrl}/time-logs/start/${task.id}`, {}).subscribe({
      next: () => {
        this.isRunning.set(true);
        this.startTimer();
        this.saveSession();
        this.loadTasks();
      },
      error: (err) => {
        alert('Error al reanudar la tarea: ' + (err.error?.error || err.message || 'Error desconocido'));
      }
    });
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  saveSession() {
    if (this.activeTask() && this.sessionStartTime) {
      localStorage.setItem('activeTimeSession', JSON.stringify({
        taskId: this.activeTask()!.id,
        startTime: this.sessionStartTime.toISOString(),
        isRunning: this.isRunning()
      }));
    }
  }

  openFinishModal() {
    this.pauseTimer();
    this.showFinishModal.set(true);
  }

  closeFinishModal() {
    this.showFinishModal.set(false);
    this.finishComment = '';
    this.markAsCompleted = false;
  }

  finishSession() {
    const task = this.activeTask();
    if (!task) return;
    
    // Detener en el backend
    this.http.post(`${environment.apiUrl}/time-logs/stop`, {
      description: this.finishComment
    }).subscribe({
        next: (response) => {
          console.log('Sesión finalizada:', response);
          
          // Si se marca como completada, actualizar la tarea
          if (this.markAsCompleted) {
            this.http.post(`${environment.apiUrl}/tasks/${task.id}/complete`, {})
              .subscribe({ 
                next: () => {
                  console.log('Tarea marcada como completada');
                  this.resetSession();
                },
                error: (err) => {
                  console.error('Error al completar tarea:', err);
                  this.resetSession();
                }
              });
          } else {
            this.resetSession();
          }
        },
        error: (err) => {
          console.error('Error al detener registro:', err);
          this.resetSession();
        }
      });
  }

  cancelActiveSession() {
    if (!confirm('¿Cancelar sesión activa? El tiempo no se guardará.')) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/time-logs/cancel-active`).subscribe({
      next: () => {
        console.log('Sesión cancelada');
        this.resetSession();
      },
      error: (err) => {
        console.error('Error al cancelar sesión:', err);
        // Intentar limpiar de todas formas
        this.resetSession();
      }
    });
  }

  resetSession() {
    this.clearTimer();
    localStorage.removeItem('activeTimeSession');
    this.activeTask.set(null);
    this.elapsedSeconds.set(0);
    this.isRunning.set(false);
    this.closeFinishModal();
    this.checkBackendActiveSession();
    this.loadTasks();
    this.loadTodayEntries();
  }

  formatElapsedTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  formatTime(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  getStatusName(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  }
}
