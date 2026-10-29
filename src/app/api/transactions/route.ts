import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const account_id = searchParams.get('account_id') ? parseInt(searchParams.get('account_id')!) : undefined;
    const category_id = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const date_from = searchParams.get('date_from') || undefined;
    const date_to = searchParams.get('date_to') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const txs = await getTransactions({
      account_id,
      category_id,
      type,
      search,
      date_from,
      date_to,
      limit,
      offset,
    });
    return NextResponse.json(txs);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.account_id || !body.amount || !body.type || !body.date) {
      return NextResponse.json(
        { error: 'account_id, amount, type, and date are required' },
        { status: 400 }
      );
    }
    const created = await createTransaction({
      account_id: parseInt(body.account_id),
      category_id: body.category_id ? parseInt(body.category_id) : null,
      amount: parseFloat(body.amount),
      type: body.type,
      description: body.description || '',
      date: body.date,
      notes: body.notes || null,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
