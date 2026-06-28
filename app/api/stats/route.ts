import { NextResponse } from 'next/server';
import { getCurrentMonthStats, getLast6MonthsChart } from '@/lib/stats';

export async function GET() {
  try {
    const [currentMonth, monthlyChart] = await Promise.all([
      getCurrentMonthStats(),
      getLast6MonthsChart(),
    ]);

    return NextResponse.json({ currentMonth, monthlyChart });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
