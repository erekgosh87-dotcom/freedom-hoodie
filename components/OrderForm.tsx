'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSuccess: (orderId: string) => void;
}

export default function OrderForm({ isOpen, onClose, productName, onSuccess }: OrderFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.order.orderId);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      alert('Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-scale-up border border-white/20">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X size={20} className="text-neutral-500" />
        </button>

        <h2 className="text-2xl font-bold mb-2">Complete Your Order</h2>
        <p className="text-neutral-500 mb-8">{productName}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
            <input 
              type="text"
              placeholder="John Doe"
              className={`premium-input ${errors.name ? 'border-red-300 ring-red-50' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
            <input 
              type="tel"
              placeholder="+1 234 567 890"
              className={`premium-input ${errors.phone ? 'border-red-300 ring-red-50' : ''}`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Shipping Address</label>
            <textarea 
              placeholder="Your full address here..."
              rows={3}
              className={`premium-input resize-none ${errors.address ? 'border-red-300 ring-red-50' : ''}`}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Quantity</label>
              <input 
                type="number"
                min="1"
                className="premium-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes (Optional)</label>
              <input 
                type="text"
                placeholder="Special instructions"
                className="premium-input"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full premium-button mt-4 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'CONFIRM ORDER'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
