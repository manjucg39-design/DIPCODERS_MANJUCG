import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Navigation, Phone, Star, Shield, Clock,
  CheckCircle2, MessageSquare, AlertTriangle, Send, Wifi, WifiOff
} from 'lucide-react';
import { BookingStore, type ChatMessage } from '../../lib/booking-store';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_WORKERS } from '../../lib/mock-data';
import { formatIST, timeAgo } from '../../lib/utils';

// Simulate worker location moving toward customer
const CUSTOMER_LAT = 12.3052;
const CUSTOMER_LNG = 76.6552;
const WORKER_START_LAT = 12.3180;
const WORKER_START_LNG = 76.6200;

export default function TrackWorkerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [workerLat, setWorkerLat] = useState(WORKER_START_LAT);
  const [workerLng, setWorkerLng] = useState(WORKER_START_LNG);
  const [locationError, setLocationError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');
  const [isConnected, setIsConnected] = useState(true);

  const booking = id ? BookingStore.getById(id) : undefined;
  const worker = booking?.worker || (MOCK_WORKERS[0]);

  useEffect(() => {
    if (!id) return;
    setMessages(BookingStore.getMessages(id));
  }, [id]);

  // Simulate worker moving toward customer
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkerLat(prev => {
        const diff = CUSTOMER_LAT - prev;
        return Math.abs(diff) < 0.0001 ? prev : prev + diff * 0.05;
      });
      setWorkerLng(prev => {
        const diff = CUSTOMER_LNG - prev;
        return Math.abs(diff) < 0.0001 ? prev : prev + diff * 0.05;
      });
      setLastUpdated(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate occasional connection drops
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldDrop = Math.random() < 0.05;
      if (shouldDrop) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const distanceKm = (() => {
    const R = 6371;
    const dLat = ((CUSTOMER_LAT - workerLat) * Math.PI) / 180;
    const dLon = ((CUSTOMER_LNG - workerLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((workerLat * Math.PI) / 180) *
      Math.cos((CUSTOMER_LAT * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  })();

  const etaMinutes = Math.max(1, Math.round(parseFloat(distanceKm) * 4));

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !id) return;
    const msg = BookingStore.sendMessage({
      booking_id: id,
      sender_id: user.id,
      sender_role: user.role as 'CUSTOMER' | 'WORKER',
      sender_name: user.name,
      content: newMessage.trim(),
    });
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  if (!booking && !id) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="card card-body text-center py-12">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-dark-700 font-medium">Booking not found.</p>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'WORKER_SELECTED', label: 'Worker Selected' },
    { key: 'WORKER_ON_THE_WAY', label: 'On The Way' },
    { key: 'WORKER_ARRIVED', label: 'Arrived' },
    { key: 'SERVICE_STARTED', label: 'Service Started' },
    { key: 'SERVICE_COMPLETED', label: 'Completed' },
  ];
  const currentStatusIdx = statusSteps.findIndex(s => s.key === booking?.fulfillment_status);

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Connection status */}
      {!isConnected && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-700">
          <WifiOff className="w-4 h-4" />
          Connection lost. Reconnecting… · Last location: {timeAgo(lastUpdated.toISOString())}
        </div>
      )}

      {/* Status Timeline */}
      <div className="card card-body">
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {statusSteps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center min-w-[60px]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  i < currentStatusIdx ? 'bg-green-500 text-white' :
                  i === currentStatusIdx ? 'bg-primary-500 text-white ring-2 ring-primary-200' :
                  'bg-surface-200 text-dark-400'
                }`}>
                  {i < currentStatusIdx ? '✓' : i + 1}
                </div>
                <p className={`text-[9px] text-center mt-1 font-medium leading-tight ${
                  i === currentStatusIdx ? 'text-primary-600' : i < currentStatusIdx ? 'text-green-600' : 'text-dark-400'
                }`}>{s.label}</p>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-[-12px] ${i < currentStatusIdx ? 'bg-green-400' : 'bg-surface-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex bg-surface-100 rounded-xl p-1 gap-1">
        {[{ key: 'map', label: '🗺️ Live Tracking' }, { key: 'chat', label: '💬 Chat' }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'map' | 'chat')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow-sm text-primary-600' : 'text-dark-500 hover:text-dark-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'map' && (
        <>
          {/* Map Visualization */}
          <div className="card overflow-hidden">
            <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100" style={{ height: 280 }}>
              {/* Grid lines to simulate map */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />

              {/* Roads (decorative) */}
              <div className="absolute left-1/4 top-0 w-1 h-full bg-white/60 rounded" />
              <div className="absolute left-2/3 top-0 w-1 h-full bg-white/60 rounded" />
              <div className="absolute top-1/3 left-0 w-full h-1 bg-white/60 rounded" />
              <div className="absolute top-2/3 left-0 w-full h-1 bg-white/60 rounded" />

              {/* Worker pin — animated */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[3000ms] ease-linear"
                style={{
                  left: `${((workerLng - 76.60) / 0.06) * 100}%`,
                  top: `${((12.33 - workerLat) / 0.04) * 100}%`,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-primary-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="bg-white text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap">
                    {worker.user.name}
                  </div>
                </div>
              </div>

              {/* Customer pin */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: '52%', top: '55%' }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-500 text-white rounded-full p-2 shadow-lg border-2 border-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow mt-1">
                    You
                  </div>
                </div>
              </div>

              {/* ETA overlay */}
              <div className="absolute top-3 right-3 bg-white rounded-xl shadow-lg px-3 py-2">
                <p className="text-xs text-dark-500 font-medium">ETA</p>
                <p className="text-xl font-black text-primary-600">{etaMinutes}<span className="text-xs font-medium text-dark-500"> min</span></p>
                <p className="text-[10px] text-dark-400">{distanceKm} km away</p>
              </div>

              {/* Live badge */}
              <div className="absolute top-3 left-3">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1 shadow text-xs font-medium text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <Wifi className="w-3 h-3" /> Live
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-2 py-1 shadow text-xs font-medium text-amber-600">
                    <WifiOff className="w-3 h-3" /> Reconnecting…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Worker Card */}
          <div className="card card-body">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                {worker.user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-dark-900">{worker.user.name}</p>
                  {worker.verifications.some(v => v.status === 'APPROVED') && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                      <Shield className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-dark-500 mt-0.5">{worker.categories[0]?.name} · {worker.experience_years} yrs exp</p>
                {worker.avg_rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-dark-700">{worker.avg_rating.toFixed(1)}</span>
                    <span className="text-xs text-dark-400">({worker.review_count} reviews)</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveTab('chat')}
                className="p-2.5 bg-primary-50 text-primary-500 rounded-xl hover:bg-primary-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-100">
              <div className="text-center">
                <p className="text-sm font-bold text-dark-900">{distanceKm} km</p>
                <p className="text-[10px] text-dark-400 mt-0.5">Distance</p>
              </div>
              <div className="text-center border-x border-surface-100">
                <p className="text-sm font-bold text-primary-600">{etaMinutes} min</p>
                <p className="text-[10px] text-dark-400 mt-0.5">ETA</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-dark-900">{worker.experience_years}y</p>
                <p className="text-[10px] text-dark-400 mt-0.5">Experience</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-dark-400 text-center">
            Location updated {timeAgo(lastUpdated.toISOString())} · Tracking stops when worker arrives
          </p>
        </>
      )}

      {activeTab === 'chat' && (
        <div className="card overflow-hidden flex flex-col" style={{ height: 400 }}>
          <div className="px-4 py-3 border-b border-surface-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {worker.user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark-900">{worker.user.name}</p>
              <p className="text-[10px] text-green-600 font-medium">● Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-dark-200 mx-auto mb-2" />
                <p className="text-sm text-dark-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender_id === user?.id
                    ? 'bg-primary-500 text-white rounded-tr-sm'
                    : 'bg-surface-100 text-dark-800 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-white/60' : 'text-dark-400'}`}>
                    {formatIST(msg.timestamp, 'hh:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-surface-100 flex gap-2">
            <input
              type="text"
              placeholder="Type a message…"
              className="form-input flex-1 py-2"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
