import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Star, Shield, Zap,
  Droplets, Hammer, Sparkles, Wrench, ChevronRight, MapPin,
  Users, Search, Clock, Activity, Check, AlertCircle
} from 'lucide-react';
import StarButton from '../components/ui/StarButton';
import QronosCard from '../components/ui/QronosCard';
import QronosSeparator from '../components/ui/QronosSeparator';

const LOCALITIES = [
  'Gokulam', 'Vijayanagar', 'Kuvempunagar', 'Jayalakshmipuram',
  'Hebbal', 'Saraswathipuram', 'Yadavagiri', 'Brindavan Extension',
  'Dattagalli', 'TK Layout', 'Bannimantap', 'Vontikoppal'
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Interactive Particle Canvas for Hero Background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint architectural grid points
      for (let x = 30; x < width; x += 60) {
        for (let y = 30; y < height; y += 60) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(232, 103, 58, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw floating nodes
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/find?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/customer/find');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-primary-500 selection:text-white">

      {/* ── 1. HERO SECTION ───────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-12 pb-20">
        {/* Particle Canvas Backdrop */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <canvas ref={canvasRef} className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-primary-500/10 via-white/5 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-[1344px] mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-[11px] font-mono tracking-wider uppercase text-white/80 mb-8 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MYSURU LIVE RUNTIME</span>
            <span className="text-white/30">·</span>
            <span className="text-primary-400">500+ VERIFIED WORKERS</span>
          </div>

          {/* Hero Main Heading (Qronos Typography) */}
          <h1 className="max-w-4xl text-balance font-display text-[clamp(2.5rem,5.5vw,4.8rem)] leading-[0.98] tracking-tight font-bold text-white mb-6">
            <span>The schedule & dispatch</span>
            <span className="block bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              system for local workers
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-white/60 leading-relaxed mb-10 font-normal">
            Coordinate skilled work across every locality, category, and urgent home maintenance task in Mysuru. Durable context keeps every service call verified, governed, and on schedule.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14">
            <StarButton to="/customer/book" size="lg" variant="orange">
              REQUEST A WORKER NOW
            </StarButton>
            <Link
              to="/register?role=WORKER"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white/80 bg-white/[0.05] border border-white/20 hover:border-white/40 hover:bg-white/[0.1] hover:text-white transition-all backdrop-blur-md h-11 no-underline"
            >
              <Wrench className="w-3.5 h-3.5 text-primary-400" />
              JOIN AS SERVICE PRO
            </Link>
          </div>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl relative flex items-center p-1.5 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-2xl"
          >
            <Search className="w-5 h-5 text-white/40 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plumbers in Gokulam, electricians in Vijayanagar..."
              className="w-full bg-transparent border-none text-white text-sm px-3 focus:outline-none placeholder-white/35"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex-shrink-0 cursor-pointer shadow-lg shadow-primary-500/20"
            >
              FIND
            </button>
          </form>
        </div>

        {/* Localities Marquee (from Qronos Logo Marquee pattern) */}
        <div className="w-full max-w-[1344px] mx-auto mt-16 px-4">
          <div className="relative overflow-hidden py-3 border-y border-white/[0.08] [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex items-center gap-10 whitespace-nowrap animate-marquee font-mono text-[11px] text-white/40 uppercase tracking-widest">
              {LOCALITIES.concat(LOCALITIES).map((loc, idx) => (
                <span key={idx} className="flex items-center gap-2 flex-shrink-0 hover:text-white/80 transition-colors cursor-default">
                  <span className="size-1 rounded-full bg-primary-500/80" />
                  {loc} · LIVE
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SEPARATOR STRIP ───────────────────────────────────────────── */}
      <QronosSeparator />

      {/* ── 3. FEATURE BENTO: SCHEDULE PREVIEW & DISPATCH RADAR ─────────── */}
      <section id="schedule" className="relative py-24 overflow-hidden">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <span className="font-mono text-xs text-primary-400 tracking-widest uppercase block mb-2">
                01 · AUTONOMOUS WORKFLOWS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                <span>Stateful dispatch.</span>
                <span className="block text-white/40 mt-1">KaamWala keeps work in motion.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                From emergency pipe bursts to scheduled AC maintenance, our stateful dispatcher coordinates verified local workers with real-time tracking, transparent itemized quotes, and escrow safety.
              </p>
            </div>
          </div>

          {/* Interactive Scheduler Preview (Mirroring Qronos Gantt Component) */}
          <QronosCard withTopRim withReticles className="p-0">
            <div className="flex flex-col lg:flex-row h-auto lg:h-[520px]">
              {/* Scheduler Left Sidebar */}
              <aside className="w-full lg:w-[22%] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-5 flex flex-col justify-between bg-[#0a0a0c]">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08] mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <div className="size-5 rounded bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
                        <Wrench className="w-3 h-3" />
                      </div>
                      <span>Dispatch Console</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      LIVE
                    </span>
                  </div>

                  <nav className="space-y-1 text-xs">
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.08] text-white border border-white/10 font-medium">
                      <span className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-primary-400" />
                        Live Schedules
                      </span>
                      <span className="size-1.5 rounded-full bg-primary-400" />
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer">
                      <Users className="w-3.5 h-3.5 text-white/40" />
                      <span>Verified Workers</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>Job Timeline</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer">
                      <Shield className="w-3.5 h-3.5 text-white/40" />
                      <span>Safety Escrow</span>
                    </div>
                  </nav>

                  <div className="mt-8 pt-4 border-t border-white/[0.06]">
                    <p className="text-[10px] font-mono uppercase text-white/35 tracking-wider mb-2">
                      Active Localities
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between py-1 text-white/70">
                        <span className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-cyan-400" /> Gokulam
                        </span>
                        <span className="font-mono text-[10px] text-white/40">18 active</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-white/70">
                        <span className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-emerald-400" /> Vijayanagar
                        </span>
                        <span className="font-mono text-[10px] text-white/40">24 active</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-white/70">
                        <span className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-amber-400" /> Kuvempunagar
                        </span>
                        <span className="font-mono text-[10px] text-white/40">15 active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] text-[10px] font-mono text-white/40">
                  <p>AVG ACCEPT TIME: 42 SEC</p>
                  <p className="text-emerald-400/80">DISPATCH READY: 100%</p>
                </div>
              </aside>

              {/* Scheduler Gantt Canvas Area */}
              <div className="flex-1 p-5 relative overflow-hidden bg-[#0e0e11] flex flex-col justify-between">
                {/* Time markers bar */}
                <div className="border-b border-white/[0.08] pb-3 mb-4 grid grid-cols-6 text-[10px] font-mono text-white/35 text-center">
                  <span>08:00 IST</span>
                  <span>10:00 IST</span>
                  <span>12:00 IST</span>
                  <span>14:00 IST</span>
                  <span>16:00 IST</span>
                  <span>18:00 IST</span>
                </div>

                {/* Vertical time grid lines */}
                <div className="absolute inset-x-5 top-14 bottom-5 pointer-events-none grid grid-cols-6 border-x border-white/[0.04]">
                  <div className="border-r border-dashed border-white/[0.05]" />
                  <div className="border-r border-dashed border-white/[0.05]" />
                  <div className="border-r border-dashed border-white/[0.05]" />
                  <div className="border-r border-dashed border-white/[0.05]" />
                  <div className="border-r border-dashed border-white/[0.05]" />
                </div>

                {/* Job Bars */}
                <div className="relative space-y-4 my-auto">
                  {/* Job 1 */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-1.5 rounded-sm bg-cyan-400" />
                      <span className="text-xs font-medium text-white/80">Plumbing Diagnostic · Pipe Burst</span>
                      <span className="text-[10px] font-mono text-white/30">Gokulam 3rd Stage · ₹450</span>
                    </div>
                    <div className="relative h-7 rounded-lg border border-cyan-500/30 bg-cyan-950/30 flex items-center px-3 ml-[8%] w-[55%] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <span className="text-[11px] font-mono text-cyan-200 truncate">
                        Assigned: Ravi Kumar · Quotation Confirmed · En Route
                      </span>
                      <span className="ml-auto size-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  </div>

                  {/* Job 2 */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-1.5 rounded-sm bg-emerald-400" />
                      <span className="text-xs font-medium text-white/80">Electrical Main Board MCB Fix</span>
                      <span className="text-[10px] font-mono text-white/30">Vijayanagar 2nd Stage · ₹800</span>
                    </div>
                    <div className="relative h-7 rounded-lg border border-emerald-500/30 bg-emerald-950/30 flex items-center px-3 ml-[22%] w-[68%] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <span className="text-[11px] font-mono text-emerald-200 truncate">
                        Worker On Site · Job Executed · OTP Pending
                      </span>
                      <span className="ml-auto text-[10px] font-mono text-emerald-400">92%</span>
                    </div>
                  </div>

                  {/* Job 3 */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-1.5 rounded-sm bg-primary-400" />
                      <span className="text-xs font-medium text-white/80">AC Deep Chemical Foam Clean</span>
                      <span className="text-[10px] font-mono text-white/30">Kuvempunagar · ₹1,200</span>
                    </div>
                    <div className="relative h-7 rounded-lg border border-primary-500/30 bg-primary-950/30 flex items-center px-3 ml-[35%] w-[45%] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <span className="text-[11px] font-mono text-primary-200 truncate">
                        Scheduled Arrival 14:30 · Verified Pro
                      </span>
                    </div>
                  </div>

                  {/* Job 4 */}
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-1.5 rounded-sm bg-amber-400" />
                      <span className="text-xs font-medium text-white/80">Door Frame Repair & Lock Installation</span>
                      <span className="text-[10px] font-mono text-white/30">Jayalakshmipuram · ₹650</span>
                    </div>
                    <div className="relative h-7 rounded-lg border border-amber-500/30 bg-amber-950/30 flex items-center px-3 ml-[15%] w-[40%] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <span className="text-[11px] font-mono text-amber-200 truncate">
                        Inspection Completed · Quotation Approved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer telemetry */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-white/40">
                  <span>DISPATCH SYSTEM: ACTIVE</span>
                  <span className="text-primary-400">CURRENT RUNTIME LOAD: 18%</span>
                </div>
              </div>
            </div>
          </QronosCard>

          {/* 3 Value propositions below Gantt */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock className="w-4 h-4 text-primary-400" />
                Schedule On Demand
              </p>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Book instantly for emergency fixes or pick exact slots across 15+ Mysuru localities.
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="w-4 h-4 text-emerald-400" />
                Durable Background Checks
              </p>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Aadhaar identity, police clearance, and trade skills verified before dispatch.
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                Transparent Quotations
              </p>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Itemized parts and labor breakdowns approved by you before a single screw turns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SEPARATOR STRIP ───────────────────────────────────────────── */}
      <QronosSeparator />

      {/* ── 5. ANIMATED PIPELINE: MULTI-WORKER MATCHING SVG ─────────────── */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <span className="font-mono text-xs text-primary-400 tracking-widest uppercase block mb-2">
                02 · REAL-TIME GEO-ROUTER
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                <span>Durable matchmaking.</span>
                <span className="block text-white/40 mt-1">Every booking routed in context.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Our smart dispatch pipeline connects your requirements with nearby verified workers based on trade skills, live locality coordinates, and historical quality ratings.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Animated SVG Pipeline Box (Direct Qronos Aesthetic) */}
            <QronosCard withTopRim withReticles className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-orange-400 animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.12em] text-white/50">
                      GEO DISPATCH PIPELINE · LIVE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/30">latency: 32ms</span>
                </div>

                {/* Animated SVG with Flowing Particle Beads */}
                <div className="relative py-4">
                  <svg viewBox="0 0 600 170" className="w-full h-auto block select-none" aria-label="Animated multi-worker dispatch pipeline">
                    <defs>
                      <linearGradient id="qronos-pipeline-flow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e8673a" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Connecting Dashed Paths */}
                    <path d="M 120 85 H 180" fill="none" stroke="url(#qronos-pipeline-flow)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
                    <path d="M 290 85 H 350" fill="none" stroke="url(#qronos-pipeline-flow)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
                    <path d="M 440 85 C 465 85, 470 45, 490 45" fill="none" stroke="url(#qronos-pipeline-flow)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
                    <path d="M 440 85 H 490" fill="none" stroke="url(#qronos-pipeline-flow)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
                    <path d="M 440 85 C 465 85, 470 125, 490 125" fill="none" stroke="url(#qronos-pipeline-flow)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />

                    {/* Flowing Animated Light Beads */}
                    <circle r="3" fill="#e8673a">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0s" path="M 120 85 H 180" />
                    </circle>
                    <circle r="3" fill="#f59e0b">
                      <animateMotion dur="1.1s" repeatCount="indefinite" begin="0.3s" path="M 290 85 H 350" />
                    </circle>
                    <circle r="3" fill="#10b981">
                      <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.1s" path="M 440 85 C 465 85, 470 45, 490 45" />
                    </circle>
                    <circle r="3" fill="#f59e0b">
                      <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.4s" path="M 440 85 H 490" />
                    </circle>
                    <circle r="3" fill="#e8673a">
                      <animateMotion dur="1.4s" repeatCount="indefinite" begin="0.7s" path="M 440 85 C 465 85, 470 125, 490 125" />
                    </circle>

                    {/* Node 1: Customer Request */}
                    <g>
                      <rect x="15" y="62" width="105" height="46" rx="6" fill="#121115" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                      <text x="67" y="80" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace" letterSpacing="0.08em">REQUEST</text>
                      <text x="67" y="97" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="600">New Task</text>
                    </g>

                    {/* Node 2: Geo State Router */}
                    <g>
                      <rect x="180" y="62" width="110" height="46" rx="6" fill="#121115" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                      <text x="235" y="80" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace" letterSpacing="0.08em">GEO FILTER</text>
                      <text x="235" y="97" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="600">Locality Radius</text>
                    </g>

                    {/* Node 3: Router Node */}
                    <g>
                      <rect x="350" y="52" width="90" height="66" rx="8" fill="#1b1210" stroke="#e8673a" strokeWidth="1.5" />
                      <text x="395" y="75" textAnchor="middle" fontSize="9" fill="#f28c67" fontFamily="monospace" letterSpacing="0.08em">MATCH ENGINE</text>
                      <text x="395" y="94" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="600">Broadcasting</text>
                      <circle cx="383" cy="107" r="2.5" fill="#e8673a" />
                      <circle cx="395" cy="107" r="2.5" fill="#f59e0b" />
                      <circle cx="407" cy="107" r="2.5" fill="#10b981" />
                    </g>

                    {/* Outputs */}
                    <g>
                      <rect x="490" y="30" width="105" height="30" rx="5" fill="#121115" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                      <text x="536" y="49" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">Plumbing Pro</text>
                      <circle cx="582" cy="45" r="3" fill="#10b981" />
                    </g>

                    <g>
                      <rect x="490" y="70" width="105" height="30" rx="5" fill="#121115" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                      <text x="536" y="89" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">Electrician</text>
                      <circle cx="582" cy="85" r="3" fill="#f59e0b" />
                    </g>

                    <g>
                      <rect x="490" y="110" width="105" height="30" rx="5" fill="#121115" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
                      <text x="536" y="129" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">Deep Cleaning</text>
                      <circle cx="582" cy="125" r="3" fill="#38bdf8" />
                    </g>
                  </svg>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 font-mono text-[11px] text-white/50">
                  <span className="text-primary-400">›</span>
                  <span>Pipeline active · 4 verified workers in Gokulam notified</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08] font-mono">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 block">JOBS TODAY</span>
                  <span className="text-base font-semibold text-white">164</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 block">MATCH RATE</span>
                  <span className="text-base font-semibold text-emerald-400">99.4%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/30 block">AVG ETA</span>
                  <span className="text-base font-semibold text-primary-400">18 MIN</span>
                </div>
              </div>
            </QronosCard>

            {/* Agent / Worker Inbox Queue (from Qronos Inbox) */}
            <QronosCard withTopRim withReticles className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[10px] tracking-[0.12em] text-white/50">
                      DISPATCH INBOX · FOCUSED QUEUE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-white/30">4 pending actions</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Quotation Approval Required</p>
                        <p className="text-[11px] text-white/40">Plumbing itemized quote ₹650 ready for approval</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">12m</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Worker Arrived At Location</p>
                        <p className="text-[11px] text-white/40">Electrician arrived at Gokulam 3rd Stage address</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">28m</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Mutual Completion Verified</p>
                        <p className="text-[11px] text-white/40">Customer & worker confirmed OTP completion</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">1h</span>
                  </div>

                  <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Police Background Verification Passed</p>
                        <p className="text-[11px] text-white/40">Suresh Kumar verified for Mysuru City North</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">3h</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-white/50">Manage all requests in Customer Dashboard</span>
                <Link to="/customer" className="text-xs font-medium text-primary-400 hover:text-primary-300 no-underline flex items-center gap-1">
                  Go to Inbox <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </QronosCard>
          </div>
        </div>
      </section>

      {/* ── 6. SEPARATOR STRIP ───────────────────────────────────────────── */}
      <QronosSeparator />

      {/* ── 7. PLATFORM INSIGHTS DASHBOARD (from Qronos Insights) ─────────── */}
      <section id="insights" className="relative py-24 overflow-hidden">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <span className="font-mono text-xs text-primary-400 tracking-widest uppercase block mb-2">
                03 · PLATFORM TELEMETRY
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                <span>Track service insights</span>
                <span className="block text-white/40 mt-1">in real time.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                Monitor service bookings as they progress across Mysuru, with live availability, transparent payouts, locality demand charts, and customer ratings.
              </p>
            </div>
          </div>

          <QronosCard withTopRim withReticles className="p-6">
            {/* KPI Cards Row with Laser Budget Scanner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1">
                  Jobs Completed
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">4,289</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-mono">↑ 14% vs last week</p>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1">
                  Jobs In Progress
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">142</p>
                <p className="text-[10px] text-cyan-400 mt-1 font-mono">Real-time dispatched</p>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1">
                  Verified Workers
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">512</p>
                <p className="text-[10px] text-primary-400 mt-1 font-mono">100% ID Checked</p>
              </div>

              {/* Escrow Payouts Meter with Animated Scanning Laser */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase mb-1">
                  <span>Daily Escrow Pool</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-xl font-bold text-white tracking-tight">
                  ₹1,48,200 <span className="text-xs text-white/40 font-normal">/ ₹2,00,000</span>
                </p>
                {/* Progress bar with laser scanner effect */}
                <div className="relative w-full h-1.5 rounded-full bg-white/[0.1] mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-emerald-400 w-[74%]" />
                  <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-budget-meter-scan" />
                </div>
                <p className="text-[9px] font-mono text-white/35 mt-1.5">74% released to workers</p>
              </div>
            </div>

            {/* Activity Chart & Live Active Jobs Table */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Locality Demand Chart (Qronos Assignee Chart Style) */}
              <div className="lg:col-span-5 p-5 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider">
                      Tasks Per Locality
                    </p>
                    <span className="font-mono text-[10px] text-white/40">TODAY</span>
                  </div>

                  {/* Locality Stacked Bars */}
                  <div className="space-y-3">
                    {[
                      { name: 'Gokulam', count: 48, pct: 85, color: 'bg-primary-500' },
                      { name: 'Vijayanagar', count: 42, pct: 75, color: 'bg-emerald-500' },
                      { name: 'Kuvempunagar', count: 34, pct: 60, color: 'bg-cyan-500' },
                      { name: 'Jayalakshmipuram', count: 28, pct: 50, color: 'bg-amber-500' },
                      { name: 'Hebbal', count: 22, pct: 38, color: 'bg-rose-500' },
                    ].map(loc => (
                      <div key={loc.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/80">{loc.name}</span>
                          <span className="font-mono text-[11px] text-white/40">{loc.count} tasks</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={`h-full ${loc.color} rounded-full`} style={{ width: `${loc.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] font-mono text-white/35 pt-4 border-t border-white/[0.06] mt-4">
                  PEAK DEMAND: 10:00 - 16:00 IST · ZERO BACKLOG
                </p>
              </div>

              {/* Live Real-Time Jobs Table */}
              <div className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Recent Active Bookings
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">● LIVE DISPATCH</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-white/40 font-mono text-[10px]">
                        <th className="px-4 py-2.5">SERVICE</th>
                        <th className="px-3 py-2.5">LOCALITY</th>
                        <th className="px-3 py-2.5">WORKER</th>
                        <th className="px-3 py-2.5">STATUS</th>
                        <th className="px-4 py-2.5 text-right">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                          Plumbing Leak
                        </td>
                        <td className="px-3 py-3 text-white/60">Gokulam</td>
                        <td className="px-3 py-3 text-white/80">Ravi K.</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                            <span className="size-1.5 rounded-full bg-cyan-400" /> En Route
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white/40">2m ago</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Short Circuit
                        </td>
                        <td className="px-3 py-3 text-white/60">Vijayanagar</td>
                        <td className="px-3 py-3 text-white/80">Suresh G.</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                            <span className="size-1.5 rounded-full bg-amber-400" /> Quoted
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white/40">14m ago</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Deep Cleaning
                        </td>
                        <td className="px-3 py-3 text-white/60">Kuvempunagar</td>
                        <td className="px-3 py-3 text-white/80">Meera S.</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <span className="size-1.5 rounded-full bg-emerald-400" /> Done
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white/40">35m ago</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <Hammer className="w-3.5 h-3.5 text-primary-400" />
                          Door Lock
                        </td>
                        <td className="px-3 py-3 text-white/60">Hebbal</td>
                        <td className="px-3 py-3 text-white/80">Anand B.</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/60 font-mono">
                            <span className="size-1.5 rounded-full bg-white/40" /> Accepted
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white/40">1h ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </QronosCard>
        </div>
      </section>

      {/* ── 8. SEPARATOR STRIP ───────────────────────────────────────────── */}
      <QronosSeparator />

      {/* ── 9. SERVICE TIERS & PRICING (from Qronos Pricing) ─────────────── */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="lg:col-span-7">
              <span className="font-mono text-xs text-primary-400 tracking-widest uppercase block mb-2">
                04 · TRANSPARENT PRICING
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                <span>Pricing that stays</span>
                <span className="block text-white/40 mt-1">predictable and fair.</span>
              </h2>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                No hidden inspection surge or opaque markups. Transparent booking fee + itemized labor quotes.
              </p>

              {/* Annual Toggle with Save 20% pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative w-8 h-4 rounded-full transition-colors ${billingPeriod === 'yearly' ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`block size-3 rounded-full bg-white transition-transform ${billingPeriod === 'yearly' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs font-mono text-white/80">Annual</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/25">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1: Pay Per Job */}
            <QronosCard withTopRim withReticles className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono tracking-wider text-white/50 uppercase">PAY-AS-YOU-GO</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white/40 border border-white/10">STANDARD</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">₹30</span>
                  <span className="text-xs text-white/40 font-mono">booking deposit</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-6">
                  Ideal for one-time home repairs, minor plumbing or electrical diagnostics in Mysuru.
                </p>

                <ul className="space-y-3 text-xs text-white/70 mb-8 border-t border-white/[0.08] pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    ₹30 flat booking fee credited to final quote
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Verified local pro assigned in &lt; 2 mins
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Itemized digital quotation before work starts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Secure OTP mutual completion release
                  </li>
                </ul>
              </div>

              <Link
                to="/customer/book"
                className="w-full py-2.5 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] text-center text-xs font-semibold tracking-wider uppercase text-white transition-all no-underline"
              >
                BOOK SINGLE JOB
              </Link>
            </QronosCard>

            {/* Tier 2: Home Care Pass (Highlighted with Star Button) */}
            <QronosCard withTopRim withReticles className="p-6 flex flex-col justify-between border-primary-500/40 relative">
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary-500 text-black text-[10px] font-bold tracking-widest uppercase">
                MOST POPULAR
              </span>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono tracking-wider text-primary-400 uppercase">HOME CARE PASS</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-primary-300 border border-primary-500/30 bg-primary-500/10">PRO</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingPeriod === 'yearly' ? '₹399' : '₹499'}
                  </span>
                  <span className="text-xs text-white/40 font-mono">/ month</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-6">
                  Complete peace of mind for families and households across Mysuru with unlimited zero-fee bookings.
                </p>

                <ul className="space-y-3 text-xs text-white/80 mb-8 border-t border-white/[0.08] pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Unlimited zero-fee bookings across all categories
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Priority dispatch (15-min arrival SLA)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    10% discount on all worker labor quotations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Top 5% rated master craftsmen assigned
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    ₹10,000 property damage protection guarantee
                  </li>
                </ul>
              </div>

              <StarButton to="/customer/book" size="md" variant="orange" className="w-full">
                GET HOME CARE PASS
              </StarButton>
            </QronosCard>

            {/* Tier 3: Society & Enterprise */}
            <QronosCard withTopRim withReticles className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono tracking-wider text-white/50 uppercase">APARTMENT / ESTATE</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white/40 border border-white/10">ENTERPRISE</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">Custom</span>
                  <span className="text-xs text-white/40 font-mono">per property</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-6">
                  For gated communities, commercial facilities, and residential societies in Mysuru.
                </p>

                <ul className="space-y-3 text-xs text-white/70 mb-8 border-t border-white/[0.08] pt-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Dedicated on-site electrician & plumber roster
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Centralized society manager billing portal
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Scheduled pump & generator maintenance runs
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Dedicated 24/7 emergency dispatch manager
                  </li>
                </ul>
              </div>

              <a
                href="tel:0821-2550101"
                className="w-full py-2.5 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] text-center text-xs font-semibold tracking-wider uppercase text-white transition-all no-underline"
              >
                CONTACT ENTERPRISE DESK
              </a>
            </QronosCard>
          </div>
        </div>
      </section>

      {/* ── 10. SEPARATOR STRIP ──────────────────────────────────────────── */}
      <QronosSeparator />

      {/* ── 11. TESTIMONIALS & TRUST ─────────────────────────────────────── */}
      <section id="customers" className="relative py-24 overflow-hidden">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-14">
            <span className="font-mono text-xs text-primary-400 tracking-widest uppercase block mb-2">
              05 · PROVEN SATISFACTION
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Trusted by 4,200+ households in Mysuru.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Krishnamurthy',
                area: 'Vijayanagar 2nd Stage',
                service: 'Plumbing',
                quote: 'Ravi from KaamWala arrived in 20 minutes, showed a transparent itemized quotation before touching a pipe, and fixed our kitchen sink completely. Zero surprise charges.',
                rating: 5
              },
              {
                name: 'Suresh Gowda',
                area: 'Gokulam 3rd Stage',
                service: 'Electrical Repair',
                quote: 'The electrician was identity-verified, courteous, and resolved our main distribution board tripping issue with precision. The ₹30 fee gave immense peace of mind.',
                rating: 5
              },
              {
                name: 'Meera Srinivas',
                area: 'Kuvempunagar',
                service: 'Deep Cleaning',
                quote: 'Finally a reliable, professional home maintenance platform for Mysuru! Loved seeing the worker reviews and police verification badge before confirming.',
                rating: 5
              }
            ].map(t => (
              <QronosCard key={t.name} withTopRim className="p-6">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6 font-normal italic">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/40 font-mono">{t.area}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-primary-400 border border-primary-500/25 bg-primary-500/10">
                    {t.service}
                  </span>
                </div>
              </QronosCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. BOTTOM CONVERSION CTA ────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden border-t border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,103,58,0.18),transparent_70%)]">
        <div className="max-w-[1344px] mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-[10px] font-mono tracking-wider uppercase text-white/80 mb-6">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DISPATCH ACTIVE · 15+ MYSURU LOCALITIES
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 max-w-2xl">
            Ready to experience reliable home service dispatch?
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mb-8">
            Book trusted local workers in minutes with transparent quotations and guaranteed peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <StarButton to="/customer/book" size="lg" variant="orange">
              START A SERVICE REQUEST
            </StarButton>
            <Link
              to="/customer/find"
              className="text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white px-5 py-3 transition-colors no-underline flex items-center gap-2"
            >
              Browse All Services <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}