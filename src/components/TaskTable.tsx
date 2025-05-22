
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

interface TaskTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
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

export const TaskTable = ({ tasks, onUpdateTask }: TaskTableProps) => {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow 
              key={task.id} 
              task={task} 
              onUpdateTask={onUpdateTask} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TaskRow = ({ task, onUpdateTask }: TaskRowProps) => {
  const config = statusConfig[task.status];
  
  return (
    <TaskDialog
      task={task}
      onSave={(updatedTask) => onUpdateTask(task.id, updatedTask)}
      trigger={
        <TableRow className="cursor-pointer hover:bg-slate-50">
          <TableCell className="font-medium">
            <div className="flex items-center">
              {task.title}
              {task.description && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  ABRIR
                </span>
              )}
            </div>
          </TableCell>
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
        </TableRow>
      }
    />
  );
};
