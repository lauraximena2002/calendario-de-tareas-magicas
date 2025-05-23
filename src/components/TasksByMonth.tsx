
import { useState } from 'react';
import { Task } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskTable } from './TaskTable';

interface TasksByMonthProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksByMonth = ({ tasks, onUpdateTask, onDeleteTask }: TasksByMonthProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const monthTasks = tasks.filter(task => 
    isWithinInterval(task.date, { start: monthStart, end: monthEnd })
  );

  const statusCounts = {
    pendiente: monthTasks.filter(task => task.status === 'pendiente').length,
    'en-proceso': monthTasks.filter(task => task.status === 'en-proceso').length,
    hecho: monthTasks.filter(task => task.status === 'hecho').length
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Badge className="bg-red-100 text-red-800">
                🔴 Pendiente: {statusCounts.pendiente}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                🔵 En Proceso: {statusCounts['en-proceso']}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                🟢 Hecho: {statusCounts.hecho}
              </Badge>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {monthTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tareas registradas para este mes
          </div>
        ) : (
          <TaskTable 
            tasks={monthTasks} 
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        )}
      </Card>
    </div>
  );
};
