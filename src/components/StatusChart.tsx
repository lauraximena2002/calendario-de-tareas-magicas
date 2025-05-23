
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface StatusChartProps {
  tasks: Task[];
}

const statusConfig = {
  'pendiente': {
    color: '#ef4444',
    bgColor: '#fef2f2',
    label: 'Pendiente',
    icon: '🔴'
  },
  'en-proceso': {
    color: '#3b82f6',
    bgColor: '#eff6ff',
    label: 'En Proceso',
    icon: '🔵'
  },
  'hecho': {
    color: '#10b981',
    bgColor: '#f0fdf4',
    label: 'Hecho',
    icon: '🟢'
  }
};

export const StatusChart = ({ tasks }: StatusChartProps) => {
  const statusData = Object.entries(statusConfig).map(([status, config]) => {
    const count = tasks.filter(task => task.status === status).length;
    return {
      status: config.label,
      count,
      color: config.color,
      bgColor: config.bgColor,
      icon: config.icon,
      tasks: tasks.filter(task => task.status === status)
    };
  });

  const chartData = statusData.map(item => ({
    name: item.status,
    value: item.count,
    color: item.color
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 text-center">📊 Estados de las Tareas</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de barras */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Gráfico de Barras</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Gráfico Circular</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Tarjetas de resumen por estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusData.map((item) => (
          <Card key={item.status} className="p-4" style={{ backgroundColor: item.bgColor }}>
            <div className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="text-lg font-semibold text-gray-700">{item.status}</h4>
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.count}
              </div>
              <p className="text-sm text-gray-600">tareas</p>
            </div>
            
            {item.tasks.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-medium text-gray-600">Tareas:</p>
                {item.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-xs p-1 bg-white rounded truncate">
                    {task.title}
                  </div>
                ))}
                {item.tasks.length > 3 && (
                  <p className="text-xs text-gray-500">+{item.tasks.length - 3} más</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
