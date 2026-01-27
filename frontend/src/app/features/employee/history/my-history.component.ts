import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface HistoryEntry {
  id: number;
  date: string;
  taskId: number;
  taskTitle: string;
  startTime: string;
  endTime: string;
  duration: number;
  comment?: string;
}

interface DaySummary {
  date: string;
  totalHours: number;
  entries: HistoryEntry[];
}

/**
 * Historial Personal del Empleado.
 * Ver tiempo trabajado, filtrar por fechas.
 */
@Component({
  selector: 'app-my-history',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
    <div class="history-page">
      <header class="page-header">
        <div>
          <h1>Mi Historial</h1>
          <p>Revisa tu registro de tiempo trabajado</p>
        </div>
      </header>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-icon today">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div class="summary-content">
            <span class="summary-value">{{ stats().todayHours }}h</span>
            <span class="summary-label">Horas Hoy</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon week">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="summary-content">
            <span class="summary-value">{{ stats().weekHours }}h</span>
            <span class="summary-label">Esta Semana</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon month">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
          </div>
          <div class="summary-content">
            <span class="summary-value">{{ stats().monthHours }}h</span>
            <span class="summary-label">Este Mes</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon tasks">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="summary-content">
            <span class="summary-value">{{ stats().tasksCompleted }}</span>
            <span class="summary-label">Tareas Completadas</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="date-filters">
          <div class="date-input">
            <label>Desde</label>
            <input type="date" [(ngModel)]="dateFrom" (change)="loadHistory()">
          </div>
          <div class="date-input">
            <label>Hasta</label>
            <input type="date" [(ngModel)]="dateTo" (change)="loadHistory()">
          </div>
        </div>
        <div class="quick-filters">
          <button class="quick-btn" [class.active]="quickFilter === 'today'" (click)="setQuickFilter('today')">Hoy</button>
          <button class="quick-btn" [class.active]="quickFilter === 'week'" (click)="setQuickFilter('week')">Esta Semana</button>
          <button class="quick-btn" [class.active]="quickFilter === 'month'" (click)="setQuickFilter('month')">Este Mes</button>
        </div>
      </div>

      <!-- History by Day -->
      <div class="history-container">
        <div class="day-group" *ngFor="let day of groupedHistory()">
          <div class="day-header">
            <div class="day-date">
              <span class="day-name">{{ getDayName(day.date) }}</span>
              <span class="day-full">{{ day.date | date:'d MMMM yyyy' }}</span>
            </div>
            <div class="day-total">
              <span class="total-hours">{{ formatTime(day.totalHours) }}</span>
              <span class="total-label">Total</span>
            </div>
          </div>
          
          <div class="entries-list">
            <div class="entry-item" *ngFor="let entry of day.entries">
              <div class="entry-time-range">
                <span class="time-start">{{ entry.startTime | date:'HH:mm' }}</span>
                <span class="time-separator">→</span>
                <span class="time-end">{{ entry.endTime | date:'HH:mm' }}</span>
              </div>
              <div class="entry-details">
                <span class="entry-task">{{ entry.taskTitle }}</span>
                <span class="entry-comment" *ngIf="entry.comment">"{{ entry.comment }}"</span>
              </div>
              <div class="entry-duration">
                {{ formatTime(entry.duration) }}
              </div>
            </div>
          </div>
        </div>

        <div class="empty-history" *ngIf="groupedHistory().length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M3 3v5h5"/>
            <path d="M3.05 13A9 9 0 106 5.3L3 8"/>
            <path d="M12 7v5l4 2"/>
          </svg>
          <h3>Sin registros</h3>
          <p>No hay registros de tiempo para el período seleccionado</p>
        </div>
      </div>

      <!-- Weekly Chart -->
      <div class="chart-section">
        <h2>Distribución Semanal</h2>
        <div class="week-chart">
          <div class="chart-bar" *ngFor="let bar of weeklyChart()">
            <div class="bar-fill" [style.height.%]="bar.percentage"></div>
            <span class="bar-value">{{ bar.hours }}h</span>
            <span class="bar-label">{{ bar.day }}</span>
          </div>
        </div>
      </div>
    </div>
    </app-layout>
  `,
  styles: [`
    .history-page {
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

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .summary-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .summary-icon.today { background: #ede9fe; color: #7c3aed; }
    .summary-icon.week { background: #dbeafe; color: #2563eb; }
    .summary-icon.month { background: #d1fae5; color: #059669; }
    .summary-icon.tasks { background: #fef3c7; color: #d97706; }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .summary-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* Filters */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .date-filters {
      display: flex;
      gap: 1rem;
    }

    .date-input {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date-input label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .date-input input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .quick-filters {
      display: flex;
      gap: 0.5rem;
    }

    .quick-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: white;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-btn:hover {
      background: #f3f4f6;
    }

    .quick-btn.active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    /* History Container */
    .history-container {
      margin-bottom: 2rem;
    }

    .day-group {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 1rem;
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .day-date {
      display: flex;
      flex-direction: column;
    }

    .day-name {
      font-weight: 600;
      color: #111827;
      text-transform: capitalize;
    }

    .day-full {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .day-total {
      text-align: right;
    }

    .total-hours {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: #10b981;
    }

    .total-label {
      font-size: 0.625rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    .entries-list {
      padding: 0.5rem 0;
    }

    .entry-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .entry-item:last-child { border-bottom: none; }

    .entry-time-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.875rem;
      color: #6b7280;
      min-width: 140px;
    }

    .time-separator {
      color: #d1d5db;
    }

    .entry-details {
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
      min-width: 60px;
      text-align: right;
    }

    .empty-history {
      background: white;
      border-radius: 1rem;
      padding: 4rem 2rem;
      text-align: center;
      color: #9ca3af;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .empty-history svg { margin-bottom: 1rem; }
    .empty-history h3 { color: #374151; margin: 0 0 0.5rem; }
    .empty-history p { margin: 0; }

    /* Weekly Chart */
    .chart-section {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .chart-section h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1.5rem;
    }

    .week-chart {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 200px;
      gap: 0.5rem;
    }

    .chart-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 60px;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
      border-radius: 0.5rem 0.5rem 0 0;
      min-height: 4px;
      transition: height 0.3s ease;
    }

    .bar-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #374151;
      margin-top: 0.5rem;
    }

    .bar-label {
      font-size: 0.625rem;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 0.25rem;
    }
  `]
})
export class MyHistoryComponent implements OnInit {
  private http = inject(HttpClient);
  
  history = signal<HistoryEntry[]>([]);
  groupedHistory = signal<DaySummary[]>([]);
  
  stats = signal({
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
    tasksCompleted: 0
  });
  
  weeklyChart = signal<{ day: string; hours: number; percentage: number }[]>([]);
  
  dateFrom = '';
  dateTo = '';
  quickFilter = 'week';

  ngOnInit() {
    this.setQuickFilter('week');
    this.loadStats();
    this.loadWeeklyChart();
  }

  setQuickFilter(filter: string) {
    this.quickFilter = filter;
    const today = new Date();
    
    switch (filter) {
      case 'today':
        this.dateFrom = this.dateTo = today.toISOString().split('T')[0];
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        this.dateFrom = startOfWeek.toISOString().split('T')[0];
        this.dateTo = today.toISOString().split('T')[0];
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dateFrom = startOfMonth.toISOString().split('T')[0];
        this.dateTo = today.toISOString().split('T')[0];
        break;
    }
    
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/time-logs/my-history`, {
      params: { from: this.dateFrom, to: this.dateTo }
    }).subscribe({
      next: (data) => {
        const entries = data.map(e => ({
          id: e.id,
          date: e.startTime ? e.startTime.split('T')[0] : new Date().toISOString().split('T')[0],
          taskId: e.task?.id || 0,
          taskTitle: e.task?.title || 'Tarea',
          startTime: e.startTime,
          endTime: e.endTime,
          duration: e.duration ? e.duration / 60 : 0, // minutos a horas
          comment: e.description || ''
        }));
        this.history.set(entries);
        this.groupByDay(entries);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  groupByDay(entries: HistoryEntry[]) {
    const groups = new Map<string, DaySummary>();
    
    entries.forEach(entry => {
      if (!groups.has(entry.date)) {
        groups.set(entry.date, {
          date: entry.date,
          totalHours: 0,
          entries: []
        });
      }
      const group = groups.get(entry.date)!;
      group.entries.push(entry);
      group.totalHours += entry.duration;
    });
    
    const sorted = Array.from(groups.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    this.groupedHistory.set(sorted);
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/time-logs/my-stats`)
      .subscribe({
        next: (data) => this.stats.set({
          todayHours: data.todayHours || 0,
          weekHours: data.weekHours || 0,
          monthHours: data.monthHours || 0,
          tasksCompleted: data.tasksCompleted || 0
        }),
        error: (err) => {
          console.error('Error al cargar estadísticas:', err);
        }
      });
  }

  loadWeeklyChart() {
    // Generar gráfico basado en historial
    const today = new Date();
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = this.history().filter(e => e.date === dateStr);
      const hours = dayEntries.reduce((sum, e) => sum + e.duration, 0);
      
      chartData.push({
        day: weekDays[date.getDay()],
        hours: Math.round(hours * 10) / 10,
        percentage: Math.min(100, (hours / 8) * 100)
      });
    }
    
    this.weeklyChart.set(chartData);
  }

  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  }

  formatTime(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
