import { NextRequest, NextResponse } from 'next/server';
import { testConnection, resetPool } from '@/lib/db';

export async function GET() {
  const result = await testConnection();
  return NextResponse.json({
    ...result,
    configuredUrl: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:[^:]+@/, ':****@')
      : 'postgresql://postgres:****@localhost:5432/finance_tracker',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host = 'localhost', port = 5432, user = 'postgres', password = '', database = 'finance_tracker' } = body;
    
    const connStr = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    const testResult = await testConnection(connStr);

    if (testResult.connected) {
      resetPool(connStr);
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to PostgreSQL database!',
        database: testResult.database,
        version: testResult.version,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: testResult.message,
        },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
