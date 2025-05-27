
export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  status: 'pendiente' | 'en-proceso' | 'hecho';
  company?: string;
  owner?: string;
  notifyDaysBefore?: number;
  notificationEmail?: string;
  notificationTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarDay {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
