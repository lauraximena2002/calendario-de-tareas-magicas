
import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { TaskTable } from '@/components/TaskTable';
import { useCalendar } from '@/hooks/useCalendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ListIcon } from 'lucide-react';

const Index = () => {
  const [view, setView] = useState<'calendar' | 'table'>('calendar');
  
  const {
    currentDate,
    calendarDays,
    tasks,
    notifications,
    addTask,
    updateTask,
    navigateMonth,
    goToToday,
  } = useCalendar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-end mb-2">
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
              variant={view === 'table' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setView('table')}
              className="flex items-center gap-1"
            >
              <ListIcon className="h-4 w-4" />
              Tabla
            </Button>
          </div>
        </div>
        
        {view === 'calendar' ? (
          <Calendar
            currentDate={currentDate}
            calendarDays={calendarDays}
            onNavigateMonth={navigateMonth}
            onGoToToday={goToToday}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            notifications={notifications}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
              <ListIcon className="mr-2" />
              Lista de tareas
            </h1>
            <TaskTable tasks={tasks} onUpdateTask={updateTask} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
