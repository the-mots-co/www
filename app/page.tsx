import Link from 'next/link';
import MonthlyChart from '@/components/MonthlyChart';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-');
  return `${MONTH_NAMES[month] || month} ${year}`;
}

interface StatsData {
  currentMonth: {
    month: string;
    total_spend: number;
    total_liters: number;
    avg_price: number;
    fill_count: number;
  };
  monthlyChart: {
    month: string;
    total_spend: number;
    total_liters: number;
    fill_count: number;
  }[];
}

async function getStats(): Promise<StatsData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Erro ao buscar estatísticas');
  return res.json();
}

export default async function DashboardPage() {
  let stats: StatsData | null = null;
  let fetchError = '';

  try {
    stats = await getStats();
  } catch {
    fetchError = 'Não foi possível carregar as estatísticas.';
  }

  const currentMonth = stats?.currentMonth;
  const chartData = stats?.monthlyChart || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
          {currentMonth && (
            <p className="text-sm text-gray-500 mt-0.5">{formatMonth(currentMonth.month)}</p>
          )}
        </div>
        <Link
          href="/add"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo Abastecimento
        </Link>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {fetchError}
        </div>
      )}

      {/* Stats cards */}
      {currentMonth && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Gasto no mês"
            value={formatBRL(currentMonth.total_spend)}
            icon="💰"
            accent="emerald"
          />
          <StatCard
            label="Litros abastecidos"
            value={`${currentMonth.total_liters.toFixed(1)} L`}
            icon="⛽"
            accent="blue"
          />
          <StatCard
            label="Preço médio/litro"
            value={currentMonth.avg_price > 0 ? formatBRL(currentMonth.avg_price) : '—'}
            icon="📈"
            accent="amber"
          />
          <StatCard
            label="Abastecimentos"
            value={String(currentMonth.fill_count)}
            icon="🔢"
            accent="purple"
          />
        </div>
      )}

      {/* Monthly chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Gastos dos últimos 6 meses</h2>
        {chartData.length > 0 ? (
          <MonthlyChart data={chartData} />
        ) : (
          <p className="text-center text-gray-400 py-10 text-sm">Sem dados para exibir</p>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/add"
          className="bg-white border border-emerald-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-sm transition-all group"
        >
          <div className="text-2xl mb-2">⛽</div>
          <p className="font-semibold text-gray-800 group-hover:text-emerald-700">Registrar Abastecimento</p>
          <p className="text-sm text-gray-500 mt-0.5">Adicione um novo registro de combustível</p>
        </Link>
        <Link
          href="/history"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-sm transition-all group"
        >
          <div className="text-2xl mb-2">📋</div>
          <p className="font-semibold text-gray-800 group-hover:text-emerald-700">Ver Histórico</p>
          <p className="text-sm text-gray-500 mt-0.5">Consulte e gerencie todos os registros</p>
        </Link>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  accent: 'emerald' | 'blue' | 'amber' | 'purple';
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  const accentClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${accentClasses[accent]}`}>
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
