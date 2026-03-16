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

// Singleton-like global store for serverless memory persistence
const globalStore = global as any;
if (!globalStore.memoryOrders) {
  globalStore.memoryOrders = [];
}

// Detection logic
export function getStorageType() {
  if (process.env.KV_REST_API_URL || process.env.KV_URL) return 'Vercel KV (Stable)';
  if (process.env.NODE_ENV === 'development') return 'Local Filesystem (Stable)';
  return 'Serverless Memory (Warning: Data will reset)';
}

const hasKV = !!(process.env.KV_URL || process.env.KV_REST_API_URL);

export async function getOrders(): Promise<Order[]> {
  // 1. Try Vercel KV
  if (hasKV) {
    try {
      const orders = await kv.get<Order[]>('orders');
      if (orders) return orders;
    } catch (e) {
      console.error('KV Error:', e);
    }
  }

  // 2. Try Filesystem
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {}

  // 3. Last fallback
  return globalStore.memoryOrders;
}

export async function saveOrders(orders: Order[]): Promise<void> {
  // Always update memory store
  globalStore.memoryOrders = orders;

  // 1. Try KV
  if (hasKV) {
    try {
      await kv.set('orders', orders);
    } catch (e) {
      console.error('KV Save Error:', e);
    }
  }

  // 2. Try Filesystem
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
  } catch (error) {}
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  // Ensure we don't have duplicates
  if (orders.find(o => o.orderId === order.orderId)) return;
  const newOrders = [...orders, order];
  await saveOrders(newOrders);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    await saveOrders([...orders]);
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



