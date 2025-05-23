
// Utilidad para generar colores únicos para cada empresa
const companyColors = new Map<string, string>();

const colorPalette = [
  'bg-red-100 text-red-800 border-red-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-violet-100 text-violet-800 border-violet-200',
];

export const getCompanyColor = (company: string): string => {
  if (!company) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  if (companyColors.has(company)) {
    return companyColors.get(company)!;
  }
  
  const colorIndex = companyColors.size % colorPalette.length;
  const color = colorPalette[colorIndex];
  companyColors.set(company, color);
  
  return color;
};
