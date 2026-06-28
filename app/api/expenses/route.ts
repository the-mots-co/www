import { NextRequest, NextResponse } from 'next/server';
import { getDb, FuelExpense } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM fuel_expenses';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (year && month) {
      conditions.push("strftime('%Y-%m', date) = ?");
      params.push(`${year}-${month.padStart(2, '0')}`);
    } else if (year) {
      conditions.push("strftime('%Y', date) = ?");
      params.push(year);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) as total FROM fuel_expenses${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`;
    const totalResult = db.prepare(countQuery).get(...params) as { total: number };

    query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const expenses = db.prepare(query).all(...params) as FuelExpense[];

    return NextResponse.json({
      expenses,
      total: totalResult.total,
      page,
      pageSize,
      totalPages: Math.ceil(totalResult.total / pageSize),
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

    const result = db.prepare(`
      INSERT INTO fuel_expenses (date, liters, price_per_liter, total_cost, odometer, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      date,
      parseFloat(liters),
      parseFloat(price_per_liter),
      total_cost,
      odometer ? parseInt(odometer) : null,
      notes || null,
      created_at
    );

    const expense = db.prepare('SELECT * FROM fuel_expenses WHERE id = ?').get(result.lastInsertRowid) as FuelExpense;

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Erro ao criar despesa' }, { status: 500 });
  }
}
