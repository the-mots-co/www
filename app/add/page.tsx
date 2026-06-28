import ExpenseForm from '@/components/ExpenseForm';

export const metadata = {
  title: 'Adicionar Abastecimento | Controle de Combustível',
};

export default function AddPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Abastecimento</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Preencha os dados do abastecimento. O valor total é calculado automaticamente.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ExpenseForm />
      </div>
    </div>
  );
}
