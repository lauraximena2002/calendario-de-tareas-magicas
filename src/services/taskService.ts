
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
    notify_days_before: task.notifyDaysBefore || 3
  };
};

// Convertir tarea de Supabase al formato local
const convertTaskFromSupabaseFormat = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    date: new Date(dbTask.date),
    status: dbTask.status as 'pendiente' | 'en-proceso' | 'hecho',
    company: dbTask.company || undefined,
    owner: dbTask.owner || undefined,
    notifyDaysBefore: dbTask.notify_days_before || 3,
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

// Enviar correo de notificación manualmente
export const sendTaskNotificationEmail = async (task: Task, emailTo: string): Promise<boolean> => {
  try {
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-notification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`
      },
      body: JSON.stringify({
        to: emailTo,
        taskTitle: task.title,
        dueDate: format(task.date, 'dd/MM/yyyy'),
        taskDescription: task.description,
        company: task.company,
        subject: `Recordatorio: "${task.title}" - Tarea pendiente`
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Error desconocido');
    }

    // Registrar la notificación en la base de datos
    await supabase
      .from('notifications')
      .insert({
        task_id: task.id,
        email_sent_to: emailTo
      });

    toast.success('Notificación enviada correctamente');
    return true;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    toast.error('Error al enviar la notificación');
    return false;
  }
};
