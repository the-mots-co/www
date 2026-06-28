import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    // Current month stats
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const monthStats = db.prepare(`
      SELECT
        COALESCE(SUM(total_cost), 0) as total_spend,
        COALESCE(SUM(liters), 0) as total_liters,
        COALESCE(AVG(price_per_liter), 0) as avg_price,
        COUNT(*) as fill_count
      FROM fuel_expenses
      WHERE strftime('%Y-%m', date) = ?
    `).get(currentMonth) as {
      total_spend: number;
      total_liters: number;
      avg_price: number;
      fill_count: number;
    };

    // Last 6 months data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const startMonth = sixMonthsAgo.toISOString().slice(0, 7);

    const monthlyData = db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        SUM(total_cost) as total_spend,
        SUM(liters) as total_liters,
        COUNT(*) as fill_count
      FROM fuel_expenses
      WHERE strftime('%Y-%m', date) >= ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `).all(startMonth) as {
      month: string;
      total_spend: number;
      total_liters: number;
      fill_count: number;
    }[];

    // Fill in missing months
    const allMonths: { month: string; total_spend: number; total_liters: number; fill_count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toISOString().slice(0, 7);
      const found = monthlyData.find((m) => m.month === monthStr);
      allMonths.push(
        found || { month: monthStr, total_spend: 0, total_liters: 0, fill_count: 0 }
      );
    }

    return NextResponse.json({
      currentMonth: {
        ...monthStats,
        month: currentMonth,
      },
      monthlyChart: allMonths,
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
