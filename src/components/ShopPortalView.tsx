import React, { useState, useEffect } from 'react';
import { Store, Package, CheckCircle, Clock, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { MaterialOrder, Product, MaterialShop } from '../types';
import { apiClient } from '../services/apiClient';

interface ShopPortalViewProps {
  onRefresh: () => void;
}

export const ShopPortalView: React.FC<ShopPortalViewProps> = ({ onRefresh }) => {
  const [shop, setShop] = useState<MaterialShop | null>(null);
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [allShops, allOrders, allProducts] = await Promise.all([
        apiClient.getMaterialShops(),
        apiClient.getMaterialOrders(),
        apiClient.getProducts(),
      ]);
      // Default demo shop: Gokulam Electricals
      const myShop = allShops.find((s) => s.id === 'shop-2') || allShops[0];
      setShop(myShop);
      setOrders(allOrders.filter((o) => o.shopId === myShop?.id));
      setProducts(allProducts.filter((p) => p.shopId === myShop?.id));
    } catch (err) {
      console.error('Failed to load shop portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await apiClient.updateMaterialOrderStatus(orderId, status);
      await fetchShopData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Reconciled financial metrics
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
  const grossSales = completedOrders.reduce((sum, o) => sum + o.subtotalAmount, 0);
  const totalCommission = completedOrders.reduce((sum, o) => sum + o.platformCommissionAmount, 0);
  const netPayableToShop = completedOrders.reduce((sum, o) => sum + o.shopPayableAmount, 0);

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Shop Header Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900">{shop?.name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Hardware Partner
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Address: {shop?.address} · Hours: {shop?.operatingHours} · Commission Rate: {shop?.commissionRatePercent}%
            </p>
          </div>

          {/* Net Payout Balance */}
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Net Shop Sales (After 5% Comm.)
            </span>
            <span className="text-lg font-black text-emerald-950 tabular-nums">
              ₹{netPayableToShop}.00
            </span>
            <div className="text-[10px] text-emerald-700 font-medium">
              Gross: ₹{grossSales} · Platform Cut: ₹{totalCommission}
            </div>
          </div>
        </div>

        {/* Incoming Orders to Prepare & Fulfill */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Incoming Material Orders for On-Site Technicians ({orders.length})
            </h3>
            <button
              type="button"
              onClick={fetchShopData}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No orders received yet for this store.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800">{order.orderNumber}</span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Client: {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Drop Locality: {order.dropLocality}, Mysuru
                      </div>
                    </div>

                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[10px] text-slate-400 uppercase">Items to Pack:</span>
                    <ul className="divide-y divide-slate-100">
                      {order.items.map((it, idx) => (
                        <li key={idx} className="py-0.5 flex justify-between text-slate-700">
                          <span>{it.quantity}x {it.productName}</span>
                          <span className="font-semibold">₹{it.subtotal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Financial itemization */}
                  <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                    <span>Subtotal: ₹{order.subtotalAmount} · 5% Comm: ₹{order.platformCommissionAmount}</span>
                    <span className="font-bold text-slate-800">Shop Net: ₹{order.shopPayableAmount}</span>
                  </div>

                  {/* Shop Status Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order.id, 'SHOP_ACCEPTED')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Accept Order
                      </button>
                    )}

                    {order.status === 'SHOP_ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Start Packing Items
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ready for Courier Pickup</span>
                      </button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Waiting for Delivery Partner
                      </span>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <span className="text-[11px] font-semibold text-blue-700">
                        Out for Delivery with Courier
                      </span>
                    )}

                    {order.status === 'DELIVERED' && (
                      <span className="text-[11px] font-bold text-emerald-800">
                        Delivered on Site ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store Inventory Management */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Store Product Inventory ({products.length} Products)
          </h3>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Unit Price</th>
                  <th className="py-2.5 px-4">In Stock</th>
                  <th className="py-2.5 px-4">Stock Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p.category}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 tabular-nums">₹{p.unitPrice}/{p.unit}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {p.inStock ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 tabular-nums text-slate-700">{p.stockQuantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
