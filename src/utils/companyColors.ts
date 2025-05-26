
// Utilidad para generar colores únicos para cada empresa
const companyColors = new Map<string, string>();

// Paleta de colores actualizada para empresas que no se confunda con los estados
// Evitamos rojos (pendiente), azules claros (en proceso) y verdes (hecho)
const colorPalette = [
  'bg-amber-100 text-amber-800 border-amber-200',      // Ámbar
  'bg-purple-100 text-purple-800 border-purple-200',   // Púrpura
  'bg-pink-100 text-pink-800 border-pink-200',         // Rosa
  'bg-indigo-100 text-indigo-800 border-indigo-200',   // Índigo
  'bg-teal-100 text-teal-800 border-teal-200',         // Verde azulado
  'bg-orange-100 text-orange-800 border-orange-200',   // Naranja
  'bg-cyan-100 text-cyan-800 border-cyan-200',         // Cian
  'bg-lime-100 text-lime-800 border-lime-200',         // Lima
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', // Fucsia
  'bg-violet-100 text-violet-800 border-violet-200',   // Violeta
  'bg-emerald-100 text-emerald-800 border-emerald-200', // Esmeralda
  'bg-sky-100 text-sky-800 border-sky-200',            // Cielo
  'bg-rose-100 text-rose-800 border-rose-200',         // Rosa suave
];

// Color especial para Palmela S.A.S (mantiene el azul como antes)
const palmelaColor = 'bg-blue-100 text-blue-800 border-blue-200';

export const getCompanyColor = (company: string): string => {
  if (!company) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  // Caso especial para Palmela S.A.S - mantiene su color azul característico
  if (company.toLowerCase().includes('palmela')) {
    return palmelaColor;
  }
  
  if (companyColors.has(company)) {
    return companyColors.get(company)!;
  }
  
  const colorIndex = companyColors.size % colorPalette.length;
  const color = colorPalette[colorIndex];
  companyColors.set(company, color);
  
  return color;
};
