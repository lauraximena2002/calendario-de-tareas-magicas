
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
    notification_email: task.notificationEmail || null,
    notification_time: task.notificationTime || '09:00'
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
    notificationTime: dbTask.notification_time || '09:00',
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at)
  };
};

// Crear una nueva tarea
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
  try {
    console.log('Creando tarea con datos:', task);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(convertTaskToSupabaseFormat(task))
      .select()
      .single();

    if (error) {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear la tarea: ' + error.message);
      return null;
    }

    console.log('Tarea creada exitosamente:', data);
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
    console.log('Actualizando tarea:', taskId, 'con datos:', updates);
    
    const updateData: Record<string, any> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.date !== undefined) updateData.date = format(updates.date, 'yyyy-MM-dd');
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.company !== undefined) updateData.company = updates.company || null;
    if (updates.owner !== undefined) updateData.owner = updates.owner || null;
    if (updates.notifyDaysBefore !== undefined) updateData.notify_days_before = updates.notifyDaysBefore;
    if (updates.notificationEmail !== undefined) updateData.notification_email = updates.notificationEmail || null;
    if (updates.notificationTime !== undefined) updateData.notification_time = updates.notificationTime || '09:00';

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea: ' + error.message);
      return null;
    }

    console.log('Tarea actualizada exitosamente:', data);
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

// Función para enviar notificación manual
export const sendManualNotification = async (taskId: string): Promise<boolean> => {
  try {
    console.log('Enviando notificación manual para tarea:', taskId);
    
    // Obtener la tarea
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      console.error('Error al obtener tarea:', taskError);
      toast.error('Error al obtener la tarea');
      return false;
    }

    if (!task.notification_email) {
      toast.error('No hay correo configurado para esta tarea');
      return false;
    }

    // Limpiar y validar emails
    const emailString = task.notification_email.trim();
    console.log('Emails originales:', emailString);
    
    // Separar emails correctamente
    const emails = emailString.split(/[,;]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    console.log('Emails procesados:', emails);
    
    if (emails.length === 0) {
      toast.error('No se encontraron emails válidos');
      return false;
    }

    // Usar la fecha límite real de la tarea
    const taskDueDate = new Date(task.date + 'T00:00:00').toLocaleDateString('es-ES');

    console.log('Preparando envío de email con fecha:', taskDueDate);
    console.log('Enviando a emails separados por comas:', emails.join(', '));
    
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        to: emails.join(', '), // Enviar como string separado por comas
        taskTitle: task.title,
        dueDate: taskDueDate,
        taskDescription: task.description,
        company: task.company,
        subject: `📅 NOTIFICACIÓN MANUAL: ${task.title}`,
        isOverdue: false
      }
    });

    if (error) {
      console.error('Error enviando email:', error);
      toast.error('Error al enviar la notificación: ' + error.message);
      return false;
    } else {
      console.log('Respuesta del envío:', data);
      
      if (data.success && data.successCount > 0) {
        toast.success(`Notificación enviada exitosamente a ${data.successCount} destinatario(s)`);
        
        if (data.errorCount > 0) {
          toast.error(`${data.errorCount} emails fallaron al enviarse`);
        }
        
        // Registrar las notificaciones enviadas exitosamente
        for (const email of emails) {
          await supabase
            .from('notifications')
            .insert({
              task_id: taskId,
              email_sent_to: email
            });
        }
        
        return true;
      } else {
        toast.error('No se pudo enviar ninguna notificación');
        return false;
      }
    }
  } catch (error) {
    console.error('Error enviando notificación manual:', error);
    toast.error('Error al enviar la notificación: ' + error.message);
    return false;
  }
};

// Función para verificar notificaciones automáticas
export const checkAutomaticNotifications = async (): Promise<void> => {
  try {
    console.log('🔄 Verificando notificaciones automáticas...');
    
    // Corregido: usar método GET sin body
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      method: 'GET'
    });

    if (error) {
      console.error('Error checking notifications:', error);
    } else {
      console.log('✅ Resultado de verificación de notificaciones:', data);
      if (data?.notificationsSent > 0) {
        console.log(`📨 Se enviaron ${data.notificationsSent} notificaciones automáticas`);
        toast.success(`Se enviaron ${data.notificationsSent} notificaciones automáticas`);
      }
    }
  } catch (error) {
    console.error('Error in automatic notifications check:', error);
  }
};
