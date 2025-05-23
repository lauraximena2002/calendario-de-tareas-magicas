
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/types/calendar';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DayTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const DayTasksModal = ({ open, onOpenChange, date, tasks, onUpdateTask }: DayTasksModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Tareas del {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay tareas para este día
            </p>
          ) : (
            tasks.map(task => (
              <TaskDialog
                key={task.id}
                task={task}
                onSave={(updatedTask) => onUpdateTask(task.id, updatedTask)}
                trigger={<TaskCard task={task} size="md" />}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
