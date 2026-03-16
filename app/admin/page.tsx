'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';

interface Order {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Default admin password for demo
  const ADMIN_PASSWORD = 'admin';

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession === 'active') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
      // Periodically refresh orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const [storageType, setStorageType] = useState<string>('Detecting...');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setStorageType(data.storageType || 'Unknown');
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('admin_session', 'active');
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('admin_session');
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/order?orderId=${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      alert('Failed to delete order');
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Address', 'Quantity', 'Status', 'Date'];
    const rows = filteredOrders.map(o => [
      o.orderId, o.name, o.phone, o.address, o.quantity, o.status, new Date(o.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    today: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Admin Dashboard</h1>
          <p className="text-slate-400 text-center mb-8">Enter your credentials to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="premium-input bg-slate-50 border-slate-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full premium-button">SIGN IN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
            <Package size={18} />
          </div>
          <span className="font-bold tracking-tight">FREEDOM ADMIN</span>
        </div>

        <nav className="space-y-1 flex-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-100 text-slate-900 rounded-xl font-medium transition-colors">
            <BarChart3 size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Package size={20} /> Orders
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
            <p className="text-slate-500 text-sm">
              Current Storage: <span className={`font-semibold ${storageType.includes('Stable') ? 'text-green-500' : 'text-orange-500'}`}>{storageType}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOrders}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} /> Refresh
            </button>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value={stats.total} icon={<Package className="text-blue-500" />} trend="+12%" />
          <StatCard title="Today's Orders" value={stats.today} icon={<Clock className="text-purple-500" />} trend="New" />
          <StatCard title="In Progress" value={stats.pending} icon={<TrendingUp className="text-orange-500" />} trend="Action items" />
          <StatCard title="Delivered" value={stats.delivered} icon={<CheckCircle className="text-green-500" />} trend="Completed" />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, customers..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-black/5 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-full hover:bg-slate-50 text-slate-500 border border-slate-200 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-20 text-slate-400">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-20 text-slate-400">No orders found</td></tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{order.name}</div>
                      <div className="text-xs text-slate-400">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      Qt: {order.quantity}
                      <span className="block text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm truncate text-slate-600">{order.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-none focus:ring-0 ${getStatusStyles(order.status)}`}
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                      >
                        <option value="pending">PENDING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(order.orderId)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: any, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend === 'New' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-600';
    case 'shipped': return 'bg-blue-100 text-blue-600';
    case 'delivered': return 'bg-green-100 text-green-600';
    case 'cancelled': return 'bg-red-100 text-red-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}
