'use client';

import { useState, useEffect, useCallback } from 'react';
import ExpenseTable from '@/components/ExpenseTable';
import Link from 'next/link';

interface FuelExpense {
  id: number;
  date: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  odometer: number | null;
  notes: string | null;
  created_at: string;
}

interface ExpensesResponse {
  expenses: FuelExpense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const MONTH_OPTIONS = [
  { value: '', label: 'Todos os meses' },
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function HistoryPage() {
  const [data, setData] = useState<ExpensesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(currentYear));
  const [page, setPage] = useState(1);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '10' });
      if (month) params.set('month', month);
      if (year) params.set('year', year);

      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar registros');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [month, year, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  function handleFilterChange() {
    setPage(1);
  }

  function handleDelete(id: number) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
        total: prev.total - 1,
      };
    });
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.total} registro${data.total !== 1 ? 's' : ''} encontrado${data.total !== 1 ? 's' : ''}` : 'Carregando...'}
          </p>
        </div>
        <Link
          href="/add"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Novo
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mês</label>
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); handleFilterChange(); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); handleFilterChange(); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Todos os anos</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
          {(month || year !== String(currentYear)) && (
            <button
              onClick={() => { setMonth(''); setYear(String(currentYear)); handleFilterChange(); }}
              className="text-sm text-gray-500 hover:text-emerald-600 underline py-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : (
          <ExpenseTable
            expenses={data?.expenses || []}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors font-medium"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
