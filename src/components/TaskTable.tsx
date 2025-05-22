
import { useState } from "react";
import { Task } from "@/types/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TaskDialog } from "./TaskDialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusConfig = {
  'pendiente': {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴',
    label: 'Pendiente'
  },
  'en-proceso': {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🔵',
    label: 'En Proceso'
  },
  'hecho': {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢',
    label: 'Hecho'
  }
};

export const TaskTable = ({ tasks, onUpdateTask, onDeleteTask }: TaskTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Tareas</TableHead>
            <TableHead className="w-[180px]">Propietario</TableHead>
            <TableHead className="w-[150px]">Estado</TableHead>
            <TableHead className="w-[180px]">Fecha de grabación</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No hay tareas registradas
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TaskRow 
                key={task.id} 
                task={task} 
                onUpdateTask={onUpdateTask} 
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskRow = ({ task, onUpdateTask, onDeleteTask }: TaskRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const config = statusConfig[task.status];
  
  const handleDelete = () => {
    onDeleteTask(task.id);
    setShowDeleteDialog(false);
  };
  
  return (
    <>
      <TableRow className="hover:bg-slate-50">
        <TaskDialog
          task={task}
          onSave={(updatedTask) => onUpdateTask(task.id, updatedTask)}
          trigger={
            <TableCell className="font-medium cursor-pointer">
              <div className="flex items-center">
                {task.title}
                {task.description && (
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    ABRIR
                  </span>
                )}
              </div>
            </TableCell>
          }
        />
        <TableCell>
          <div className="flex flex-col gap-1">
            {task.owner?.split(',').map((owner, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {owner.trim()[0]}
                </div>
                <span className="text-sm">{owner.trim()}</span>
              </div>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={cn("text-xs", config.color)}>
            {config.label}
          </Badge>
        </TableCell>
        <TableCell>
          {format(task.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </TableCell>
        <TableCell>
          {task.company && (
            <div className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded inline-block text-sm">
              {task.company}
            </div>
          )}
        </TableCell>
        <TableCell>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la tarea "{task.title}" permanentemente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-700" 
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
