import { NextRequest, NextResponse } from 'next/server';
import { bulkCreateTransactions } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactions } = body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: 'transactions array is required' }, { status: 400 });
    }

    const created = await bulkCreateTransactions(
      transactions.map((t: any) => ({
        account_id: parseInt(t.account_id),
        category_id: t.category_id ? parseInt(t.category_id) : null,
        amount: parseFloat(t.amount),
        type: t.type || 'expense',
        description: t.description || 'Imported Transaction',
        date: t.date || new Date().toISOString().split('T')[0],
        notes: t.notes || 'CSV Import',
      }))
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
