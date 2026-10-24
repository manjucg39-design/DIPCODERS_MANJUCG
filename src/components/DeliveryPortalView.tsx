import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Store, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { MaterialOrder } from '../types';
import { apiClient } from '../services/apiClient';

interface DeliveryPortalViewProps {
  onRefresh: () => void;
}

export const DeliveryPortalView: React.FC<DeliveryPortalViewProps> = ({ onRefresh }) => {
  const [orders, setOrders] = useState<MaterialOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await apiClient.getMaterialOrders();
      setOrders(allOrders);
    } catch (err) {
      console.error('Failed to load delivery assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      await apiClient.updateMaterialOrderStatus(
        orderId,
        status,
        'del-1',
        'Sunil D. (Mysuru Express Delivery)'
      );
      await fetchDeliveryOrders();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status');
    }
  };

  const eligibleOrders = orders.filter(
    (o) => o.status === 'READY_FOR_PICKUP' || o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY'
  );
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const totalEarnings = deliveredOrders.length * 30; // ₹30 per delivery

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900">Delivery Runner Portal</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                Mysuru Rapid 10–20 Min Dispatches
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Partner: Sunil D. · Flat ₹30 payout per completed on-site material delivery.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Delivery Payout Earnings
            </span>
            <span className="text-lg font-black text-indigo-950 tabular-nums">
              ₹{totalEarnings}.00
            </span>
            <div className="text-[10px] text-indigo-700 font-medium">
              {deliveredOrders.length} Completed Dispatches
            </div>
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Available & In-Transit Dispatches ({eligibleOrders.length})
            </h3>
            <button
              type="button"
              onClick={fetchDeliveryOrders}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Dispatches</span>
            </button>
          </div>

          {eligibleOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No active packages awaiting delivery right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800">{ord.orderNumber}</span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        Client: {ord.customerName}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                      {ord.status}
                    </span>
                  </div>

                  {/* Route details */}
                  <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Pickup Shop:</span>
                        <div className="font-semibold text-slate-800">{ord.shopName}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-slate-200/80">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Delivery Drop Site:</span>
                        <div className="font-semibold text-slate-800">{ord.dropAddress} ({ord.dropLocality})</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-bold text-indigo-900">
                      Payout: ₹30
                    </span>

                    <div className="flex items-center gap-2">
                      {ord.status === 'READY_FOR_PICKUP' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'PICKED_UP')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Confirm Package Picked Up
                        </button>
                      )}

                      {ord.status === 'PICKED_UP' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'OUT_FOR_DELIVERY')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Start Delivery Ride
                        </button>
                      )}

                      {ord.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm Handover on Site</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
