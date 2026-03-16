import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

export interface Order {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'orders.json');

// Singleton-like global store for serverless memory persistence (limited)
const globalStore = global as any;
if (!globalStore.memoryOrders) {
  globalStore.memoryOrders = [];
}

// Check if we are in a production environment with KV configured
const isProduction = process.env.NODE_ENV === 'production';
const hasKV = !!(process.env.KV_URL || process.env.KV_REST_API_URL);

export async function getOrders(): Promise<Order[]> {
  // 1. Try Vercel KV if available
  if (hasKV) {
    try {
      const orders = await kv.get<Order[]>('orders');
      return orders || [];
    } catch (e) {
      console.error('KV Error:', e);
    }
  }

  // 2. Try Filesystem (Local development)
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    // If filesystem is read-only, we fall back to memory
  }

  // 3. Fallback to global memory store
  return globalStore.memoryOrders;
}

export async function saveOrders(orders: Order[]): Promise<void> {
  // Update memory store first
  globalStore.memoryOrders = orders;

  // 1. Try Vercel KV if available
  if (hasKV) {
    try {
      await kv.set('orders', orders);
      return;
    } catch (e) {
      console.error('KV Save Error:', e);
    }
  }

  // 2. Try Filesystem (Local development)
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
  } catch (error) {
    // Filesystem error (expected on Vercel)
  }
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    await saveOrders(orders);
    return true;
  }
  return false;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const orders = await getOrders();
  const filtered = orders.filter(o => o.orderId !== orderId);
  if (filtered.length !== orders.length) {
    await saveOrders(filtered);
    return true;
  }
  return false;
}


