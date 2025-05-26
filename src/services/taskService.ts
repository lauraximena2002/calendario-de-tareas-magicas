
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/calendar";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

// Convertir tarea local al formato de Supabase
const convertTaskToSupabaseFormat = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    title: task.title,
    description: task.description || null,
    date: format(task.date, 'yyyy-MM-dd'),
    status: task.status,
    company: task.company || null,
    owner: task.owner || null,
    notify_days_before: task.notifyDaysBefore || 3,
    notification_email: task.notificationEmail || null
  };
};

// Convertir tarea de Supabase al formato local
const convertTaskFromSupabaseFormat = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    date: new Date(dbTask.date + 'T00:00:00'),
    status: dbTask.status as 'pendiente' | 'en-proceso' | 'hecho',
    company: dbTask.company || undefined,
    owner: dbTask.owner || undefined,
    notifyDaysBefore: dbTask.notify_days_before || 3,
    notificationEmail: dbTask.notification_email || undefined,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at)
  };
};

// Crear una nueva tarea
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(convertTaskToSupabaseFormat(task))
      .select()
      .single();

    if (error) {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear la tarea');
      return null;
    }

    toast.success('Tarea creada con éxito');
    return convertTaskFromSupabaseFormat(data);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    toast.error('Error al crear la tarea');
    return null;
  }
};

// Actualizar una tarea existente
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.date !== undefined) updateData.date = format(updates.date, 'yyyy-MM-dd');
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.company !== undefined) updateData.company = updates.company || null;
    if (updates.owner !== undefined) updateData.owner = updates.owner || null;
    if (updates.notifyDaysBefore !== undefined) updateData.notify_days_before = updates.notifyDaysBefore;
    if (updates.notificationEmail !== undefined) updateData.notification_email = updates.notificationEmail || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
      return null;
    }

    toast.success('Tarea actualizada con éxito');
    return convertTaskFromSupabaseFormat(data);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    toast.error('Error al actualizar la tarea');
    return null;
  }
};

// Eliminar una tarea
export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error al eliminar la tarea');
      return false;
    }

    toast.success('Tarea eliminada con éxito');
    return true;
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    toast.error('Error al eliminar la tarea');
    return false;
  }
};

// Obtener todas las tareas
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error al obtener tareas:', error);
      toast.error('Error al cargar las tareas');
      return [];
    }

    return data.map(convertTaskFromSupabaseFormat);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    toast.error('Error al cargar las tareas');
    return [];
  }
};

// Función para verificar notificaciones automáticas
export const checkAutomaticNotifications = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {},
      method: 'GET'
    });

    if (error) {
      console.error('Error checking notifications:', error);
    } else {
      console.log('Notifications check result:', data);
    }
  } catch (error) {
    console.error('Error in automatic notifications check:', error);
  }
};
