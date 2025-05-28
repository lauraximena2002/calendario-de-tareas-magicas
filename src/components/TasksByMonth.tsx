
import { useState } from 'react';
import { Task } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
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
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen p-6">
      {/* Header con diseño atractivo */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Calendar className="h-10 w-10 text-yellow-300" />
          <h1 className="text-4xl font-bold text-center">📅 Tareas por Mes</h1>
        </div>
        <p className="text-center text-teal-100 text-lg">Organización mensual de todas tus tareas</p>
      </div>

      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 rounded-3xl overflow-hidden">
        {/* Header del mes con navegación mejorada */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8">
          <div className="flex items-center justify-between">
            <Button 
              variant="secondary" 
              onClick={() => navigateMonth('prev')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm w-14 h-14 rounded-full shadow-xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-300" />
                  <span className="text-lg font-semibold text-blue-100">Resumen del mes:</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-6 py-3 text-lg font-bold shadow-lg rounded-full">
                  🔴 {statusCounts.pendiente} Pendientes
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-6 py-3 text-lg font-bold shadow-lg rounded-full">
                  🔵 {statusCounts['en-proceso']} En Proceso
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-6 py-3 text-lg font-bold shadow-lg rounded-full">
                  🟢 {statusCounts.hecho} Completadas
                </Badge>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={() => navigateMonth('next')}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm w-14 h-14 rounded-full shadow-xl"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Contenido de la tabla */}
        <div className="p-8">
          {monthTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay tareas este mes</h3>
              <p className="text-gray-500 text-lg">¡Perfecto momento para planificar nuevas actividades!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  📋 Lista de Tareas ({monthTasks.length} total)
                </h3>
              </div>
              <TaskTable 
                tasks={monthTasks} 
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
