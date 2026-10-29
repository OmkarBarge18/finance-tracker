import { NextRequest, NextResponse } from 'next/server';
import { getRecurringBills, createRecurringBill } from '@/lib/db';

export async function GET() {
  try {
    const bills = await getRecurringBills();
    return NextResponse.json(bills);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.amount || !body.next_due_date) {
      return NextResponse.json(
        { error: 'name, amount, and next_due_date are required' },
        { status: 400 }
      );
    }
    const created = await createRecurringBill({
      name: body.name,
      amount: parseFloat(body.amount),
      category_id: body.category_id ? parseInt(body.category_id) : null,
      account_id: body.account_id ? parseInt(body.account_id) : null,
      frequency: body.frequency || 'monthly',
      next_due_date: body.next_due_date,
      status: body.status || 'active',
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
