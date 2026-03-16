import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use Service Role Key for server-side DB operations to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export function getStorageType() {
  if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) return 'Supabase (Stable)';
  return 'Local Filesystem (Stable)';
}

export async function getOrders(): Promise<Order[]> {
  if (!supabaseUrl) return [];

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Supabase Get Error:', e);
    return [];
  }
}

export async function addOrder(order: Order): Promise<void> {
  if (!supabaseUrl) return;

  try {
    const { error } = await supabase
      .from('orders')
      .insert([order]);

    if (error) throw error;
  } catch (e) {
    console.error('Supabase Add Error:', e);
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  if (!supabaseUrl) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('orderId', orderId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Supabase Update Error:', e);
    return false;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  if (!supabaseUrl) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('orderId', orderId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Supabase Delete Error:', e);
    return false;
  }
}
