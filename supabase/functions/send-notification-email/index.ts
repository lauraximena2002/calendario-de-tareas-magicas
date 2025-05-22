
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

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
}

const sendEmail = async (payload: EmailPayload) => {
  // En una implementación real, conectaríamos con un servicio de email como SendGrid o Resend
  // Para propósitos de demostración, solo registramos la solicitud
  
  console.log("Email enviado:", {
    to: payload.to,
    subject: payload.subject,
    content: `
      Recordatorio de tarea: "${payload.taskTitle}"
      Fecha de vencimiento: ${payload.dueDate}
      ${payload.taskDescription ? `Descripción: ${payload.taskDescription}` : ""}
      ${payload.company ? `Empresa: ${payload.company}` : ""}
    `
  });
  
  return { success: true, message: "Email enviado (simulado)" };
};

serve(async (req) => {
  // Manejar las solicitudes CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    if (req.method === "POST") {
      const { to, taskTitle, dueDate, taskDescription, company, subject } = await req.json();
      
      const result = await sendEmail({
        to,
        subject: subject || "Recordatorio de tarea pendiente",
        taskTitle,
        dueDate,
        taskDescription,
        company
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
    if (req.method === "GET" && new URL(req.url).searchParams.get("check") === "upcoming") {
      const today = new Date();
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "hecho")
        .lte("date", new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) {
        throw error;
      }
      
      const results = [];
      
      for (const task of tasks || []) {
        const dueDate = new Date(task.date);
        const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysUntilDue <= task.notify_days_before && daysUntilDue >= 0) {
          // Verificar si ya enviamos una notificación para esta tarea recientemente
          const { data: notifications } = await supabase
            .from("notifications")
            .select("*")
            .eq("task_id", task.id)
            .gte("sent_at", new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString())
            .single();
          
          // Si no hay notificación reciente, enviar correo
          if (!notifications) {
            // Supongamos que enviamos al dueño de la tarea o a un correo predeterminado
            const targetEmail = "usuario@ejemplo.com"; // En producción, usaríamos emails reales
            
            const emailResult = await sendEmail({
              to: targetEmail,
              subject: `Recordatorio: "${task.title}" vence pronto`,
              taskTitle: task.title,
              dueDate: new Date(task.date).toLocaleDateString(),
              taskDescription: task.description,
              company: task.company
            });
            
            // Registrar la notificación enviada
            if (emailResult.success) {
              await supabase
                .from("notifications")
                .insert({
                  task_id: task.id,
                  email_sent_to: targetEmail
                });
              
              results.push({
                taskId: task.id,
                status: "notificación enviada",
                daysUntilDue
              });
            }
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, notifications: results }),
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
