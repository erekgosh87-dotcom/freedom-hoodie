import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export async function GET() {
  try {
    const orders = await getOrders();
    // Sort by newest first
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
