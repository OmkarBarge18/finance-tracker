import { NextRequest, NextResponse } from 'next/server';
import { getBudgets, createOrUpdateBudget } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || undefined;
    const budgets = await getBudgets(month);
    return NextResponse.json(budgets);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.category_id || body.amount === undefined || !body.month) {
      return NextResponse.json(
        { error: 'category_id, amount, and month are required' },
        { status: 400 }
      );
    }
    const budget = await createOrUpdateBudget(
      parseInt(body.category_id),
      parseFloat(body.amount),
      body.month
    );
    return NextResponse.json(budget, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
