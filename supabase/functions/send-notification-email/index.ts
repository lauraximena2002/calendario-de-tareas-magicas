
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  taskTitle: string;
  dueDate: string;
  taskDescription?: string;
  company?: string;
  isOverdue?: boolean;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const sendEmail = async (payload: EmailPayload) => {
  try {
    const isOverdue = payload.isOverdue;
    const statusText = isOverdue ? "⚠️ VENCIDA" : "📅 Próxima a vencer";
    const urgencyClass = isOverdue ? "urgent" : "reminder";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: ${isOverdue ? '#dc2626' : '#3b82f6'}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .task-details { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
            .status-badge { 
              display: inline-block; 
              padding: 8px 16px; 
              border-radius: 20px; 
              font-weight: bold; 
              color: white;
              background: ${isOverdue ? '#dc2626' : '#f59e0b'};
            }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusText}</h1>
              <p>Recordatorio de Tarea</p>
            </div>
            <div class="content">
              <div class="status-badge">${statusText}</div>
              <div class="task-details">
                <h2>📋 ${payload.taskTitle}</h2>
                <p><strong>📅 Fecha límite:</strong> ${payload.dueDate}</p>
                ${payload.taskDescription ? `<p><strong>📝 Descripción:</strong> ${payload.taskDescription}</p>` : ""}
                ${payload.company ? `<p><strong>🏢 Empresa:</strong> ${payload.company}</p>` : ""}
              </div>
              <p style="margin-top: 20px;">
                ${isOverdue 
                  ? "⚠️ Esta tarea ha vencido. Por favor, actualiza su estado lo antes posible."
                  : "📝 Recuerda completar esta tarea antes de la fecha límite."
                }
              </p>
            </div>
            <div class="footer">
              <p>Sistema de Gestión de Tareas</p>
              <p>Este es un recordatorio automático</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: "Sistema de Tareas <onboarding@resend.dev>",
      to: [payload.to],
      subject: `${isOverdue ? "⚠️ TAREA VENCIDA" : "📅 RECORDATORIO"}: ${payload.taskTitle}`,
      html: htmlContent,
    });

    console.log("Email enviado exitosamente:", {
      to: payload.to,
      subject: payload.subject,
      messageId: result.data?.id,
      taskTitle: payload.taskTitle,
      status: isOverdue ? "VENCIDA" : "RECORDATORIO"
    });
    
    return { success: true, message: "Email enviado exitosamente", messageId: result.data?.id };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, message: "Error al enviar email", error: error.message };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === "POST") {
      const { to, taskTitle, dueDate, taskDescription, company, subject, isOverdue } = await req.json();
      
      const result = await sendEmail({
        to,
        subject: subject || (isOverdue ? "⚠️ Tarea Vencida" : "📅 Recordatorio de tarea"),
        taskTitle,
        dueDate,
        taskDescription,
        company,
        isOverdue
      });
      
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Endpoint para verificar y enviar notificaciones automáticas
    if (req.method === "GET") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener tareas que necesitan notificación (incluidas las vencidas)
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "hecho");
      
      if (error) {
        throw error;
      }
      
      const results = [];
      const defaultEmail = "tatianarincon104@gmail.com"; // Cambiar por el email real del usuario
      
      for (const task of tasks || []) {
        const dueDate = new Date(task.date);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        const notifyDaysBefore = task.notify_days_before || 3;
        
        // Verificar si necesita notificación: exactamente los días de anticipación configurados o si está vencida
        const needsNotification = (
          // Tarea con exactamente los días de anticipación configurados
          daysUntilDue === notifyDaysBefore ||
          // Tarea vencida (días negativos)
          daysUntilDue < 0
        );
        
        if (needsNotification) {
          const isOverdue = daysUntilDue < 0;
          
          // Verificar si ya enviamos una notificación hoy para esta tarea
          const { data: todayNotification } = await supabase
            .from("notifications")
            .select("*")
            .eq("task_id", task.id)
            .gte("sent_at", today.toISOString())
            .lt("sent_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
            .maybeSingle();
          
          // Si no hay notificación de hoy, enviar correo
          if (!todayNotification) {
            const emailResult = await sendEmail({
              to: defaultEmail,
              subject: isOverdue ? `⚠️ TAREA VENCIDA: "${task.title}"` : `📅 RECORDATORIO: "${task.title}" vence pronto`,
              taskTitle: task.title,
              dueDate: new Date(task.date).toLocaleDateString('es-ES'),
              taskDescription: task.description,
              company: task.company,
              isOverdue
            });
            
            // Registrar la notificación enviada
            if (emailResult.success) {
              await supabase
                .from("notifications")
                .insert({
                  task_id: task.id,
                  email_sent_to: defaultEmail
                });
              
              results.push({
                taskId: task.id,
                taskTitle: task.title,
                status: isOverdue ? "notificación de vencida enviada" : "notificación de recordatorio enviada",
                daysUntilDue,
                isOverdue
              });
            }
          } else {
            results.push({
              taskId: task.id,
              taskTitle: task.title,
              status: "notificación ya enviada hoy",
              daysUntilDue,
              isOverdue: daysUntilDue < 0
            });
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          notifications: results,
          totalChecked: tasks?.length || 0,
          notificationsSent: results.filter(r => r.status.includes("enviada")).length
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Método no soportado" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
