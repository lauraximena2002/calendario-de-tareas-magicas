
import { useState, useEffect, useMemo } from 'react';
import { Task, CalendarDay } from '@/types/calendar';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, format, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Task[]>([]);

  // Sample data
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Reteica Bello',
        description: 'Trámite pendiente',
        date: new Date(2025, 4, 16), // May 16, 2025
        status: 'pendiente',
        company: 'INVERSIONES EURO S.A.',
        owner: 'laura rincon',
        notifyDaysBefore: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Reteica Envigado',
        description: 'Trámite pendiente',
        date: new Date(2025, 4, 17), // May 17, 2025
        status: 'pendiente',
        company: 'INVERSIONES EURO S.A.',
        owner: 'laura rincon',
        notifyDaysBefore: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setTasks(sampleTasks);
  }, []);

  // Check for upcoming tasks that need notifications
  useEffect(() => {
    const today = new Date();
    const upcomingTasks = tasks.filter(task => {
      if (task.status === 'hecho') return false;
      const daysUntilTask = differenceInDays(task.date, today);
      return daysUntilTask <= (task.notifyDaysBefore || 0) && daysUntilTask >= 0;
    });
    setNotifications(upcomingTasks);
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start, end });
    
    return days.map(date => {
      const dayTasks = tasks.filter(task => 
        format(task.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date,
        tasks: dayTasks,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
      } as CalendarDay;
    });
  }, [currentDate, tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return {
    currentDate,
    calendarDays,
    tasks,
    notifications,
    addTask,
    updateTask,
    deleteTask,
    navigateMonth,
    goToToday,
  };
};
