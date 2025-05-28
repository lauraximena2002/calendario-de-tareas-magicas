import { useState, useEffect, useMemo } from 'react';
import { Task, CalendarDay } from '@/types/calendar';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, format, differenceInDays, isPast } from 'date-fns';
import { getAllTasks, createTask, updateTask as updateTaskService, deleteTask as deleteTaskService, checkAutomaticNotifications } from '@/services/taskService';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas desde Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTasks = await getAllTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('Error al cargar las tareas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Verificar notificaciones automáticas cada 5 minutos
  useEffect(() => {
    // Verificar inmediatamente al cargar
    checkAutomaticNotifications();
    
    // Configurar intervalo para verificar cada 5 minutos
    const interval = setInterval(() => {
      console.log('⏰ Ejecutando verificación automática de notificaciones...');
      checkAutomaticNotifications();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // Check for upcoming tasks that need notifications and overdue tasks
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = tasks.filter(task => {
      if (task.status === 'hecho') return false;
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      const daysUntilTask = differenceInDays(taskDate, today);
      return daysUntilTask <= (task.notifyDaysBefore || 0) && daysUntilTask >= 0;
    });

    const overdue = tasks.filter(task => {
      if (task.status === 'hecho') return false;
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today;
    });

    setNotifications(upcomingTasks);
    setOverdueTasks(overdue);
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

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = await createTask(task);
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updatedTask = await updateTaskService(taskId, updates);
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    }
  };

  const deleteTask = async (taskId: string) => {
    const success = await deleteTaskService(taskId);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
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
    overdueTasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    navigateMonth,
    goToToday,
  };
};
