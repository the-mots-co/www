import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export function getDb(): Firestore {
  if (!getApps().length) {
    initializeApp({ credential: applicationDefault() });
  }
  return getFirestore();
}

export const COLLECTION = 'fuel_expenses';

export interface FuelExpense {
  id: string;
  date: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  odometer: number | null;
  notes: string | null;
  created_at: string;
}
