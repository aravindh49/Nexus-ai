
import { Resource, Task, ResourceStatus, TaskStatus, TaskPriority, HistoricalLoad, Anomaly } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { taskApi, resourceApi } from './api';
import api from './api';

class MockBackend {
  private subscribers: ((data: any) => void)[] = [];
  private ws: WebSocket | null = null;

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:8000/ws');

    this.ws.onopen = () => {
      console.log("WS Connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'LOAD_UPDATE') {
          this.broadcast({ type: 'LOAD_UPDATE', data: message.data });
        } else if (message.type === 'ANOMALY_DETECTED') {
          this.broadcast(message);
        } else if (message.type === 'TASK_UPDATE') {
          // ensure data is mapped properly
          const mappedTasks = message.data.map((t: any) => this.mapTask(t));
          this.broadcast({ type: 'TASK_UPDATE', data: mappedTasks });
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    this.ws.onerror = (e) => console.error("WS Error", e);

    this.ws.onclose = () => {
      console.log("WS Closed, reconnecting...");
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  private mapResource(r: any): Resource {
    return {
      id: String(r.id),
      name: r.name,
      type: r.type,
      costPerHour: r.cost_per_hour ?? r.costPerHour, // Handle both just in case
      maxCapacity: r.max_capacity ?? r.maxCapacity,
      currentLoad: r.current_load ?? r.currentLoad,
      status: r.status,
      metrics: r.metrics || { cpu: 0, memory: 0, latency: 0 }
    };
  }

  private mapTask(t: any): Task {
    return {
      id: String(t.id),
      title: t.title,
      priority: t.priority,
      estimatedTime: t.estimated_time ?? t.estimatedTime,
      assignedResourceId: t.assigned_resource_id ? String(t.assigned_resource_id) : null,
      userId: t.user_id ?? t.userId ?? null,
      status: t.status,
      createdAt: t.created_at
    };
  }

  async getResources() {
    try {
      const res = await resourceApi.getAll();
      return res.data.map((r: any) => this.mapResource(r));
    } catch (e) {
      console.error("Failed to fetch resources", e);
      return [];
    }
  }

  async getTasks() {
    try {
      const res = await taskApi.getAll();
      return res.data.map((t: any) => this.mapTask(t));
    } catch (e) {
      console.error("Failed to fetch tasks", e);
      return [];
    }
  }

  async getWorkloadPredictions() {
    try {
      const res = await api.get('/predictions');
      return res.data;
    } catch (e) {
      console.error("Failed to fetch predictions", e);
      return [];
    }
  }

  async addTask(title: string, priority: TaskPriority, estimatedTime: number) {
    const res = await taskApi.create({
      title,
      priority,
      estimated_time: estimatedTime,
      status: TaskStatus.PENDING
    });
    // Broadcast update? Or rely on manual refresh/polling? App uses local state update optimistically often,
    // but TaskManagement uses `mockBackend.addTask` then clears form. It also subscribes to `TASK_UPDATE`.
    // My backend currently DOES NOT broadcast TASK_UPDATE on create.
    // I should return the created task mapped.
    const newTask = this.mapTask(res.data);

    // Manually notify subscribers to refresh logic if they listen?
    // Backend doesn't emit TASK_UPDATE on Create via WS yet.
    // So UI might not update list unless it re-fetches.
    // TaskManagement.tsx: `handleCreateTask` calls `mockBackend.addTask`. It DOES NOT update local state manually.
    // It relies on `mockBackend` updating its internal list and broadcasting?
    // Wait, original `mockBackend` updated `this.tasks` then broadcasted.
    // Here, I should probably also trigger a fetch or broadcast locally.

    // For now, I will broadcast a TASK_UPDATE with the new list (fetched).
    this.refreshTasks();

    return newTask;
  }

  private async refreshTasks() {
    const tasks = await this.getTasks();
    this.broadcast({ type: 'TASK_UPDATE', data: tasks });
  }

  async optimizeAssignment(taskId: any) {
    const id = typeof taskId === 'string' && taskId.startsWith('task-') ? parseInt(taskId.split('-')[1]) : parseInt(taskId);
    if (isNaN(id)) return; // Error handling

    const res = await taskApi.optimize(id);
    this.refreshTasks(); // Update tasks list after optimization changes status
    return this.mapResource(res.data);
  }

  async remediateResource(resourceId: any) {
    const id = typeof resourceId === 'string' && resourceId.startsWith('res-') ? parseInt(resourceId.split('-')[1]) : parseInt(resourceId);
    if (isNaN(id)) return;
    const res = await resourceApi.remediate(id);
    return res.data;
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private broadcast(data: any) {
    this.subscribers.forEach(cb => cb(data));
  }
}

export const mockBackend = new MockBackend();
