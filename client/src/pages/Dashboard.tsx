import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Heart, Activity, Thermometer, AlertTriangle, Wifi, WifiOff, Battery,
  Bell, MapPin, Phone, Plus, Trash2, Edit2, Clock, Shield, User,
  LogOut, Menu, ChevronRight, TrendingUp, TrendingDown, Calendar,
  BarChart3, Zap, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend, BarChart, Bar
} from "recharts";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Demo user (in production, use session/JWT)
const DEMO_USER = { id: 1, nome: "João Silva", email: "joao@sage.com", nomePlano: "Premium" };

// ─── Period selector ──────────────────────────────────────────────────────────
const PERIODS = [
  { label: "7d", value: 7 },
  { label: "15d", value: 15 },
  { label: "20d", value: 20 },
  { label: "30d", value: 30 },
] as const;

// ─── Notification Sound Hook ──────────────────────────────────────────────────
function useNotificationSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playAlertSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Two-tone alert beep (ascending)
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.15);        // A5
      playTone(1100, now + 0.18, 0.15); // ~C#6
      playTone(1320, now + 0.36, 0.25); // E6

      // Vibrate on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (e) {
      console.warn("Could not play notification sound:", e);
    }
  }, []);

  return playAlertSound;
}

// ─── Vital Card ───────────────────────────────────────────────────────────────
function VitalCard({ icon: Icon, label, value, unit, status, color, trend, subtitle }: {
  icon: React.ElementType; label: string; value: string; unit: string;
  status: "normal" | "alerta" | "critico"; color: string;
  trend?: "up" | "down" | "stable"; subtitle?: string;
}) {
  const statusColors = { normal: "#10B981", alerta: "#F59E0B", critico: "#EF4444" };
  const statusLabels = { normal: "Normal", alerta: "Atenção", critico: "Crítico" };
  return (
    <div className="p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 sm:w-5 h-4 sm:h-5" style={{ color }} />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium"
          style={{ background: `${statusColors[status]}15`, color: statusColors[status] }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColors[status] }} />
          {statusLabels[status]}
        </div>
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-2xl sm:text-3xl font-bold text-white">{value}</span>
        <span className="text-slate-400 text-xs sm:text-sm mb-0.5 sm:mb-1">{unit}</span>
        {trend && (
          <span className="mb-0.5 sm:mb-1 ml-1">
            {trend === "up" ? <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-400" /> : trend === "down" ? <TrendingDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-400" /> : null}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-xs sm:text-sm">{label}</div>
      {subtitle && <div className="text-slate-600 text-[10px] sm:text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-lg" style={{ background: "rgba(14,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="text-slate-400 text-[10px] sm:text-xs mb-2 font-medium">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function BottomNav({ activeTab, setActiveTab, naoLidosCount }: {
  activeTab: string; setActiveTab: (t: string) => void; naoLidosCount: number;
}) {
  const items = [
    { id: "vitais", label: "Vitais", icon: Activity },
    { id: "alertas", label: "Alertas", icon: Bell, badge: naoLidosCount },
    { id: "historico", label: "Histórico", icon: BarChart3 },
    { id: "contatos", label: "Contatos", icon: Phone },
    { id: "perfil", label: "Perfil", icon: User },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ background: "rgba(7,9,14,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {items.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors relative min-w-0"
            style={{ color: activeTab === item.id ? "#0EA5E9" : "#64748b" }}>
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[8px] font-bold text-white"
                  style={{ background: "#EF4444", padding: "0 3px" }}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: "#0EA5E9" }} />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, onLogout }: { activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }) {
  const items = [
    { id: "vitais", label: "Sinais Vitais", icon: Activity },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "dispositivos", label: "Dispositivos", icon: Wifi },
    { id: "historico", label: "Histórico", icon: BarChart3 },
    { id: "eventos", label: "Log de Eventos", icon: Bell },
    { id: "contatos", label: "Contatos", icon: Phone },
    { id: "perfil", label: "Meu Perfil", icon: User },
  ];
  return (
    <div className="flex flex-col h-full" style={{ background: "rgba(7,9,14,0.95)" }}>
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">Sage</div>
            <div className="text-xs text-slate-500">Dashboard</div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
            style={{ background: activeTab === item.id ? "rgba(14,165,233,0.15)" : "transparent", color: activeTab === item.id ? "#0EA5E9" : "#94a3b8", border: activeTab === item.id ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent" }}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
            {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </div>
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            {DEMO_USER.nome.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{DEMO_USER.nome}</div>
            <div className="text-slate-500 text-xs">{DEMO_USER.nomePlano}</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm">
          <LogOut className="w-4 h-4" />Sair
        </button>
      </div>
    </div>
  );
}

function AddContatoModal({ isOpen, onClose, onSuccess, idUsuario }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, idUsuario: number }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [parentesco, setParentesco] = useState("");
  
  const createCuidador = trpc.cuidadores.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      toast.success("Contato adicionado com sucesso!");
      setNome(""); setEmail(""); setTelefone(""); setParentesco("");
    },
    onError: (e) => toast.error(e.message)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#0A0F16", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-xl font-bold text-white mb-4">Adicionar Contato de Emergência</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
            <input value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">E-mail (opcional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Parentesco</label>
            <input value={parentesco} onChange={e => setParentesco(e.target.value)} placeholder="Ex: Filho, Cuidador..." className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition-all">Cancelar</button>
          <button onClick={() => createCuidador.mutate({ nome, telefone, email: email || undefined, parentesco, idUsuario })} disabled={createCuidador.isPending || !nome || !telefone} className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            {createCuidador.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VincularDispositivoModal({ isOpen, onClose, onSuccess, idUsuario }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, idUsuario: number }) {
  const [codigoSerial, setCodigoSerial] = useState("");
  const vincularDispositivo = trpc.dispositivos.link.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      toast.success("Dispositivo vinculado com sucesso!");
      setCodigoSerial("");
    },
    onError: (e) => toast.error(e.message)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#0A0F16", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-xl font-bold text-white mb-4">Vincular Dispositivo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Código Serial do Colete</label>
            <input value={codigoSerial} onChange={e => setCodigoSerial(e.target.value)} placeholder="Ex: SGW-004" className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition-all">Cancelar</button>
          <button onClick={() => vincularDispositivo.mutate({ codigoSerial, idUsuario })} disabled={vincularDispositivo.isPending || !codigoSerial} className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            {vincularDispositivo.isPending ? "Vinculando..." : "Vincular"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("vitais");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(20);
  const [showAddContato, setShowAddContato] = useState(false);
  const [showAddDispositivo, setShowAddDispositivo] = useState(false);
  const [bellShake, setBellShake] = useState(false);

  const [selectedDispositivoId, setSelectedDispositivoId] = useState<number | null>(null);
  const prevNaoLidosRef = useRef<number>(0);
  const playAlertSound = useNotificationSound();

  const dispositivosQuery = trpc.dispositivos.list.useQuery({ idUsuario: DEMO_USER.id });

  // Auto-select first device when loaded
  useEffect(() => {
    if (!selectedDispositivoId && dispositivosQuery.data && dispositivosQuery.data.length > 0) {
      setSelectedDispositivoId(dispositivosQuery.data[0]?.id);
    }
  }, [dispositivosQuery.data, selectedDispositivoId]);

  // ─── Queries (dados do dispositivo selecionado) ──────────────────────────────────
  const ultimaLeituraQuery = trpc.sensores.ultimaPorDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId! },
    { enabled: !!selectedDispositivoId, refetchInterval: 10000 }
  );

  const resumoDiarioQuery = trpc.sensores.resumoDiarioByDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId!, dias: selectedPeriod },
    { enabled: !!selectedDispositivoId, refetchInterval: 30000 }
  );

  const historicoQuery = trpc.sensores.historicoByDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId!, dias: selectedPeriod },
    { enabled: !!selectedDispositivoId, refetchInterval: 30000 }
  );

  const eventosQuery = trpc.eventosSaude.byDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId!, limit: 30 },
    { enabled: !!selectedDispositivoId }
  );

  const cuidadoresQuery = trpc.cuidadores.list.useQuery({ idUsuario: DEMO_USER.id });

  // Alertas queries
  const alertasQuery = trpc.alertas.byDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId!, limit: 50 },
    { enabled: !!selectedDispositivoId, refetchInterval: 10000 }
  );
  const alertasNaoLidosQuery = trpc.alertas.naoLidosByDispositivo.useQuery(
    { idDispositivo: selectedDispositivoId! },
    { enabled: !!selectedDispositivoId, refetchInterval: 10000 }
  );
  const marcarLido = trpc.alertas.marcarLido.useMutation({
    onSuccess: () => { alertasQuery.refetch(); alertasNaoLidosQuery.refetch(); },
  });
  const marcarTodosLidos = trpc.alertas.marcarTodosLidosByDispositivo.useMutation({
    onSuccess: () => { alertasQuery.refetch(); alertasNaoLidosQuery.refetch(); toast.success("Todos alertas marcados como lidos."); },
  });

  const naoLidosCount = alertasNaoLidosQuery.data ?? 0;

  // ─── Play sound when new alerts arrive ──────────────────────────────────
  useEffect(() => {
    if (naoLidosCount > prevNaoLidosRef.current && prevNaoLidosRef.current >= 0) {
      playAlertSound();
      setBellShake(true);
      setTimeout(() => setBellShake(false), 600);
      toast.warning("🚨 Novo alerta de saúde detectado!", {
        description: "Verifique os sinais vitais imediatamente.",
        duration: 6000,
      });
    }
    prevNaoLidosRef.current = naoLidosCount;
  }, [naoLidosCount, playAlertSound]);

  const deleteCuidador = trpc.cuidadores.delete.useMutation({
    onSuccess: () => { cuidadoresQuery.refetch(); toast.success("Contato removido."); },
  });

  const handleLogout = () => { window.location.href = "/"; };

  // ─── Derived vitals from latest reading ─────────────────────────────────
  const lastReading = ultimaLeituraQuery.data;
  const vitals = useMemo(() => ({
    bpm: Number(lastReading?.frequenciaCardiaca ?? 0),
    spo2: Number(lastReading?.oxigenacaoSpo2 ?? 0),
    temp: Number(lastReading?.temperaturaCorporal ?? 0),
    bateria: Number(lastReading?.nivelBateria ?? 0),
    queda: lastReading?.quedaDetectada ?? false,
    lat: Number(lastReading?.latitude ?? 0),
    lng: Number(lastReading?.longitude ?? 0),
    lastUpdate: lastReading?.recebidoEm ? new Date(lastReading.recebidoEm) : null,
  }), [lastReading]);

  const hasData = vitals.bpm > 0;
  const bpmStatus = !hasData ? "normal" : vitals.bpm > 90 ? "alerta" : vitals.bpm < 60 ? "alerta" : "normal";
  const spo2Status = !hasData ? "normal" : vitals.spo2 < 95 ? "critico" : vitals.spo2 < 97 ? "alerta" : "normal";
  const tempStatus = !hasData ? "normal" : vitals.temp > 37.5 ? "alerta" : vitals.temp < 36 ? "alerta" : "normal";

  // ─── Chart data from resumo diario ──────────────────────────────────────
  const chartData = useMemo(() => {
    const resumo = resumoDiarioQuery.data ?? [];
    return resumo.map(d => ({
      dia: d.dia ? new Date(d.dia + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "",
      diaFull: d.dia,
      bpm: d.bpmMedio,
      bpmMin: d.bpmMin,
      bpmMax: d.bpmMax,
      spo2: d.spo2Medio,
      spo2Min: d.spo2Min,
      spo2Max: d.spo2Max,
      temp: d.tempMedia,
      quedas: d.quedas,
      leituras: d.totalLeituras,
    }));
  }, [resumoDiarioQuery.data]);

  // ─── Summary stats from chart data ──────────────────────────────────────
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const bpms = chartData.filter(d => d.bpm != null).map(d => d.bpm!);
    const spo2s = chartData.filter(d => d.spo2 != null).map(d => d.spo2!);
    const temps = chartData.filter(d => d.temp != null).map(d => d.temp!);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0;
    return {
      bpmMedio: avg(bpms), spo2Medio: avg(spo2s), tempMedia: avg(temps),
      totalLeituras: chartData.reduce((a, d) => a + (d.leituras ?? 0), 0),
      totalQuedas: chartData.reduce((a, d) => a + (d.quedas ?? 0), 0),
      totalDias: chartData.length,
    };
  }, [chartData]);

  // ─── Last 50 raw readings for sparkline ─────────────────────────────────
  const sparkData = useMemo(() => {
    const raw = historicoQuery.data ?? [];
    return raw.slice(-50).map((l: any) => ({
      t: l?.recebidoEm ? new Date(l.recebidoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
      bpm: Number(l?.frequenciaCardiaca ?? 0),
      spo2: Number(l?.oxigenacaoSpo2 ?? 0),
      temp: Number(l?.temperaturaCorporal ?? 0),
    }));
  }, [historicoQuery.data]);

  const lastUpdateStr = vitals.lastUpdate ? vitals.lastUpdate.toLocaleTimeString("pt-BR") : "—";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0F16" }}>
      <AddContatoModal isOpen={showAddContato} onClose={() => setShowAddContato(false)} onSuccess={() => cuidadoresQuery.refetch()} idUsuario={DEMO_USER.id} />
      <VincularDispositivoModal isOpen={showAddDispositivo} onClose={() => setShowAddDispositivo(false)} onSuccess={() => dispositivosQuery.refetch()} idUsuario={DEMO_USER.id} />
      
      {/* Sidebar desktop */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      </div>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} onLogout={handleLogout} />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} naoLidosCount={naoLidosCount} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,15,22,0.9)" }}>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button className="lg:hidden text-slate-400 hover:text-white flex-shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg capitalize truncate">
                {activeTab === "vitais" ? "Sinais Vitais" : activeTab === "alertas" ? "Alertas" : activeTab === "dispositivos" ? "Dispositivos" : activeTab === "historico" ? "Histórico" : activeTab === "eventos" ? "Eventos" : activeTab === "contatos" ? "Contatos" : "Perfil"}
              </h1>
              <p className="text-slate-500 text-[10px] sm:text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" /> {lastUpdateStr}
                {ultimaLeituraQuery.isFetching && <RefreshCw className="w-3 h-3 animate-spin text-sky-400 ml-1" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Device Selector - hidden on small mobile */}
              {dispositivosQuery.data && dispositivosQuery.data.length > 0 && (
                <div className="relative hidden sm:block">
                  <select
                    className="appearance-none bg-transparent text-white text-sm font-medium pr-8 pl-3 py-1.5 rounded-lg outline-none cursor-pointer transition-all border border-slate-700 hover:border-sky-500/50"
                    style={{ background: "rgba(14,20,30,0.8)" }}
                    value={selectedDispositivoId || ""}
                    onChange={(e) => setSelectedDispositivoId(Number(e.target.value))}
                  >
                    {dispositivosQuery.data.map(d => (
                      <option key={d?.id} value={d?.id} className="bg-slate-900 text-white">
                        Colete: {d?.codigoSerial}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}

              {/* Notification bell with badge */}
            <button onClick={() => setActiveTab("alertas")} className={`relative p-2 rounded-lg transition-all hover:bg-white/5 ${bellShake ? "animate-bell-shake" : ""}`} title="Alertas de Saúde">
              <Bell className={`w-5 h-5 ${naoLidosCount > 0 ? "text-amber-400" : "text-slate-400"}`} />
              {naoLidosCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white animate-pulse"
                  style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", padding: "0 4px" }}>
                  {naoLidosCount > 99 ? "99+" : naoLidosCount}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: hasData ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${hasData ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`, color: hasData ? "#10B981" : "#F59E0B" }}>
              <div className={`w-1.5 h-1.5 rounded-full ${hasData ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
              {hasData ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        {/* Content area — extra bottom padding on mobile for bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6">

          {/* ═══════════════════ TAB: SINAIS VITAIS ═══════════════════════ */}
          {activeTab === "vitais" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Device selector on mobile */}
              {dispositivosQuery.data && dispositivosQuery.data.length > 0 && (
                <div className="sm:hidden">
                  <select
                    className="w-full appearance-none bg-transparent text-white text-sm font-medium px-4 py-2.5 rounded-xl outline-none cursor-pointer border border-slate-700"
                    style={{ background: "rgba(14,20,30,0.8)" }}
                    value={selectedDispositivoId || ""}
                    onChange={(e) => setSelectedDispositivoId(Number(e.target.value))}
                  >
                    {dispositivosQuery.data.map(d => (
                      <option key={d?.id} value={d?.id} className="bg-slate-900 text-white">
                        Colete: {d?.codigoSerial}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vital cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <VitalCard icon={Heart} label="Freq. Cardíaca" value={hasData ? Math.round(vitals.bpm).toString() : "—"} unit="BPM" status={bpmStatus} color="#F43F5E" trend={vitals.bpm > 80 ? "up" : "stable"} subtitle={hasData ? "Tempo real" : "Aguardando"} />
                <VitalCard icon={Activity} label="Saturação SpO₂" value={hasData ? vitals.spo2.toFixed(0) : "—"} unit="%" status={spo2Status} color="#10B981" subtitle={hasData ? "Oxigenação" : "Aguardando"} />
                <VitalCard icon={Thermometer} label="Temperatura" value={hasData ? vitals.temp.toFixed(1) : "—"} unit="°C" status={tempStatus} color="#F59E0B" subtitle={hasData ? "Corporal" : "Aguardando"} />
                <VitalCard icon={AlertTriangle} label="Quedas" value={stats ? stats.totalQuedas.toString() : "0"} unit={`(${selectedPeriod}d)`} status="normal" color="#8B5CF6" subtitle="No período" />
              </div>

              {/* Real-time BPM Chart */}
              <div className="p-4 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Freq. Cardíaca — Recentes</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{sparkData.length} leituras · atualiza a cada 10s</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-rose-400" /> BPM
                  </div>
                </div>
                {sparkData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={["auto", "auto"]} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="bpm" name="BPM" stroke="#F43F5E" fill="url(#bpmGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-slate-500 text-sm">
                    <Zap className="w-5 h-5 mr-2" /> Aguardando leituras do sensor...
                  </div>
                )}
                {sparkData.length > 0 && (
                  <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-slate-500">
                    <span>Min: {Math.round(Math.min(...sparkData.map(d => d.bpm).filter(v => v > 0)))} BPM</span>
                    <span>Média: {Math.round(sparkData.filter(d => d.bpm > 0).reduce((a, b) => a + b.bpm, 0) / Math.max(sparkData.filter(d => d.bpm > 0).length, 1))} BPM</span>
                    <span>Max: {Math.round(Math.max(...sparkData.map(d => d.bpm)))} BPM</span>
                  </div>
                )}
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Localização", value: hasData && vitals.lat ? `${vitals.lat.toFixed(4)}, ${vitals.lng.toFixed(4)}` : "Sem GPS", icon: MapPin, color: "#0EA5E9" },
                  { label: "Bateria do Colete", value: hasData ? `${vitals.bateria}%` : "—", icon: Battery, color: vitals.bateria > 20 ? "#10B981" : "#EF4444" },
                  { label: "Último Sinal", value: vitals.lastUpdate ? formatTimeAgo(vitals.lastUpdate) : "Sem dados", icon: Clock, color: "#F59E0B" },
                ].map(item => (
                  <div key={item.label} className="p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4" style={{ background: "rgba(14,20,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                      <item.icon className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-slate-400 text-[10px] sm:text-xs">{item.label}</div>
                      <div className="text-white font-semibold text-sm sm:text-base truncate">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════ TAB: ALERTAS ════════════════════════ */}
          {activeTab === "alertas" && (
            <div className="space-y-4">
              {/* Header com botão marcar todos lidos */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: naoLidosCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${naoLidosCount > 0 ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`, color: naoLidosCount > 0 ? "#EF4444" : "#10B981" }}>
                    <div className={`w-1.5 h-1.5 rounded-full ${naoLidosCount > 0 ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
                    {naoLidosCount > 0 ? `${naoLidosCount} não lido${naoLidosCount > 1 ? "s" : ""}` : "Tudo em dia"}
                  </div>
                </div>
                {naoLidosCount > 0 && selectedDispositivoId && (
                  <button onClick={() => marcarTodosLidos.mutate({ idDispositivo: selectedDispositivoId })}
                    className="px-4 py-2 rounded-xl text-xs text-white font-medium transition-all hover:-translate-y-0.5 w-full sm:w-auto text-center"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Marcar todos como lidos
                  </button>
                )}
              </div>

              {/* Limites de referência */}
              <div className="p-3 sm:p-4 rounded-xl" style={{ background: "rgba(14,20,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h4 className="text-[10px] sm:text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Limites de segurança</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { label: "BPM Mín", value: "50", unit: "bpm", color: "#F43F5E" },
                    { label: "BPM Máx", value: "120", unit: "bpm", color: "#F43F5E" },
                    { label: "SpO₂ Mín", value: "92", unit: "%", color: "#10B981" },
                    { label: "Temp Mín", value: "35.0", unit: "°C", color: "#F59E0B" },
                    { label: "Temp Máx", value: "38.5", unit: "°C", color: "#F59E0B" },
                  ].map(l => (
                    <div key={l.label} className="text-center">
                      <div className="text-base sm:text-lg font-bold" style={{ color: l.color }}>{l.value}<span className="text-[9px] sm:text-xs font-normal text-slate-500 ml-0.5">{l.unit}</span></div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500">{l.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de alertas */}
              {alertasQuery.isLoading ? (
                <div className="text-slate-400 text-center py-12">Carregando alertas...</div>
              ) : (alertasQuery.data ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Nenhum alerta registrado</p>
                  <p className="text-slate-500 text-sm mt-1">Alertas serão gerados automaticamente quando os sinais vitais ultrapassarem os limites.</p>
                </div>
              ) : (
                (alertasQuery.data ?? []).map((alerta: any) => {
                  const isCritico = alerta.severidade === "critico";
                  const alertColor = isCritico ? "#EF4444" : "#F59E0B";
                  const alertBg = isCritico ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)";
                  const tipoIcons: Record<string, string> = {
                    BPM_BAIXO: "❤️", BPM_ALTO: "❤️", SPO2_BAIXO: "🫁", TEMP_ALTA: "🌡️", TEMP_BAIXA: "🌡️", QUEDA: "🚨",
                  };
                  return (
                    <div key={alerta.id} className={`p-3 sm:p-4 rounded-xl flex items-start gap-3 sm:gap-4 transition-all ${!alerta.lido ? "" : "opacity-70"}`}
                      style={{ background: alertBg, border: `1px solid ${alertColor}${!alerta.lido ? "40" : "20"}`, outline: !alerta.lido ? `1px solid ${alertColor}30` : undefined }}>
                      <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{tipoIcons[alerta.tipo] ?? "⚠️"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-white text-xs sm:text-sm">{alerta.titulo}</span>
                          {!alerta.lido && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: `${alertColor}20`, color: alertColor }}>NOVO</span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[10px] sm:text-xs mt-1">{alerta.mensagem}</div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-[10px] sm:text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: `${alertColor}15`, color: alertColor }}>
                            {isCritico ? "CRÍTICO" : "ALERTA"}
                          </span>
                          <span>{alerta.criadoEm ? new Date(alerta.criadoEm).toLocaleString("pt-BR") : "—"}</span>
                        </div>
                      </div>
                      {!alerta.lido && (
                        <button onClick={() => marcarLido.mutate({ id: alerta.id })}
                          className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all border"
                          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                          Lido
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ═══════════════════ TAB: DISPOSITIVOS ════════════════════════ */}
          {activeTab === "dispositivos" && (
            <div className="space-y-4">
              {dispositivosQuery.isLoading ? (
                <div className="text-slate-400 text-center py-12">Carregando dispositivos...</div>
              ) : (dispositivosQuery.data ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <Wifi className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum dispositivo vinculado</p>
                  <button onClick={() => setShowAddDispositivo(true)} className="mt-4 px-4 py-2 rounded-xl text-sm text-white font-medium transition-all" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    Vincular Dispositivo
                  </button>
                </div>
              ) : (
                (dispositivosQuery.data ?? []).map((d: any) => (
                  <div key={d.id} className="p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: d.statusConexao === "Online" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                      {d.statusConexao === "Online" ? <Wifi className="w-5 sm:w-6 h-5 sm:h-6 text-green-400" /> : <WifiOff className="w-5 sm:w-6 h-5 sm:h-6 text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm sm:text-base">Colete #{d.codigoSerial}</div>
                      <div className="text-slate-400 text-xs sm:text-sm truncate">FW {d.versaoFirmware ?? "v1.0.0"} · {d.tipoConexao ?? "4G/WiFi"}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Battery className="w-4 h-4" style={{ color: (d.nivelBateria ?? 0) > 20 ? "#10B981" : "#EF4444" }} />
                        <span className="text-white font-medium text-sm">{d.nivelBateria ?? 0}%</span>
                      </div>
                      <div className="text-xs" style={{ color: d.statusConexao === "Online" ? "#10B981" : "#EF4444" }}>{d.statusConexao}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ═══════════════════ TAB: HISTÓRICO ═══════════════════════════ */}
          {activeTab === "historico" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Period selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">Período:</span>
                  <div className="flex gap-1 mobile-scroll-x">
                    {PERIODS.map(p => (
                      <button key={p.value} onClick={() => setSelectedPeriod(p.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                        style={{
                          background: selectedPeriod === p.value ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.05)",
                          color: selectedPeriod === p.value ? "#0EA5E9" : "#94a3b8",
                          border: selectedPeriod === p.value ? "1px solid rgba(14,165,233,0.3)" : "1px solid transparent",
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {resumoDiarioQuery.isFetching && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin flex-shrink-0" />}
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { l: `BPM Médio`, v: stats?.bpmMedio?.toString() ?? "—", u: "bpm", c: "#F43F5E", icon: Heart },
                  { l: `SpO₂ Médio`, v: stats?.spo2Medio?.toString() ?? "—", u: "%", c: "#10B981", icon: Activity },
                  { l: `Temp. Média`, v: stats?.tempMedia?.toString() ?? "—", u: "°C", c: "#F59E0B", icon: Thermometer },
                  { l: "Leituras", v: stats?.totalLeituras?.toString() ?? "0", u: "total", c: "#8B5CF6", icon: BarChart3 },
                ].map(s => (
                  <div key={s.l} className="p-4 sm:p-5 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <s.icon className="w-4 h-4" style={{ color: s.c }} />
                      <span className="text-slate-400 text-[10px] sm:text-xs truncate">{s.l}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: s.c }}>
                      {s.v} <span className="text-[10px] sm:text-sm font-normal text-slate-400">{s.u}</span>
                    </div>
                  </div>
                ))}
              </div>

              {chartData.length === 0 ? (
                <div className="p-8 sm:p-12 rounded-2xl text-center" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Nenhum dado no período</p>
                  <p className="text-slate-500 text-sm mt-1">Envie leituras via a API do colete para visualizar os relatórios</p>
                </div>
              ) : (
                <>
                  {/* BPM History Chart */}
                  <div className="p-4 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Freq. Cardíaca — Média Diária</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">{chartData.length} dias com dados</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="bpmHistGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={["auto", "auto"]} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
                        <Area type="monotone" dataKey="bpm" name="BPM Médio" stroke="#F43F5E" fill="url(#bpmHistGrad)" strokeWidth={2.5} dot={{ r: 2, fill: "#F43F5E" }} />
                        <Line type="monotone" dataKey="bpmMax" name="BPM Máx" stroke="#FB7185" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="bpmMin" name="BPM Mín" stroke="#FDA4AF" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* SpO2 History Chart */}
                  <div className="p-4 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">SpO₂ — Média Diária</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">Valores normais: 95% — 100%</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="spo2HistGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={[90, 100]} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
                        <Area type="monotone" dataKey="spo2" name="SpO₂ Médio" stroke="#10B981" fill="url(#spo2HistGrad)" strokeWidth={2.5} dot={{ r: 2, fill: "#10B981" }} />
                        <Line type="monotone" dataKey="spo2Min" name="SpO₂ Mín" stroke="#6EE7B7" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Temperature History Chart */}
                  <div className="p-4 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Temperatura — Média Diária</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">Faixa normal: 36.0°C — 37.5°C</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={[35, 39]} width={30} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="temp" name="Temp °C" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 2, fill: "#F59E0B" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Falls bar chart */}
                  {chartData.some(d => (d.quedas ?? 0) > 0) && (
                    <div className="p-4 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Quedas por Dia</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">Total: {stats?.totalQuedas ?? 0} quedas</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="dia" tick={{ fontSize: 9, fill: "#64748b" }} />
                          <YAxis tick={{ fontSize: 9, fill: "#64748b" }} allowDecimals={false} width={20} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="quedas" name="Quedas" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════════════ TAB: EVENTOS ═════════════════════════════ */}
          {activeTab === "eventos" && (
            <div className="space-y-3">
              {eventosQuery.isLoading ? (
                <div className="text-slate-400 text-center py-12">Carregando eventos...</div>
              ) : (eventosQuery.data ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum evento registrado</p>
                  <p className="text-slate-500 text-sm mt-1">Eventos de saúde aparecerão aqui automaticamente</p>
                </div>
              ) : (
                (eventosQuery.data ?? []).map((ev: any) => {
                  const cat = ev.categoriaEvento ?? "Evento";
                  const isQueda = cat.includes("Queda");
                  const isCritico = isQueda || cat.includes("Crítico");
                  const isAviso = cat.includes("SpO2") || cat.includes("BPM") || cat.includes("Bateria");
                  const evColor = isCritico ? "#EF4444" : isAviso ? "#F59E0B" : "#10B981";
                  const evBg = isCritico ? "rgba(239,68,68,0.08)" : isAviso ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)";
                  return (
                    <div key={ev.id} className="p-3 sm:p-4 rounded-xl flex items-start gap-3 sm:gap-4" style={{ background: evBg, border: `1px solid ${evColor}20` }}>
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: evColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-xs sm:text-sm">{cat}</div>
                        <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">{ev.descricaoEvento}</div>
                        {(ev.frequenciaCardiaca || ev.oxigenacaoSpo2) && (
                          <div className="flex flex-wrap gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-slate-500">
                            {ev.frequenciaCardiaca && <span>❤️ {ev.frequenciaCardiaca} BPM</span>}
                            {ev.oxigenacaoSpo2 && <span>🫁 {ev.oxigenacaoSpo2}%</span>}
                            {ev.temperaturaCorporal && <span>🌡️ {ev.temperaturaCorporal}°C</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0">
                        {ev.dataHoraRegistro ? new Date(ev.dataHoraRegistro).toLocaleString("pt-BR") : "—"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ═══════════════════ TAB: CONTATOS ════════════════════════════ */}
          {activeTab === "contatos" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-slate-400 text-sm">Contatos de emergência</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white font-medium transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
                  onClick={() => setShowAddContato(true)}>
                  <Plus className="w-4 h-4" />Adicionar
                </button>
              </div>
              {(cuidadoresQuery.data ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <Phone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum contato cadastrado</p>
                </div>
              ) : (
                (cuidadoresQuery.data ?? []).map((c: any) => (
                  <div key={c.id} className="p-4 sm:p-5 rounded-2xl flex items-center gap-3 sm:gap-4" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                      {c.nome.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm sm:text-base truncate">{c.nome}</div>
                      <div className="text-slate-400 text-xs sm:text-sm truncate">{c.parentesco ?? "Cuidador"} · {c.telefone}</div>
                      <div className="text-slate-500 text-[10px] sm:text-xs truncate">{c.email}</div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCuidador.mutate({ id: c.id })} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ═══════════════════ TAB: PERFIL ══════════════════════════════ */}
          {activeTab === "perfil" && (
            <div className="max-w-lg space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    {DEMO_USER.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg sm:text-xl">{DEMO_USER.nome}</div>
                    <div className="text-slate-400 text-sm">{DEMO_USER.email}</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(14,165,233,0.15)", color: "#0EA5E9" }}>
                      <Shield className="w-3 h-3" />Plano {DEMO_USER.nomePlano}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[{ l: "Nome", v: DEMO_USER.nome }, { l: "E-mail", v: DEMO_USER.email }, { l: "Plano", v: DEMO_USER.nomePlano }, { l: "Membro desde", v: "Janeiro 2026" }].map(f => (
                    <div key={f.l} className="flex justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <span className="text-slate-400 text-sm">{f.l}</span>
                      <span className="text-white text-sm">{f.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/loja" className="block p-4 rounded-xl text-center text-white font-medium transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
                Fazer Upgrade de Plano
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper: format time ago ──────────────────────────────────────────────────
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 10) return "Agora";
  if (diff < 60) return `Há ${diff}s`;
  if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
  return `Há ${Math.floor(diff / 86400)}d`;
}
