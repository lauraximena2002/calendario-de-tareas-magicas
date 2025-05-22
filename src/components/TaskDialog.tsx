
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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/calendar';

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
    });

    if (!task) {
      // Reset form for new tasks
      setTitle('');
      setDescription('');
      setDate(defaultDate || new Date());
      setStatus('pendiente');
      setCompany('');
      setOwner('');
      setNotifyDaysBefore(3);
    }

    setOpen(false);
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
      <DialogContent className="max-w-md">
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

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              {task ? 'Actualizar' : 'Crear'}
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
