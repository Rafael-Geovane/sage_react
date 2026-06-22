import { useState } from "react";
import { Link } from "wouter";
import {
  Users, Wifi, DollarSign, AlertCircle, Package, TicketIcon,
  Search, Edit2, Trash2, Plus, ChevronRight, LogOut, Heart,
  TrendingUp, Shield, Activity, Menu, X, Check
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type AdminTab = "kpis" | "usuarios" | "dispositivos" | "pedidos" | "tickets";

function AdminSidebar({ activeTab, setActiveTab, onLogout }: { activeTab: AdminTab; setActiveTab: (t: AdminTab) => void; onLogout: () => void }) {
  const items: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "kpis", label: "Visão Geral", icon: TrendingUp },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "dispositivos", label: "Frota IoT", icon: Wifi },
    { id: "pedidos", label: "Pedidos", icon: Package },
    { id: "tickets", label: "Suporte", icon: TicketIcon },
  ];
  return (
    <div className="flex flex-col h-full" style={{ background: "rgba(5,8,10,0.98)" }}>
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">Sage Admin</div>
            <div className="text-xs text-slate-500">Painel de Controle</div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{ background: activeTab === item.id ? "rgba(14,165,233,0.15)" : "transparent", color: activeTab === item.id ? "#0EA5E9" : "#94a3b8", border: activeTab === item.id ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent" }}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
            {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        ))}
      </div>
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm mb-2">
          <Heart className="w-4 h-4" />Ver Site
        </Link>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm">
          <LogOut className="w-4 h-4" />Sair
        </button>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color, bg, border }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; bg: string; border: string;
}) {
  return (
    <div className="p-6 rounded-2xl" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white font-medium text-sm mb-1">{label}</div>
      <div className="text-slate-500 text-xs">{sub}</div>
    </div>
  );
}

function AddDispositivoModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [codigoSerial, setCodigoSerial] = useState("");
  const [versaoFirmware, setVersaoFirmware] = useState("v1.0.0");
  const [tipoConexao, setTipoConexao] = useState("4G");
  
  const createDispositivo = trpc.dispositivos.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      toast.success("Dispositivo adicionado com sucesso!");
      setCodigoSerial("");
    },
    onError: (e) => toast.error(e.message)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#0A0F16", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-xl font-bold text-white mb-4">Novo Dispositivo</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Código Serial</label>
            <input value={codigoSerial} onChange={e => setCodigoSerial(e.target.value)} placeholder="Ex: SGW-004" className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Versão Firmware</label>
            <input value={versaoFirmware} onChange={e => setVersaoFirmware(e.target.value)} className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Conexão</label>
            <select value={tipoConexao} onChange={e => setTipoConexao(e.target.value)} className="w-full px-4 py-2 rounded-xl text-white outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <option value="4G">4G</option>
              <option value="WiFi">WiFi</option>
              <option value="Bluetooth">Bluetooth</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-slate-300 font-medium hover:bg-white/5 transition-all">Cancelar</button>
          <button onClick={() => createDispositivo.mutate({ codigoSerial, versaoFirmware, tipoConexao })} disabled={createDispositivo.isPending || !codigoSerial} className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            {createDispositivo.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("kpis");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState("");
  const [editingUsuario, setEditingUsuario] = useState<number | null>(null);
  const [showAddDispositivo, setShowAddDispositivo] = useState(false);

  const kpisQuery = trpc.admin.kpis.useQuery();
  const usuariosQuery = trpc.usuarios.list.useQuery({ search: searchUsuario || undefined });
  const dispositivosQuery = trpc.dispositivos.list.useQuery({});
  const pedidosQuery = trpc.pedidos.list.useQuery({});
  const ticketsQuery = trpc.tickets.list.useQuery({});

  const deleteUsuario = trpc.usuarios.delete.useMutation({
    onSuccess: () => { usuariosQuery.refetch(); toast.success("Usuário removido."); },
    onError: (e) => toast.error(e.message),
  });

  const deleteDispositivo = trpc.dispositivos.delete.useMutation({
    onSuccess: () => { dispositivosQuery.refetch(); toast.success("Dispositivo removido."); },
    onError: (e) => toast.error(e.message),
  });

  const updateTicket = trpc.tickets.update.useMutation({
    onSuccess: () => { ticketsQuery.refetch(); toast.success("Ticket atualizado."); },
  });

  const updatePedido = trpc.pedidos.updateStatus.useMutation({
    onSuccess: () => { pedidosQuery.refetch(); toast.success("Pedido atualizado."); },
  });

  const handleLogout = () => { window.location.href = "/"; };

  const kpis = kpisQuery.data;

  const statusColor = (s: string) => {
    if (["Ativo","Online","Enviado","Respondido"].includes(s)) return { color: "#10B981", bg: "rgba(16,185,129,0.1)" };
    if (["Aguardando","Em Análise","Pend. Pagamento"].includes(s)) return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
    return { color: "#EF4444", bg: "rgba(239,68,68,0.1)" };
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0A0F16" }}>
      <AddDispositivoModal isOpen={showAddDispositivo} onClose={() => setShowAddDispositivo(false)} onSuccess={() => dispositivosQuery.refetch()} />
      {/* Sidebar desktop */}
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0 flex flex-col" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <AdminSidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} onLogout={handleLogout} />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,15,22,0.9)" }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">
                {activeTab === "kpis" ? "Visão Geral" : activeTab === "usuarios" ? "Gestão de Usuários" : activeTab === "dispositivos" ? "Frota IoT" : activeTab === "pedidos" ? "Pedidos" : "Suporte & Tickets"}
              </h1>
              <p className="text-slate-500 text-xs">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#8B5CF6" }}>
            <Shield className="w-3.5 h-3.5" />Admin
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* KPIs */}
          {activeTab === "kpis" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Users} label="Total de Usuários" value={kpis ? kpis.totalUsuarios.toString() : "—"} sub="+12% este mês" color="#0EA5E9" bg="rgba(14,165,233,0.08)" border="rgba(14,165,233,0.2)" />
                <KPICard icon={Wifi} label="Coletes Online" value={kpis ? kpis.coletesOnline.toString() : "—"} sub="Agora mesmo" color="#10B981" bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.2)" />
                <KPICard icon={DollarSign} label="MRR" value={kpis ? `R$ ${kpis.mrr.toLocaleString("pt-BR")}` : "—"} sub="+8% vs. mês anterior" color="#F59E0B" bg="rgba(245,158,11,0.08)" border="rgba(245,158,11,0.2)" />
                <KPICard icon={AlertCircle} label="Tickets Abertos" value={kpis ? kpis.ticketsAbertos.toString() : "—"} sub="Aguardando resposta" color="#EF4444" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.2)" />
              </div>

              {/* Recent activity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 className="text-white font-semibold mb-4">Últimos Pedidos</h3>
                  <div className="space-y-3">
                    {[{n:"#SG-001",u:"João Silva",p:"Premium",s:"Enviado"},{n:"#SG-002",u:"Maria Costa",p:"HaaS",s:"Pend. Pagamento"},{n:"#SG-003",u:"Pedro Lima",p:"Básico",s:"Entregue"}].map(p => {
                      const sc = statusColor(p.s);
                      return (
                        <div key={p.n} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <div>
                            <div className="text-white text-sm font-medium">{p.n}</div>
                            <div className="text-slate-500 text-xs">{p.u} · {p.p}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{p.s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 className="text-white font-semibold mb-4">Alertas Recentes</h3>
                  <div className="space-y-3">
                    {[{t:"Queda detectada",u:"João Silva (SGW-001)",time:"03:12",c:"#EF4444"},{t:"SpO₂ crítico",u:"Maria Costa (SGW-002)",time:"22:45",c:"#F59E0B"},{t:"Bateria baixa",u:"Pedro Lima (SGW-003)",time:"19:00",c:"#F59E0B"}].map((a,i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.c }} />
                        <div className="flex-1">
                          <div className="text-white text-sm">{a.t}</div>
                          <div className="text-slate-500 text-xs">{a.u}</div>
                        </div>
                        <div className="text-xs text-slate-500">{a.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuários */}
          {activeTab === "usuarios" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input value={searchUsuario} onChange={e => setSearchUsuario(e.target.value)} placeholder="Buscar por nome..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none"
                    style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)" }} />
                </div>
                <button onClick={() => toast.info("Funcionalidade: criar usuário")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                  <Plus className="w-4 h-4" />Novo
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(14,20,30,0.9)" }}>
                      {["Nome","E-mail","Plano","Status","Ações"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosQuery.isLoading ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
                    ) : (usuariosQuery.data?.length ?? 0) === 0 ? (
                      <>
                        {[{n:"João Silva",e:"joao@sage.com",p:"Premium",s:"Ativo"},{n:"Maria Costa",e:"maria@sage.com",p:"HaaS",s:"Ativo"},{n:"Pedro Lima",e:"pedro@sage.com",p:"Básico",s:"Inativo"}].map((u,i) => {
                          const sc = statusColor(u.s);
                          return (
                            <tr key={i} className="border-t hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>{u.n.charAt(0)}</div>
                                  <span className="text-white text-sm">{u.n}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-sm">{u.e}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>{u.p}</span></td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{u.s}</span></td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    ) : (
                      (usuariosQuery.data ?? []).map(u => {
                        const sc = statusColor("Ativo");
                        return (
                          <tr key={u.id} className="border-t hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>{u.nome.charAt(0)}</div>
                                <span className="text-white text-sm">{u.nome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{u.email}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>{u.nomePlano ?? "—"}</span></td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>Ativo</span></td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteUsuario.mutate({ id: u.id })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dispositivos */}
          {activeTab === "dispositivos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">{(dispositivosQuery.data?.length ?? 0)} dispositivos cadastrados</p>
                <button onClick={() => setShowAddDispositivo(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                  <Plus className="w-4 h-4" />Novo Dispositivo
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(14,20,30,0.9)" }}>
                      {["Serial","Firmware","Bateria","Conexão","Status","Ações"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[{s:"SGW-001",f:"v2.1.3",b:78,c:"4G",st:"Online"},{s:"SGW-002",f:"v2.1.3",b:45,c:"WiFi",st:"Online"},{s:"SGW-003",f:"v2.0.1",b:12,c:"4G",st:"Offline"},...(dispositivosQuery.data ?? []).map(d => ({s:d.codigoSerial,f:d.versaoFirmware??"v1.0",b:d.nivelBateria??0,c:d.tipoConexao??"4G",st:d.statusConexao??"Offline"}))].map((d,i) => {
                      const sc = statusColor(d.st);
                      return (
                        <tr key={i} className="border-t hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-3 text-white text-sm font-mono">#{d.s}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{d.f}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 max-w-16">
                                <div className="h-full rounded-full" style={{ width: `${d.b}%`, background: d.b > 20 ? "#10B981" : "#EF4444" }} />
                              </div>
                              <span className="text-xs text-slate-400">{d.b}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{d.c}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{d.st}</span></td>
                          <td className="px-4 py-3">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pedidos */}
          {activeTab === "pedidos" && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(14,20,30,0.9)" }}>
                      {["Pedido","Plano","Cor/Tam","Pagamento","Valor","Status","Ações"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[{n:"#SG-001",p:"Premium",ct:"Azul/M",pg:"Cartão",v:"R$ 249",s:"Enviado"},{n:"#SG-002",p:"HaaS",ct:"Preto/G",pg:"Pix",v:"R$ 349",s:"Pend. Pagamento"},{n:"#SG-003",p:"Básico",ct:"Cinza/P",pg:"Boleto",v:"R$ 149",s:"Entregue"},...(pedidosQuery.data ?? []).map(p => ({n:p.numeroPedido,p:p.nomePlano??"—",ct:`${p.corColete??"—"}/${p.tamanhoColete??"—"}`,pg:p.formaPagamento??"—",v:p.valor??"—",s:p.status??"—"}))].map((p,i) => {
                      const sc = statusColor(p.s);
                      return (
                        <tr key={i} className="border-t hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-3 text-white text-sm font-mono">{p.n}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9" }}>{p.p}</span></td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{p.ct}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{p.pg}</td>
                          <td className="px-4 py-3 text-white text-sm font-medium">{p.v}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{p.s}</span></td>
                          <td className="px-4 py-3">
                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tickets */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "rgba(14,20,30,0.9)" }}>
                      {["Ticket","Assunto","Prioridade","Status","Ações"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[{n:"#T-001",a:"Colete não conecta ao app",pr:"Alta",s:"Aguardando"},{n:"#T-002",a:"Dúvida sobre plano HaaS",pr:"Baixa",s:"Respondido"},{n:"#T-003",a:"Alerta falso de queda",pr:"Média",s:"Em Análise"},...(ticketsQuery.data ?? []).map(t => ({n:t.numeroTicket,a:t.assunto,pr:t.prioridade??"Baixa",s:t.status??"Aguardando"}))].map((t,i) => {
                      const sc = statusColor(t.s);
                      const prColor = t.pr === "Alta" ? "#EF4444" : t.pr === "Média" ? "#F59E0B" : "#10B981";
                      return (
                        <tr key={i} className="border-t hover:bg-white/2 transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                          <td className="px-4 py-3 text-white text-sm font-mono">{t.n}</td>
                          <td className="px-4 py-3 text-slate-300 text-sm">{t.a}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${prColor}15`, color: prColor }}>{t.pr}</span></td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>{t.s}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => toast.info("Funcionalidade: responder ticket")} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-400/5 transition-all"><Check className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
