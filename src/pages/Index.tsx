
import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { StatusChart } from '@/components/StatusChart';
import { TasksByMonth } from '@/components/TasksByMonth';
import { useCalendar } from '@/hooks/useCalendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, RefreshCw, BarChart3, Calendar as CalendarTableIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [view, setView] = useState<'calendar' | 'chart' | 'monthly'>('calendar');
  
  const {
    currentDate,
    calendarDays,
    tasks,
    notifications,
    overdueTasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    navigateMonth,
    goToToday,
  } = useCalendar();

  const handleRefresh = () => {
    window.location.reload();
  };

  // Mostrar toast si hay error al cargar los datos
  if (error) {
    toast.error(error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between mb-2 items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm inline-flex p-1">
            <Button 
              variant={view === 'calendar' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('calendar')}
              className="flex items-center gap-1"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendario
            </Button>
            <Button 
              variant={view === 'chart' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('chart')}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Gráficos
            </Button>
            <Button 
              variant={view === 'monthly' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('monthly')}
              className="flex items-center gap-1"
            >
              <CalendarTableIcon className="h-4 w-4" />
              Por Mes
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-7 gap-2">
              {Array(35).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        ) : view === 'calendar' ? (
          <Calendar
            currentDate={currentDate}
            calendarDays={calendarDays}
            onNavigateMonth={navigateMonth}
            onGoToToday={goToToday}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            notifications={notifications}
            overdueTasks={overdueTasks}
          />
        ) : view === 'chart' ? (
          <StatusChart tasks={tasks} />
        ) : (
          <TasksByMonth 
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
