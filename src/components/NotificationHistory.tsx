
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Mail, Clock, AlertCircle } from 'lucide-react';

interface NotificationHistoryProps {
  taskId: string;
}

interface Notification {
  id: string;
  email_sent_to: string;
  sent_at: string;
}

export const NotificationHistory = ({ taskId }: NotificationHistoryProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('task_id', taskId)
          .order('sent_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchNotifications();
    }
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-sm text-gray-500">Cargando historial...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-4">
        <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">No se han enviado notificaciones</p>
        <p className="text-xs text-gray-400 mt-1">
          Las notificaciones se enviarán según los días configurados
        </p>
      </div>
    );
  }

  // Agrupar notificaciones por correo electrónico
  const notificationsByEmail = notifications.reduce((acc, notification) => {
    const email = notification.email_sent_to;
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-4 w-4" />
        <span className="font-medium text-sm">Historial de Notificaciones</span>
        <Badge variant="secondary" className="text-xs">
          {notifications.length}
        </Badge>
      </div>
      
      <div className="max-h-40 overflow-y-auto space-y-2">
        {Object.entries(notificationsByEmail).map(([email, emailNotifications]) => (
          <Card key={email} className="p-3 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{email}</span>
                <Badge variant="outline" className="text-xs">
                  {emailNotifications.length} {emailNotifications.length === 1 ? 'notificación' : 'notificaciones'}
                </Badge>
              </div>
              
              <div className="pl-6 space-y-1">
                {emailNotifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(notification.sent_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {emailNotifications.length > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    + {emailNotifications.length - 3} notificaciones más...
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>Las notificaciones se envían según los días configurados antes del vencimiento</span>
        </div>
      </div>
    </div>
  );
};
