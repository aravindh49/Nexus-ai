
export enum ResourceStatus {
  NORMAL = 'NORMAL',
  HIGH_LOAD = 'HIGH_LOAD',
  CRITICAL = 'CRITICAL'
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  costPerHour: number;
  maxCapacity: number;
  currentLoad: number; // 0 to 100
  status: ResourceStatus;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
  };
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  estimatedTime: number; // in hours
  assignedResourceId: string | null;
  userId: number | null;
  status: TaskStatus;
  createdAt: string;
}

export interface HistoricalLoad {
  timestamp: string;
  load: number;
}

export interface PredictionPoint {
  time: string;
  actual?: number;
  predicted: number;
}

export interface Anomaly {
  id: string;
  resourceId: string;
  type: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
  name: string;
}
