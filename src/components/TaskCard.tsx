
import { Task } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
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

export const TaskCard = ({ task, onClick, size = 'sm' }: TaskCardProps) => {
  const config = statusConfig[task.status];
  
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow border-l-4",
        config.color.includes('red') && "border-l-red-400",
        config.color.includes('blue') && "border-l-blue-400", 
        config.color.includes('green') && "border-l-green-400",
        size === 'sm' && "p-2",
        size === 'md' && "p-3",
        size === 'lg' && "p-4"
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h4 className={cn(
            "font-medium line-clamp-2",
            size === 'sm' && "text-xs",
            size === 'md' && "text-sm",
            size === 'lg' && "text-base"
          )}>
            {task.title}
          </h4>
          <Badge variant="secondary" className={cn("text-xs shrink-0", config.color)}>
            {config.icon}
          </Badge>
        </div>
        
        {task.company && (
          <p className={cn(
            "text-muted-foreground font-medium",
            size === 'sm' && "text-xs",
            size === 'md' && "text-xs",
            size === 'lg' && "text-sm"
          )}>
            {task.company}
          </p>
        )}
        
        {task.owner && (
          <p className={cn(
            "text-muted-foreground",
            size === 'sm' && "text-xs",
            size === 'md' && "text-xs", 
            size === 'lg' && "text-sm"
          )}>
            👤 {task.owner}
          </p>
        )}
        
        {size !== 'sm' && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </Card>
  );
};
