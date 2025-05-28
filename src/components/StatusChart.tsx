
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface StatusChartProps {
  tasks: Task[];
}

const statusConfig = {
  'pendiente': {
    color: '#ef4444',
    bgColor: 'bg-gradient-to-r from-red-100 to-red-200',
    cardBg: 'bg-gradient-to-br from-red-50 to-red-100',
    label: 'Pendiente',
    icon: '🔴'
  },
  'en-proceso': {
    color: '#3b82f6',
    bgColor: 'bg-gradient-to-r from-blue-100 to-blue-200',
    cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    label: 'En Proceso',
    icon: '🔵'
  },
  'hecho': {
    color: '#10b981',
    bgColor: 'bg-gradient-to-r from-green-100 to-green-200',
    cardBg: 'bg-gradient-to-br from-green-50 to-green-100',
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
      cardBg: config.cardBg,
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
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen p-6">
      {/* Header con diseño atractivo */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-2">
          <TrendingUp className="h-10 w-10 text-yellow-300" />
          <h1 className="text-4xl font-bold text-center">📊 Análisis de Tareas</h1>
        </div>
        <p className="text-center text-blue-100 text-lg">Dashboard completo del estado de tus proyectos</p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border-0 shadow-2xl rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de barras con diseño mejorado */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <h3 className="text-2xl font-bold text-gray-800">Gráfico de Barras</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                  stroke="#64748b"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico circular con diseño mejorado */}
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon className="h-8 w-8 text-pink-600" />
              <h3 className="text-2xl font-bold text-gray-800">Gráfico Circular</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Tarjetas de resumen mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusData.map((item) => (
          <Card 
            key={item.status} 
            className={`p-6 border-0 shadow-2xl rounded-3xl transform hover:scale-105 transition-all duration-300 ${item.cardBg}`}
          >
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">{item.icon}</div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{item.status}</h4>
              <div className="text-5xl font-black mb-2" style={{ color: item.color }}>
                {item.count}
              </div>
              <Badge 
                className={`${item.bgColor} text-gray-800 border-0 px-4 py-2 text-lg font-bold shadow-lg`}
              >
                tareas
              </Badge>
            </div>
            
            {item.tasks.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tareas recientes:</p>
                {item.tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-sm p-3 bg-white/70 rounded-xl shadow-md font-medium text-gray-700 truncate backdrop-blur-sm">
                    {task.title}
                  </div>
                ))}
                {item.tasks.length > 3 && (
                  <p className="text-sm text-gray-600 font-semibold text-center pt-2">
                    +{item.tasks.length - 3} tareas más
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
