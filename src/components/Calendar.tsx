
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';
import { CalendarDay, Task } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  calendarDays: CalendarDay[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  notifications: Task[];
}

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const Calendar = ({ 
  currentDate, 
  calendarDays, 
  onNavigateMonth, 
  onGoToToday,
  onAddTask,
  onUpdateTask,
  notifications
}: CalendarProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Calendario</h1>
          </div>
          <Button variant="outline" onClick={onGoToToday}>
            Hoy
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onNavigateMonth('prev')}>
            ←
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <Button variant="outline" onClick={() => onNavigateMonth('next')}>
            →
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Estados:</span>
        <Badge className="bg-red-100 text-red-800 border-red-200">🔴 Pendiente</Badge>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">🔵 En Proceso</Badge>
        <Badge className="bg-green-100 text-green-800 border-green-200">🟢 Hecho</Badge>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-800 mb-2">📢 Notificaciones</h3>
          <div className="space-y-2">
            {notifications.map(task => (
              <p key={task.id} className="text-sm text-amber-700">
                <strong>{task.title}</strong> - Vence: {format(task.date, 'dd/MM/yyyy')}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card className="p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekdays.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <CalendarDayCell
              key={index}
              day={day}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

interface CalendarDayCellProps {
  day: CalendarDay;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const CalendarDayCell = ({ day, onAddTask, onUpdateTask }: CalendarDayCellProps) => {
  const dayNumber = format(day.date, 'd');
  
  return (
    <div className={cn(
      "min-h-[120px] p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors",
      !day.isCurrentMonth && "bg-gray-50 text-gray-400",
      day.isToday && "bg-blue-50 border-blue-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-sm font-medium",
          day.isToday && "text-blue-600 font-bold"
        )}>
          {dayNumber}
        </span>
        
        {day.isCurrentMonth && (
          <TaskDialog
            defaultDate={day.date}
            onSave={onAddTask}
            trigger={
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                +
              </Button>
            }
          />
        )}
      </div>

      <div className="space-y-1">
        {day.tasks.slice(0, 3).map(task => (
          <TaskDialog
            key={task.id}
            task={task}
            onSave={(updatedTask) => onUpdateTask(task.id, updatedTask)}
            trigger={<TaskCard task={task} size="sm" />}
          />
        ))}
        
        {day.tasks.length > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{day.tasks.length - 3} más
          </p>
        )}
      </div>
    </div>
  );
};
