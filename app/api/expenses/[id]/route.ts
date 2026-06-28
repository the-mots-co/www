import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTION } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao excluir despesa' }, { status: 500 });
  }
}
