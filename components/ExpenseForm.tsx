'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpenseForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today,
    liters: '',
    price_per_liter: '',
    odometer: '',
    notes: '',
  });

  const [totalCost, setTotalCost] = useState<number | null>(null);

  useEffect(() => {
    const liters = parseFloat(form.liters);
    const price = parseFloat(form.price_per_liter);
    if (!isNaN(liters) && !isNaN(price) && liters > 0 && price > 0) {
      setTotalCost(liters * price);
    } else {
      setTotalCost(null);
    }
  }, [form.liters, form.price_per_liter]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      router.push('/history');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar despesa');
    } finally {
      setSubmitting(false);
    }
  }

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
            Data <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={form.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Odometer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="odometer">
            Odômetro (km)
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            min="0"
            step="1"
            value={form.odometer}
            onChange={handleChange}
            placeholder="Ex: 15230"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Liters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="liters">
            Litros abastecidos <span className="text-red-500">*</span>
          </label>
          <input
            id="liters"
            name="liters"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.liters}
            onChange={handleChange}
            placeholder="Ex: 40.5"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Price per liter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price_per_liter">
            Preço por litro (R$) <span className="text-red-500">*</span>
          </label>
          <input
            id="price_per_liter"
            name="price_per_liter"
            type="number"
            min="0.01"
            step="0.001"
            required
            value={form.price_per_liter}
            onChange={handleChange}
            placeholder="Ex: 6.19"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Total cost display */}
      {totalCost !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">Total calculado:</span>
          <span className="text-xl font-bold text-emerald-800">{formatBRL(totalCost)}</span>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          placeholder="Posto, tipo de combustível, etc."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          {submitting ? 'Salvando...' : 'Salvar Abastecimento'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
