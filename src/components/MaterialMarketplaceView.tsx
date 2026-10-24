import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  Clock,
  Store,
  MapPin,
  AlertCircle,
  Search,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Product, MaterialShop, MaterialOrder, Booking } from '../types';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../i18n/LanguageContext';

interface MaterialMarketplaceViewProps {
  initialBookingId?: string | null;
  onRefresh: () => void;
}

export const MaterialMarketplaceView: React.FC<MaterialMarketplaceViewProps> = ({
  initialBookingId,
  onRefresh,
}) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<MaterialShop[]>([]);
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  // Cart: Map of productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedLinkedBookingId, setSelectedLinkedBookingId] = useState<string>(initialBookingId || '');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<MaterialOrder | null>(null);

  const categories = ['all', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Appliance'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, shps, ords, bks] = await Promise.all([
        apiClient.getProducts(selectedCategory, searchQuery, selectedShopId || undefined),
        apiClient.getMaterialShops(),
        apiClient.getMaterialOrders(),
        apiClient.getBookings(),
      ]);
      setProducts(prods);
      setShops(shps);
      setOrders(ords);
      setActiveBookings(bks.filter(b => b.status === 'WORK_IN_PROGRESS' || b.status === 'QUOTATION_ACCEPTED'));
    } catch (err) {
      console.error('Failed to load materials data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedShopId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  // Cart computations
  const cartItems = Object.entries(cart).map(([prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId);
    return {
      product: prod,
      productId: prodId,
      quantity: qty,
      subtotal: (prod ? prod.unitPrice : 0) * qty,
    };
  }).filter(item => item.product);

  const subtotalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = 30; // ₹30 standard rapid dispatch
  const totalAmount = subtotalAmount > 0 ? subtotalAmount + deliveryFee : 0;
  const platformShopCommission = Math.round((subtotalAmount * 5) / 100); // 5% shop commission

  // Pick target shop for cart
  const targetShopId = cartItems.length > 0 ? cartItems[0].product!.shopId : (shops[0]?.id || 'shop-2');

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setCheckoutSubmitting(true);
    try {
      const order = await apiClient.createMaterialOrder({
        bookingId: selectedLinkedBookingId || undefined,
        shopId: targetShopId,
        items: cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity })),
        dropAddress: 'Customer Work Site, Mysuru',
        dropLocality: 'Gokulam',
      });

      setCart({});
      setLastPlacedOrder(order);
      await fetchData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to place material order');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Marketplace Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>FIRST-CLASS FEATURE: BUY MATERIALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.materials.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.materials.subtitle}
            </p>
            <div className="text-[11px] text-emerald-300/80 pt-1">
              {t.materials.simulatedDeliveryNotice}
            </div>
          </div>
        </div>

        {/* Success Confirmation Card if placed */}
        {lastPlacedOrder && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  Material Order Placed! (Ref: {lastPlacedOrder.orderNumber})
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Fulfillment: LocalFix Express Hub · Rapid delivery dispatched to Gokulam, Mysuru.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastPlacedOrder(null)}
              className="text-xs font-bold text-emerald-800 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Products & Catalog (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Search and Category Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search pipes, sockets, wire, tape, valves, paints, hinges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Category buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((c) => {
                  const isSelected = selectedCategory === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCategory(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c === 'all' ? 'All Trade Supplies' : c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading catalog...</div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500">
                No products found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => {
                  const inCartQty = cart[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          <span className="text-sm font-black text-slate-900 tabular-nums">
                            ₹{product.unitPrice}
                            <span className="text-[10px] text-slate-400 font-normal">/{product.unit}</span>
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 pt-1 leading-snug">
                          {product.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{product.shopName}</span>
                        </div>
                      </div>

                      {/* Add to Cart Footer */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>~{product.deliveryMinutesEst} min delivery</span>
                        </span>

                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-2 bg-slate-100 px-2 py-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 tabular-nums">{inCartQty}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(product.id)}
                              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(product.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Material Orders Status Tracker */}
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Simulated Rapid Material Dispatches ({orders.length})</span>
              </h3>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{ord.orderNumber}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          From: {ord.shopName} · To: {ord.dropLocality}, Mysuru
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-slate-900 tabular-nums">₹{ord.totalAmount}</div>
                        <div className="text-[10px] text-slate-400">incl. ₹30 delivery</div>
                      </div>
                    </div>

                    {/* Delivery Partner */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <span>Courier: {ord.deliveryPartnerName || 'Sunil D. (Mysuru Express)'}</span>
                      <span className="font-semibold text-emerald-700">
                        {ord.status === 'DELIVERED' ? 'Delivered on Site' : 'In Transit (~12 mins)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Cart & Job Association (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Material Cart</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {cartItems.length} item{cartItems.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Option to Link to Active Job (Part 10) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Link Order to Active Repair Job:
                </label>
                <select
                  value={selectedLinkedBookingId}
                  onChange={(e) => setSelectedLinkedBookingId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Standalone / Direct Purchase</option>
                  {activeBookings.map((bk) => (
                    <option key={bk.id} value={bk.id}>
                      {bk.bookingNumber} - {bk.trade} ({bk.customerName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  If linked to a customer job, the customer reviews and approves the expense.
                </p>
              </div>

              {/* Cart List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Your cart is empty. Add materials from the catalog.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {cartItems.map((ci) => (
                      <div key={ci.productId} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                            {ci.product!.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ₹{ci.product!.unitPrice} × {ci.quantity}
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 tabular-nums">₹{ci.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accounting Breakdown (Part 12) */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Products Subtotal:</span>
                      <span className="font-semibold tabular-nums">₹{subtotalAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rapid Delivery Fee:</span>
                      <span className="font-semibold tabular-nums">₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Shop Commission (5%):</span>
                      <span className="italic tabular-nums">₹{platformShopCommission}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                      <span>Total Amount:</span>
                      <span className="tabular-nums">₹{totalAmount}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={checkoutSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    <span>{checkoutSubmitting ? 'Placing Order...' : 'Dispatch Rapid Delivery (₹' + totalAmount + ')'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
