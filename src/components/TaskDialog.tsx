
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Check, Mail, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/calendar';
import { sendTaskNotificationEmail } from '@/services/taskService';
import { toast } from '@/components/ui/sonner';
import { NotificationHistory } from './NotificationHistory';

interface TaskDialogProps {
  task?: Task;
  defaultDate?: Date;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  trigger?: React.ReactNode;
}

export const TaskDialog = ({ task, defaultDate, onSave, trigger }: TaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState<Date>(task?.date || defaultDate || new Date());
  const [status, setStatus] = useState<'pendiente' | 'en-proceso' | 'hecho'>(task?.status || 'pendiente');
  const [company, setCompany] = useState(task?.company || '');
  const [owner, setOwner] = useState(task?.owner || '');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(task?.notifyDaysBefore || 3);
  const [notificationEmail, setNotificationEmail] = useState(task?.notificationEmail || '');
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [showManualNotification, setShowManualNotification] = useState(false);
  const [manualEmail, setManualEmail] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      date,
      status,
      company,
      owner,
      notifyDaysBefore,
      notificationEmail,
    });

    if (!task) {
      setTitle('');
      setDescription('');
      setDate(defaultDate || new Date());
      setStatus('pendiente');
      setCompany('');
      setOwner('');
      setNotifyDaysBefore(3);
      setNotificationEmail('');
    }

    setOpen(false);
  };
  
  const handleStatusChange = (newStatus: 'pendiente' | 'en-proceso' | 'hecho') => {
    setStatus(newStatus);
  };

  const handleSendManualNotification = async () => {
    if (!manualEmail.trim()) {
      toast.error('Por favor, ingresa un correo electrónico');
      return;
    }
    
    if (!task) {
      toast.error('Debes guardar la tarea primero');
      return;
    }
    
    const success = await sendTaskNotificationEmail(task, manualEmail);
    if (success) {
      setManualEmail('');
      setShowManualNotification(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Nueva tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la tarea"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={2}
            />
          </div>

          <div>
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Estado</Label>
            <div className="flex flex-col gap-3">
              <Select value={status} onValueChange={(value: 'pendiente' | 'en-proceso' | 'hecho') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">🔴 Pendiente</SelectItem>
                  <SelectItem value="en-proceso">🔵 En Proceso</SelectItem>
                  <SelectItem value="hecho">🟢 Hecho</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={status === 'pendiente' ? 'default' : 'outline'} 
                  onClick={() => handleStatusChange('pendiente')}
                  className={cn(
                    status === 'pendiente' && "bg-red-500 hover:bg-red-600"
                  )}
                >
                  🔴 Pendiente
                </Button>
                <Button 
                  variant={status === 'en-proceso' ? 'default' : 'outline'} 
                  onClick={() => handleStatusChange('en-proceso')}
                  className={cn(
                    status === 'en-proceso' && "bg-blue-500 hover:bg-blue-600"
                  )}
                >
                  🔵 En Proceso
                </Button>
                <Button 
                  variant={status === 'hecho' ? 'default' : 'outline'} 
                  onClick={() => handleStatusChange('hecho')}
                  className={cn(
                    status === 'hecho' && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  🟢 Hecho
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <Label htmlFor="owner">Responsable</Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Responsable de la tarea"
            />
          </div>

          <div>
            <Label htmlFor="notify">Notificar días antes</Label>
            <Input
              id="notify"
              type="number"
              min="0"
              max="30"
              value={notifyDaysBefore}
              onChange={(e) => setNotifyDaysBefore(parseInt(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="notificationEmail">Correo para notificaciones</Label>
            <Input
              id="notificationEmail"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="notificationTime">Hora de notificación</Label>
            <Input
              id="notificationTime"
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
            />
          </div>

          {task && (
            <>
              <NotificationHistory taskId={task.id} />
              
              <div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => setShowManualNotification(!showManualNotification)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showManualNotification ? 'Ocultar' : 'Enviar notificación manual'}
                </Button>
                
                {showManualNotification && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="manualEmail">Correo electrónico</Label>
                      <Input
                        id="manualEmail"
                        type="email"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    <Button 
                      onClick={handleSendManualNotification} 
                      className="w-full bg-amber-500 hover:bg-amber-600"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar ahora
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600">
              <Check className="h-4 w-4 mr-1" />
              Aceptar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
