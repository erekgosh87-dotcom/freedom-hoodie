import { NextResponse } from 'next/server';
import { addOrder, updateOrderStatus, deleteOrder, Order } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/order - Create order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, quantity, notes } = body;

    if (!name || !phone || !address || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newOrder: Order = {
      orderId: `ORD-${uuidv4().split('-')[0].toUpperCase()}`,
      name,
      phone,
      address,
      quantity,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await addOrder(newOrder);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PATCH /api/order - Update order status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const success = await updateOrderStatus(orderId, status);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/order - Delete order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const success = await deleteOrder(orderId);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
