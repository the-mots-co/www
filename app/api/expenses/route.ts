import { NextRequest, NextResponse } from 'next/server';
import { getDb, FuelExpense, COLLECTION } from '@/lib/db';
import type { Query, CollectionReference } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    let query: Query | CollectionReference = db.collection(COLLECTION);

    if (year && month) {
      const monthStr = `${year}-${month.padStart(2, '0')}`;
      query = query
        .where('date', '>=', `${monthStr}-01`)
        .where('date', '<=', `${monthStr}-31`);
    } else if (year) {
      query = query
        .where('date', '>=', `${year}-01-01`)
        .where('date', '<=', `${year}-12-31`);
    }

    query = query.orderBy('date', 'desc');

    const snapshot = await query.get();
    const allDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FuelExpense));

    const total = allDocs.length;
    const start = (page - 1) * pageSize;
    const expenses = allDocs.slice(start, start + pageSize);

    return NextResponse.json({
      expenses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Erro ao buscar despesas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { date, liters, price_per_liter, odometer, notes } = body;

    if (!date || !liters || !price_per_liter) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: data, litros e preço por litro' },
        { status: 400 }
      );
    }

    const total_cost = parseFloat((parseFloat(liters) * parseFloat(price_per_liter)).toFixed(2));
    const created_at = new Date().toISOString();

    const docRef = await db.collection(COLLECTION).add({
      date,
      liters: parseFloat(liters),
      price_per_liter: parseFloat(price_per_liter),
      total_cost,
      odometer: odometer ? parseInt(odometer) : null,
      notes: notes || null,
      created_at,
    });

    const expense: FuelExpense = {
      id: docRef.id,
      date,
      liters: parseFloat(liters),
      price_per_liter: parseFloat(price_per_liter),
      total_cost,
      odometer: odometer ? parseInt(odometer) : null,
      notes: notes || null,
      created_at,
    };

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 });
  }
}
