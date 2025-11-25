
declare global {
  interface Window {
    XLSX: any;
  }
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  ON_BREAK = 'ON_BREAK',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ChecklistStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export interface ChecklistItem {
  id: string;
  category: 'Visual' | 'Operational' | 'Fluid';
  label: string;
  checked: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  status: EquipmentStatus;
  batteryLevel: number;
  lastOperator?: string;
  lastOperatorStaffNumber?: string;
  lastOperatorArea?: string;
  lastSessionDuration?: number; // Duration in seconds
  lastSessionStartTime?: number; // Timestamp
  currentIssue?: string;
}

export interface OperatorSession {
  operatorName: string;
  staffNumber: string;
  equipmentId: string;
  startTime: number;
  isOnBreak: boolean;
  checklistCompleted?: boolean;
  areaOfWork?: string;
}

export interface SafetyAdvice {
  severity: 'low' | 'medium' | 'high';
  message: string;
  actionItems: string[];
}

export interface ChecklistEntry {
  date: string; // YYYY-MM-DD
  equipmentId: string;
  staffNumber: string;
  timestamp: number;
}

export interface InspectionRecord {
  id: string;
  forkliftNumber: string;
  name: string;
  staffNumber?: string;
  areaOfWork?: string;
  date: string;
  timestamp?: number; // Added for sorting recent items
  externalCondition: 'Yes' | 'No' | 'Check';
  fireExtinguisher: 'Yes' | 'No' | 'Check';
  batterySecured: 'Yes' | 'No' | 'Check';
  brakes: 'Yes' | 'No' | 'Check';
  horn: 'Yes' | 'No' | 'Check';
  steering: 'Yes' | 'No' | 'Check';
  issuesFound: boolean;
  actionTaken: string;
}

export enum TaskPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string;
  equipmentId: string;
  message: string;
  priority: TaskPriority;
  assignedBy: string; // Admin
  timestamp: number;
  completed: boolean;
}

export interface Bulletin {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'critical' | 'success';
  timestamp: number;
  author: string;
}
