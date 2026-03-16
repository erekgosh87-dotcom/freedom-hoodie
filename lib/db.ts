import fs from 'fs';
import path from 'path';

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

// Memory store fallback for environments where filesystem is read-only (like Vercel)
let memoryOrders: Order[] = [];
let isUsingMemory = false;

function initDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
  } catch (e) {
    console.warn('Filesystem is read-only. Switching to memory store.');
    isUsingMemory = true;
  }
}

initDB();

export function getOrders(): Order[] {
  if (isUsingMemory) return memoryOrders;
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Error reading orders from file, using memory.');
    return memoryOrders;
  }
}

export function saveOrders(orders: Order[]): void {
  if (isUsingMemory) {
    memoryOrders = orders;
    return;
  }

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.warn('Error saving orders to file, switching to memory.');
    isUsingMemory = true;
    memoryOrders = orders;
  }
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}

export function updateOrderStatus(orderId: string, status: Order['status']): boolean {
  const orders = getOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    saveOrders(orders);
    return true;
  }
  return false;
}

export function deleteOrder(orderId: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter(o => o.orderId !== orderId);
  if (filtered.length !== orders.length) {
    saveOrders(filtered);
    return true;
  }
  return false;
}

