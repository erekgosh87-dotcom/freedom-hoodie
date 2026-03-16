'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import OrderForm from './OrderForm';
import { ShoppingBag, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ProductLanding() {
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = {
    name: "Freedom – Hidden In My Soul Hoodie",
    price: "$79.00",
    description: "Experience ultimate comfort and express your inner self with our signature 'Freedom' hoodie. Crafted from premium heavy-weight cotton for a soft, structured feel that lasts.",
    image: "https://upnow-prod.ff45e40d1a1c8f7e7de4e976d0c9e555.r2.cloudflarestorage.com/ac2Kw60kmGP6t3jbYFKg8lItkrx2/32611b31-b4f9-4bcf-bcaf-cdcae71f50b6?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=2f488bd324502ec20fee5b40e9c9ed39%2F20260316%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260316T221343Z&X-Amz-Expires=43200&X-Amz-Signature=9eb756746788a54a9e757d2e85094a792793eb9babae7e8cadd83b2cafa86b5a&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22IMG_20260317_025527.png%22",
  };

  const handleOrderSuccess = (orderId: string) => {
    setIsOrderFormOpen(false);
    setOrderSuccess(orderId);
    // Increase display time to 10 seconds
    setTimeout(() => setOrderSuccess(null), 10000);
  };

  return (
    <main className="min-h-screen pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Nav / Brand */}
        <div className="flex justify-between items-center mb-16 px-4">
          <h1 className="text-xl font-bold tracking-widest text-neutral-800 uppercase">FREEDOM.</h1>
          <div className="flex gap-6 items-center">
            <span className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-black cursor-pointer transition-colors">COLLECTIONS</span>
            <span className="hidden md:inline text-sm font-medium text-neutral-500 hover:text-black cursor-pointer transition-colors">STORY</span>
            <ShoppingBag className="w-5 h-5 text-neutral-800 cursor-pointer" />
          </div>
        </div>

        {/* Product Section */}
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start lg:justify-center">
          
          {/* Main Product Card */}
          <div className="w-full lg:w-1/2 flex justify-center animate-slide-up">
            <div className="glass-dark p-6 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-lavender/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Image 
                src={product.image} 
                alt={product.name}
                width={500}
                height={600}
                priority
                className="w-full h-auto rounded-[2rem] shadow-sm transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left animate-slide-up [animation-delay:100ms]">
            <div className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-xs font-bold tracking-widest mb-6 border border-pink-200 uppercase">
              Limited Edition
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight">
              {product.name}
            </h2>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-light text-neutral-800">{product.price}</span>
              <div className="h-6 w-[1px] bg-neutral-200"></div>
              <div className="flex text-amber-400">
                {"★★★★★".split("").map((star, i) => <span key={i} className="text-lg">{star}</span>)}
              </div>
            </div>

            <p className="text-lg text-neutral-500 mb-10 leading-relaxed max-w-md">
              {product.description}
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full max-w-md">
              <div className="flex items-center bg-white/50 backdrop-blur rounded-full border border-neutral-200 p-1 group">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
                >
                  +
                </button>
              </div>

              <button 
                onClick={() => setIsOrderFormOpen(true)}
                className="premium-button flex-1 flex items-center justify-center gap-3 w-full"
              >
                BUY NOW <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8 text-neutral-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                  <span className="text-[10px] font-bold">100%</span>
                </div>
                <span className="text-xs font-medium uppercase tracking-tighter">Organic Cotton</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                   <ChevronRight size={12} className="rotate-90" />
                </div>
                <span className="text-xs font-medium uppercase tracking-tighter">Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups & Modals */}
      <OrderForm 
        isOpen={isOrderFormOpen} 
        onClose={() => setIsOrderFormOpen(false)}
        productName={product.name}
        onSuccess={handleOrderSuccess}
      />

      {orderSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up w-full max-w-sm px-4">
          <div className="glass-dark bg-neutral-900/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-2xl">
            <div className="bg-green-500 p-2 rounded-full">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Order Placed Successfully!</p>
              <p className="text-xs text-neutral-400">Order ID: {orderSuccess}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
