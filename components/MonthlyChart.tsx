'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyData {
  month: string;
  total_spend: number;
  total_liters: number;
  fill_count: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

function formatMonth(monthStr: string) {
  const [, month] = monthStr.split('-');
  return MONTH_NAMES[month] || month;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: MonthlyData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white border border-emerald-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-emerald-800 mb-1">{label}</p>
      <p className="text-gray-700">Gasto: <span className="font-medium">{formatCurrency(data.total_spend)}</span></p>
      <p className="text-gray-700">Litros: <span className="font-medium">{data.total_liters.toFixed(1)} L</span></p>
      <p className="text-gray-700">Abastecimentos: <span className="font-medium">{data.fill_count}</span></p>
    </div>
  );
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
        <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#065f46' }} />
        <YAxis
          tick={{ fontSize: 12, fill: '#065f46' }}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_spend" fill="#10b981" radius={[4, 4, 0, 0]} name="Gasto Total" />
      </BarChart>
    </ResponsiveContainer>
  );
}
