import { getDb, COLLECTION } from './db';

export async function getCurrentMonthStats() {
  const db = getDb();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${year}-${month}`;

  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '>=', `${currentMonthStr}-01`)
    .where('date', '<=', `${currentMonthStr}-31`)
    .get();

  let total_spend = 0;
  let total_liters = 0;
  let total_price = 0;
  let fill_count = 0;

  snapshot.forEach((doc) => {
    const d = doc.data();
    total_spend += d.total_cost;
    total_liters += d.liters;
    total_price += d.price_per_liter;
    fill_count++;
  });

  return {
    month: currentMonthStr,
    total_spend,
    total_liters,
    avg_price: fill_count > 0 ? total_price / fill_count : 0,
    fill_count,
  };
}

export async function getLast6MonthsChart() {
  const db = getDb();
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;

  const snapshot = await db.collection(COLLECTION).where('date', '>=', startStr).get();

  const monthMap: Record<string, { total_spend: number; total_liters: number; fill_count: number }> = {};

  snapshot.forEach((doc) => {
    const d = doc.data();
    const monthKey = (d.date as string).slice(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { total_spend: 0, total_liters: 0, fill_count: 0 };
    }
    monthMap[monthKey].total_spend += d.total_cost;
    monthMap[monthKey].total_liters += d.liters;
    monthMap[monthKey].fill_count++;
  });

  const allMonths = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    allMonths.push({
      month: monthStr,
      ...(monthMap[monthStr] || { total_spend: 0, total_liters: 0, fill_count: 0 }),
    });
  }

  return allMonths;
}
