
import { Calendar } from '@/components/Calendar';
import { useCalendar } from '@/hooks/useCalendar';

const Index = () => {
  const {
    currentDate,
    calendarDays,
    notifications,
    addTask,
    updateTask,
    navigateMonth,
    goToToday,
  } = useCalendar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Calendar
          currentDate={currentDate}
          calendarDays={calendarDays}
          onNavigateMonth={navigateMonth}
          onGoToToday={goToToday}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          notifications={notifications}
        />
      </div>
    </div>
  );
};

export default Index;
