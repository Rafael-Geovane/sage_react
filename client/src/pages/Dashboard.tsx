import { useState, useEffect, useMemo } from "react";
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
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "20 dias", value: 20 },
  { label: "30 dias", value: 30 },
] as const;

// ─── Vital Card ───────────────────────────────────────────────────────────────
function VitalCard({ icon: Icon, label, value, unit, status, color, trend, subtitle }: {
  icon: React.ElementType; label: string; value: string; unit: string;
  status: "normal" | "alerta" | "critico"; color: string;
  trend?: "up" | "down" | "stable"; subtitle?: string;
}) {
  const statusColors = { normal: "#10B981", alerta: "#F59E0B", critico: "#EF4444" };
  const statusLabels = { normal: "Normal", alerta: "Atenção", critico: "Crítico" };
  return (
    <div className="p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
          style={{ background: `${statusColors[status]}15`, color: statusColors[status] }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColors[status] }} />
          {statusLabels[status]}
        </div>
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-slate-400 text-sm mb-1">{unit}</span>
        {trend && (
          <span className="mb-1 ml-1">
            {trend === "up" ? <TrendingUp className="w-4 h-4 text-red-400" /> : trend === "down" ? <TrendingDown className="w-4 h-4 text-green-400" /> : null}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-sm">{label}</div>
      {subtitle && <div className="text-slate-600 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-lg" style={{ background: "rgba(14,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="text-slate-400 text-xs mb-2 font-medium">{label}</div>
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, onLogout }: { activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void }) {
  const items = [
    { id: "vitais", label: "Sinais Vitais", icon: Activity },
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

  // ─── Queries (dados reais do Supabase) ──────────────────────────────────
  const ultimaLeituraQuery = trpc.sensores.ultimaPorUsuario.useQuery(
    { idUsuario: DEMO_USER.id },
    { refetchInterval: 10000 } // Polling a cada 10s
  );

  const resumoDiarioQuery = trpc.sensores.resumoDiario.useQuery(
    { idUsuario: DEMO_USER.id, dias: selectedPeriod },
    { refetchInterval: 30000 }
  );

  const historicoQuery = trpc.sensores.historico.useQuery(
    { idUsuario: DEMO_USER.id, dias: selectedPeriod },
    { refetchInterval: 30000 }
  );

  const dispositivosQuery = trpc.dispositivos.list.useQuery({ idUsuario: DEMO_USER.id });
  const eventosQuery = trpc.eventosSaude.list.useQuery({ idUsuario: DEMO_USER.id, limit: 30 });
  const cuidadoresQuery = trpc.cuidadores.list.useQuery({ idUsuario: DEMO_USER.id });

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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,15,22,0.9)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg capitalize">
                {activeTab === "vitais" ? "Sinais Vitais" : activeTab === "dispositivos" ? "Dispositivos" : activeTab === "historico" ? "Relatório Histórico" : activeTab === "eventos" ? "Log de Eventos" : activeTab === "contatos" ? "Contatos de Emergência" : "Meu Perfil"}
              </h1>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> Última leitura: {lastUpdateStr}
                {ultimaLeituraQuery.isFetching && <RefreshCw className="w-3 h-3 animate-spin text-sky-400 ml-2" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: hasData ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${hasData ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`, color: hasData ? "#10B981" : "#F59E0B" }}>
              <div className={`w-1.5 h-1.5 rounded-full ${hasData ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
              {hasData ? "Colete Online" : "Sem dados"}
            </div>
            <Link href="/loja" className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              Loja
            </Link>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ═══════════════════ TAB: SINAIS VITAIS ═══════════════════════ */}
          {activeTab === "vitais" && (
            <div className="space-y-6">
              {/* Vital cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <VitalCard icon={Heart} label="Frequência Cardíaca" value={hasData ? Math.round(vitals.bpm).toString() : "—"} unit="BPM" status={bpmStatus} color="#F43F5E" trend={vitals.bpm > 80 ? "up" : "stable"} subtitle={hasData ? "Tempo real" : "Aguardando dados"} />
                <VitalCard icon={Activity} label="Saturação SpO₂" value={hasData ? vitals.spo2.toFixed(0) : "—"} unit="%" status={spo2Status} color="#10B981" subtitle={hasData ? "Oxigenação" : "Aguardando dados"} />
                <VitalCard icon={Thermometer} label="Temperatura" value={hasData ? vitals.temp.toFixed(1) : "—"} unit="°C" status={tempStatus} color="#F59E0B" subtitle={hasData ? "Corporal" : "Aguardando dados"} />
                <VitalCard icon={AlertTriangle} label="Quedas Detectadas" value={stats ? stats.totalQuedas.toString() : "0"} unit={`(${selectedPeriod}d)`} status="normal" color="#8B5CF6" subtitle="No período" />
              </div>

              {/* Real-time BPM Chart */}
              <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Frequência Cardíaca — Leituras Recentes</h3>
                    <p className="text-xs text-slate-500 mt-1">{sparkData.length} leituras · atualiza a cada 10s</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-rose-400" /> BPM
                  </div>
                </div>
                {sparkData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} domain={["auto", "auto"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="bpm" name="BPM" stroke="#F43F5E" fill="url(#bpmGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                    <Zap className="w-5 h-5 mr-2" /> Aguardando leituras do sensor...
                  </div>
                )}
                {sparkData.length > 0 && (
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Min: {Math.round(Math.min(...sparkData.map(d => d.bpm).filter(v => v > 0)))} BPM</span>
                    <span>Média: {Math.round(sparkData.filter(d => d.bpm > 0).reduce((a, b) => a + b.bpm, 0) / Math.max(sparkData.filter(d => d.bpm > 0).length, 1))} BPM</span>
                    <span>Max: {Math.round(Math.max(...sparkData.map(d => d.bpm)))} BPM</span>
                  </div>
                )}
              </div>

              {/* Status cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Localização", value: hasData && vitals.lat ? `${vitals.lat.toFixed(4)}, ${vitals.lng.toFixed(4)}` : "Sem GPS", icon: MapPin, color: "#0EA5E9" },
                  { label: "Bateria do Colete", value: hasData ? `${vitals.bateria}%` : "—", icon: Battery, color: vitals.bateria > 20 ? "#10B981" : "#EF4444" },
                  { label: "Último Sinal", value: vitals.lastUpdate ? formatTimeAgo(vitals.lastUpdate) : "Sem dados", icon: Clock, color: "#F59E0B" },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl flex items-center gap-4" style={{ background: "rgba(14,20,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs">{item.label}</div>
                      <div className="text-white font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div key={d.id} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: d.statusConexao === "Online" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                      {d.statusConexao === "Online" ? <Wifi className="w-6 h-6 text-green-400" /> : <WifiOff className="w-6 h-6 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">Colete #{d.codigoSerial}</div>
                      <div className="text-slate-400 text-sm">Firmware {d.versaoFirmware ?? "v1.0.0"} · {d.tipoConexao ?? "4G/WiFi"}</div>
                      {d.tempoUltimoSinal && <div className="text-slate-500 text-xs mt-0.5">Último sinal: {d.tempoUltimoSinal}</div>}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Battery className="w-4 h-4" style={{ color: (d.nivelBateria ?? 0) > 20 ? "#10B981" : "#EF4444" }} />
                        <span className="text-white font-medium">{d.nivelBateria ?? 0}%</span>
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
            <div className="space-y-6">
              {/* Period selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">Período:</span>
                  <div className="flex gap-1">
                    {PERIODS.map(p => (
                      <button key={p.value} onClick={() => setSelectedPeriod(p.value)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
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
                {resumoDiarioQuery.isFetching && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />}
              </div>

              {/* Summary cards */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { l: `BPM Médio (${selectedPeriod}d)`, v: stats?.bpmMedio?.toString() ?? "—", u: "bpm", c: "#F43F5E", icon: Heart },
                  { l: `SpO₂ Médio (${selectedPeriod}d)`, v: stats?.spo2Medio?.toString() ?? "—", u: "%", c: "#10B981", icon: Activity },
                  { l: `Temp. Média (${selectedPeriod}d)`, v: stats?.tempMedia?.toString() ?? "—", u: "°C", c: "#F59E0B", icon: Thermometer },
                  { l: "Total de Leituras", v: stats?.totalLeituras?.toString() ?? "0", u: "registros", c: "#8B5CF6", icon: BarChart3 },
                ].map(s => (
                  <div key={s.l} className="p-5 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <s.icon className="w-4 h-4" style={{ color: s.c }} />
                      <span className="text-slate-400 text-xs">{s.l}</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: s.c }}>
                      {s.v} <span className="text-sm font-normal text-slate-400">{s.u}</span>
                    </div>
                  </div>
                ))}
              </div>

              {chartData.length === 0 ? (
                <div className="p-12 rounded-2xl text-center" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Nenhum dado no período selecionado</p>
                  <p className="text-slate-500 text-sm mt-1">Envie leituras via a API do colete para visualizar os relatórios</p>
                </div>
              ) : (
                <>
                  {/* BPM History Chart */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold mb-1">Frequência Cardíaca — Média Diária</h3>
                    <p className="text-xs text-slate-500 mb-4">Últimos {selectedPeriod} dias · {chartData.length} dias com dados</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="bpmHistGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                        <Area type="monotone" dataKey="bpm" name="BPM Médio" stroke="#F43F5E" fill="url(#bpmHistGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "#F43F5E" }} />
                        <Line type="monotone" dataKey="bpmMax" name="BPM Máx" stroke="#FB7185" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="bpmMin" name="BPM Mín" stroke="#FDA4AF" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* SpO2 History Chart */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold mb-1">Saturação SpO₂ — Média Diária</h3>
                    <p className="text-xs text-slate-500 mb-4">Valores normais: 95% — 100%</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="spo2HistGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[90, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                        <Area type="monotone" dataKey="spo2" name="SpO₂ Médio" stroke="#10B981" fill="url(#spo2HistGrad)" strokeWidth={2.5} dot={{ r: 3, fill: "#10B981" }} />
                        <Line type="monotone" dataKey="spo2Min" name="SpO₂ Mín" stroke="#6EE7B7" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Temperature History Chart */}
                  <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <h3 className="text-white font-semibold mb-1">Temperatura Corporal — Média Diária</h3>
                    <p className="text-xs text-slate-500 mb-4">Faixa normal: 36.0°C — 37.5°C</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[35, 39]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="temp" name="Temp °C" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: "#F59E0B" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Falls bar chart */}
                  {chartData.some(d => (d.quedas ?? 0) > 0) && (
                    <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <h3 className="text-white font-semibold mb-1">Quedas Detectadas por Dia</h3>
                      <p className="text-xs text-slate-500 mb-4">Total: {stats?.totalQuedas ?? 0} quedas no período</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
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
                    <div key={ev.id} className="p-4 rounded-xl flex items-start gap-4" style={{ background: evBg, border: `1px solid ${evColor}20` }}>
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: evColor }} />
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{cat}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{ev.descricaoEvento}</div>
                        {(ev.frequenciaCardiaca || ev.oxigenacaoSpo2) && (
                          <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
                            {ev.frequenciaCardiaca && <span>❤️ {ev.frequenciaCardiaca} BPM</span>}
                            {ev.oxigenacaoSpo2 && <span>🫁 {ev.oxigenacaoSpo2}%</span>}
                            {ev.temperaturaCorporal && <span>🌡️ {ev.temperaturaCorporal}°C</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex-shrink-0">
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
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Contatos que receberão alertas de emergência</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white font-medium transition-all hover:-translate-y-0.5"
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
                  <div key={c.id} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                      {c.nome.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{c.nome}</div>
                      <div className="text-slate-400 text-sm">{c.parentesco ?? "Cuidador"} · {c.telefone}</div>
                      <div className="text-slate-500 text-xs">{c.email}</div>
                    </div>
                    <div className="flex gap-2">
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
              <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    {DEMO_USER.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">{DEMO_USER.nome}</div>
                    <div className="text-slate-400">{DEMO_USER.email}</div>
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
