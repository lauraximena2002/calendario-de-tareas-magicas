
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';
import { DayTasksModal } from './DayTasksModal';
import { CalendarDay, Task } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Sparkles, Star } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  calendarDays: CalendarDay[];
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  notifications: Task[];
  overdueTasks: Task[];
}

const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const Calendar = ({ 
  currentDate, 
  calendarDays, 
  onNavigateMonth, 
  onGoToToday,
  onAddTask,
  onUpdateTask,
  notifications,
  overdueTasks
}: CalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<{ date: Date; tasks: Task[] } | null>(null);

  const handleDayClick = (day: CalendarDay) => {
    if (day.tasks.length > 1) {
      setSelectedDay({ date: day.date, tasks: day.tasks });
    }
  };

  const allNotifications = [...notifications, ...overdueTasks];

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <CalendarIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Calendario <Sparkles className="h-6 w-6 text-yellow-300" />
                </h1>
                <p className="text-blue-100">Organiza tu tiempo de manera eficiente</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={onGoToToday}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm font-semibold"
            >
              Hoy
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={() => onNavigateMonth('prev')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full"
            >
              ←
            </Button>
            <h2 className="text-2xl font-bold min-w-[220px] text-center bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button 
              variant="secondary" 
              onClick={() => onNavigateMonth('next')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full"
            >
              →
            </Button>
          </div>
        </div>
      </div>

      {/* Status Legend with modern design */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-0 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-semibold text-gray-700">Estados de Tareas:</span>
          </div>
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            🔴 Pendiente
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            🔵 En Proceso
          </Badge>
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            🟢 Completado
          </Badge>
        </div>
      </Card>

      {/* Notifications with enhanced design */}
      {allNotifications.length > 0 && (
        <Card className="border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-xl border-2">
          <div className="p-6">
            <h3 className="font-bold text-amber-800 mb-4 text-xl flex items-center gap-2">
              📢 Notificaciones Importantes
              <div className="animate-pulse bg-amber-400 w-3 h-3 rounded-full"></div>
            </h3>
            <div className="space-y-3">
              {notifications.map(task => (
                <div key={task.id} className="bg-white/70 p-3 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    <strong>{task.title}</strong> - Vence: {format(task.date, 'dd/MM/yyyy')}
                  </p>
                </div>
              ))}
              {overdueTasks.map(task => (
                <div key={task.id} className="bg-red-50 p-3 rounded-lg border-2 border-red-200">
                  <p className="text-red-800 font-medium">
                    <strong>⚠️ {task.title}</strong> - Vencida: {format(task.date, 'dd/MM/yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Calendar Grid with enhanced visual design */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
        <div className="p-8">
          {/* Weekday Headers with gradient */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekdays.map(day => (
              <div key={day} className="p-4 text-center font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days with enhanced styling */}
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, index) => (
              <CalendarDayCell
                key={index}
                day={day}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDayClick={handleDayClick}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Day Tasks Modal */}
      <DayTasksModal
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
        date={selectedDay?.date || new Date()}
        tasks={selectedDay?.tasks || []}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
};

interface CalendarDayCellProps {
  day: CalendarDay;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDayClick: (day: CalendarDay) => void;
}

const CalendarDayCell = ({ day, onAddTask, onUpdateTask, onDayClick }: CalendarDayCellProps) => {
  const dayNumber = format(day.date, 'd');
  
  return (
    <div className={cn(
      "min-h-[140px] p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative overflow-hidden",
      !day.isCurrentMonth && "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500",
      day.isCurrentMonth && !day.isToday && "bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-md",
      day.isToday && "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-3 border-yellow-400 shadow-2xl"
    )}>
      {/* Background decoration for today */}
      {day.isToday && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 rounded-bl-2xl flex items-center justify-center">
          <Star className="h-4 w-4 text-blue-600" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-lg font-bold px-3 py-1 rounded-full",
          day.isToday && "bg-white/20 text-white",
          !day.isToday && day.isCurrentMonth && "bg-blue-100 text-blue-800",
          !day.isCurrentMonth && "bg-gray-200 text-gray-600"
        )}>
          {dayNumber}
        </span>
        
        {day.isCurrentMonth && (
          <TaskDialog
            defaultDate={day.date}
            onSave={onAddTask}
            trigger={
              <Button 
                size="sm" 
                variant="ghost" 
                className={cn(
                  "h-8 w-8 p-0 rounded-full font-bold text-xl transition-all duration-200 hover:scale-110",
                  day.isToday 
                    ? "text-white hover:bg-white/20" 
                    : "text-blue-600 hover:bg-blue-100"
                )}
              >
                +
              </Button>
            }
          />
        )}
      </div>

      <div className="space-y-2">
        {day.tasks.slice(0, 2).map(task => (
          <TaskDialog
            key={task.id}
            task={task}
            onSave={(updatedTask) => onUpdateTask(task.id, updatedTask)}
            trigger={<TaskCard task={task} size="sm" />}
          />
        ))}
        
        {day.tasks.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-sm font-semibold h-8 rounded-lg transition-all duration-200 hover:scale-105",
              day.isToday 
                ? "text-white hover:bg-white/20 bg-white/10" 
                : "text-blue-600 hover:bg-blue-100 bg-blue-50"
            )}
            onClick={() => onDayClick(day)}
          >
            +{day.tasks.length - 2} más tareas
          </Button>
        )}
      </div>
    </div>
  );
};
