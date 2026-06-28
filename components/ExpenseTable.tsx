'use client';

import { useState } from 'react';

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

interface ExpenseTableProps {
  expenses: FuelExpense[];
  onDelete: (id: number) => void;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatMonth(monthStr: string) {
  const [, m] = monthStr.split('-');
  return MONTH_NAMES[m] || m;
}

export default function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      onDelete(id);
    } catch {
      alert('Erro ao excluir o registro. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">⛽</p>
        <p className="font-medium">Nenhum abastecimento encontrado</p>
        <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo registro.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50 text-emerald-800">
            <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">Data</th>
            <th className="px-4 py-3 text-right font-semibold">Litros</th>
            <th className="px-4 py-3 text-right font-semibold">Preço/L</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 text-right font-semibold">Odômetro</th>
            <th className="px-4 py-3 text-left font-semibold">Obs.</th>
            <th className="px-4 py-3 text-center font-semibold rounded-tr-lg">Ação</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, idx) => (
            <tr
              key={expense.id}
              className={`border-b border-gray-100 hover:bg-emerald-50/40 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              }`}
            >
              <td className="px-4 py-3 font-medium text-gray-800">{formatDate(expense.date)}</td>
              <td className="px-4 py-3 text-right text-gray-700">{expense.liters.toFixed(2)} L</td>
              <td className="px-4 py-3 text-right text-gray-700">{formatBRL(expense.price_per_liter)}</td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatBRL(expense.total_cost)}</td>
              <td className="px-4 py-3 text-right text-gray-600">
                {expense.odometer ? `${expense.odometer.toLocaleString('pt-BR')} km` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={expense.notes || ''}>
                {expense.notes || '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 text-xs font-medium"
                  aria-label="Excluir registro"
                >
                  {deletingId === expense.id ? '...' : 'Excluir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { MONTH_NAMES, formatMonth };
