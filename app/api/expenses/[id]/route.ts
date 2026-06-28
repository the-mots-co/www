import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM fuel_expenses WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    db.prepare('DELETE FROM fuel_expenses WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 });
  }
}
