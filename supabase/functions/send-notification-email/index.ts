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

const resend = new Resend("re_MvKScxmx_Pqy3QD2Bqazq3NrQRqxjFEqW");

const sendEmail = async (payload: EmailPayload) => {
  try {
    const isOverdue = payload.isOverdue;
    const statusText = isOverdue ? "⚠️ VENCIDA" : "📅 Próxima a vencer";
    
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

    console.log("🚀 Intentando enviar email a:", payload.to);
    
    const result = await resend.emails.send({
      from: "Sistema de Tareas <onboarding@resend.dev>",
      to: [payload.to],
      subject: `${isOverdue ? "⚠️ TAREA VENCIDA" : "📅 RECORDATORIO"}: ${payload.taskTitle}`,
      html: htmlContent,
    });

    if (result.error) {
      console.error("❌ Error de Resend:", result.error);
      return { success: false, message: "Error de Resend", error: result.error };
    }

    console.log("✅ Email enviado exitosamente a:", payload.to, "- ID:", result.data?.id);
    
    return { success: true, message: "Email enviado exitosamente", messageId: result.data?.id };
  } catch (error) {
    console.error("❌ Error enviando email a", payload.to, ":", error);
    return { success: false, message: "Error al enviar email", error: error.message };
  }
};

// Función para validar y limpiar emails
const validateAndCleanEmails = (emailString: string): string[] => {
  if (!emailString || typeof emailString !== 'string') {
    return [];
  }
  
  // Separar por coma, punto y coma, o espacios
  const emails = emailString.split(/[,;|\s]+/)
    .map(email => email.trim())
    .filter(email => {
      // Validar formato básico de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email && emailRegex.test(email);
    });
  
  console.log(`📧 Emails válidos encontrados: ${emails.length} - ${JSON.stringify(emails)}`);
  return emails;
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
      
      console.log("📧 Datos recibidos para envío:", {
        to,
        taskTitle,
        dueDate,
        taskDescription,
        company,
        subject,
        isOverdue
      });
      
      // Validar y limpiar correos electrónicos
      const emails = validateAndCleanEmails(to);
      
      if (emails.length === 0) {
        console.error("❌ No se encontraron emails válidos en:", to);
        return new Response(
          JSON.stringify({
            success: false,
            message: "No se encontraron emails válidos",
            emailsProvided: to
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      console.log(`📮 Procesando ${emails.length} emails: ${JSON.stringify(emails)}`);
      
      let successCount = 0;
      let errorCount = 0;
      const results = [];
      
      // Enviar a cada email por separado con delay
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        console.log(`📨 Enviando email ${i + 1}/${emails.length} a: ${email}`);
        
        const result = await sendEmail({
          to: email,
          subject: subject || (isOverdue ? "⚠️ Tarea Vencida" : "📅 Recordatorio de tarea"),
          taskTitle,
          dueDate,
          taskDescription,
          company,
          isOverdue
        });
        
        results.push({ email, result });
        
        if (result.success) {
          successCount++;
          console.log(`✅ Email ${i + 1} enviado exitosamente a: ${email} (ID: ${result.messageId})`);
        } else {
          errorCount++;
          console.log(`❌ Error enviando email ${i + 1} a: ${email} - ${JSON.stringify(result.error)}`);
        }
        
        // Delay entre emails para evitar rate limiting
        if (i < emails.length - 1) {
          console.log("⏱️ Esperando 500ms antes del próximo email...");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`📊 Resumen final: ${successCount} exitosos, ${errorCount} fallidos de ${emails.length} emails`);
      
      return new Response(
        JSON.stringify({
          success: successCount > 0,
          message: `${successCount} emails enviados exitosamente, ${errorCount} fallaron`,
          results,
          successCount,
          errorCount,
          emailsProcessed: emails.length,
          emailsList: emails
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Endpoint para verificar y enviar notificaciones automáticas
    if (req.method === "GET") {
      console.log("🔍 Iniciando verificación de notificaciones automáticas...");
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Obtener tareas que necesitan notificación y tienen email configurado
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "hecho")
        .not("notification_email", "is", null);
      
      if (error) {
        console.error("❌ Error obteniendo tareas:", error);
        throw error;
      }
      
      console.log(`📋 Encontradas ${tasks?.length || 0} tareas para revisar`);
      
      const results = [];
      
      for (const task of tasks || []) {
        console.log(`🔎 Revisando tarea: ${task.title} (${task.id})`);
        
        const taskDate = new Date(task.date + 'T00:00:00');
        const daysUntilDue = Math.floor((taskDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        const notifyDaysBefore = task.notify_days_before || 3;
        
        console.log(`📅 Tarea "${task.title}": días hasta vencimiento = ${daysUntilDue}, notificar ${notifyDaysBefore} días antes`);
        
        // Verificar si debe notificar - CORREGIDO
        const shouldNotify = (daysUntilDue === notifyDaysBefore) || (daysUntilDue < 0);
        
        if (shouldNotify && task.notification_email) {
          const isOverdue = daysUntilDue < 0;
          console.log(`📨 Debe notificar para tarea "${task.title}" (${isOverdue ? 'VENCIDA' : 'PRÓXIMA'})`);
          
          // Separar correos correctamente - MEJORADO
          const emails = task.notification_email.split(/[,;]/)
            .map(email => email.trim())
            .filter(email => email && email.includes('@'));
          
          console.log(`📧 Emails para notificar:`, emails);
          
          for (const email of emails) {
            // Verificar si ya enviamos notificación hoy para esta tarea y este email
            const startOfDay = new Date(today);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            
            const { data: todayNotification } = await supabase
              .from("notifications")
              .select("*")
              .eq("task_id", task.id)
              .eq("email_sent_to", email)
              .gte("sent_at", startOfDay.toISOString())
              .lte("sent_at", endOfDay.toISOString())
              .maybeSingle();
            
            if (!todayNotification) {
              console.log(`✉️ Enviando notificación para tarea: ${task.title} a: ${email}`);
              
              // Usar la fecha límite real de la tarea - CORREGIDO
              const taskDueDate = taskDate.toLocaleDateString('es-ES');
              
              const emailResult = await sendEmail({
                to: email,
                subject: isOverdue ? `⚠️ TAREA VENCIDA: "${task.title}"` : `📅 RECORDATORIO: "${task.title}" vence el ${taskDueDate}`,
                taskTitle: task.title,
                dueDate: taskDueDate,
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
                    email_sent_to: email
                  });
                
                results.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  emailSentTo: email,
                  status: isOverdue ? "notificación de vencida enviada" : "notificación de recordatorio enviada",
                  daysUntilDue,
                  isOverdue,
                  actualDueDate: taskDueDate
                });
              } else {
                results.push({
                  taskId: task.id,
                  taskTitle: task.title,
                  emailSentTo: email,
                  status: "error al enviar",
                  error: emailResult.error,
                  daysUntilDue,
                  isOverdue
                });
              }
            } else {
              console.log(`⏭️ Notificación ya enviada hoy para tarea "${task.title}" a ${email}`);
              results.push({
                taskId: task.id,
                taskTitle: task.title,
                emailSentTo: email,
                status: "notificación ya enviada hoy",
                daysUntilDue,
                isOverdue: daysUntilDue < 0
              });
            }
          }
        } else {
          console.log(`⏸️ No debe notificar para tarea "${task.title}" (días: ${daysUntilDue}, configurado: ${notifyDaysBefore})`);
        }
      }
      
      const notificationsSent = results.filter(r => r.status.includes("enviada")).length;
      console.log(`✅ Verificación completada. Notificaciones enviadas: ${notificationsSent}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          notifications: results,
          totalChecked: tasks?.length || 0,
          notificationsSent,
          timestamp: new Date().toISOString()
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
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
