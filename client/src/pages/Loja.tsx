import { useState } from "react";
import { Link } from "wouter";
import { Heart, ArrowLeft, Check, Shield, Truck, CreditCard, QrCode, FileText, ChevronRight, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CORES = [
  { id: "preto", label: "Preto Ônix", hex: "#1a1a2e", img: "/imagens/sage_vest_preto_onix.png" },
  { id: "azul", label: "Azul Marinho", hex: "#1e3a8a", img: "/imagens/sage_vest_azul_marinho.png" },
  { id: "branco", label: "Branco Gelo", hex: "#f8fafc", img: "/imagens/sage_vest_branco_gelo.png" },
];

const TAMANHOS = ["P", "M", "G", "GG"] as const;

const PLANOS = [
  {
    id: "Básico",
    label: "Básico",
    preco: "R$ 149/mês",
    precoNum: 149,
    descricao: "Ideal para começar",
    colete: "R$ 899 (à vista)",
    features: ["Monitoramento de BPM e SpO₂", "Detecção de quedas", "2 cuidadores", "Alertas por push", "Suporte por e-mail"],
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
    border: "rgba(14,165,233,0.2)",
  },
  {
    id: "Premium",
    label: "Premium",
    preco: "R$ 249/mês",
    precoNum: 249,
    descricao: "Proteção completa",
    colete: "Incluso no plano",
    features: ["Tudo do Básico", "Temperatura corporal", "GPS em tempo real", "5 cuidadores", "Alertas SMS e ligação", "Suporte 24/7 prioritário", "Relatórios mensais"],
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    destaque: true,
  },
  {
    id: "HaaS",
    label: "HaaS",
    preco: "R$ 349/mês",
    precoNum: 349,
    descricao: "Hardware as a Service",
    colete: "Sem custo inicial",
    features: ["Tudo do Premium", "Colete sem custo inicial", "Troca garantida em 48h", "Firmware sempre atualizado", "Gerente de conta dedicado", "SLA 99,9%"],
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
];

type Aba = "cartao" | "pix" | "boleto";

export default function Loja() {
  const [corSelecionada, setCorSelecionada] = useState(CORES[0]);
  const [tamanho, setTamanho] = useState<typeof TAMANHOS[number]>("M");
  const [plano, setPlano] = useState(PLANOS[1]);
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState<{ valor: string; prazo: string } | null>(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [abaCheckout, setAbaCheckout] = useState<Aba>("cartao");
  const [etapa, setEtapa] = useState<"configurar" | "checkout" | "sucesso">("configurar");
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", telefone: "", cartaoNum: "", cartaoNome: "", cartaoVal: "", cartaoCvv: "" });

  const criarPedido = trpc.pedidos.create.useMutation({
    onSuccess: () => setEtapa("sucesso"),
    onError: (e) => toast.error(e.message),
  });

  const calcularFrete = async () => {
    if (cep.replace(/\D/g, "").length !== 8) { toast.error("CEP inválido"); return; }
    setCalculandoFrete(true);
    await new Promise(r => setTimeout(r, 1200));
    const opcoes = [
      { valor: "R$ 0,00", prazo: "Frete grátis — 7 a 10 dias úteis" },
      { valor: "R$ 18,90", prazo: "PAC — 5 a 7 dias úteis" },
      { valor: "R$ 34,90", prazo: "SEDEX — 2 a 3 dias úteis" },
    ];
    setFrete(opcoes[Math.floor(Math.random() * opcoes.length)]);
    setCalculandoFrete(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    criarPedido.mutate({
      numeroPedido: `#SG-${Date.now().toString().slice(-6)}`,
      valor: `R$ ${plano.precoNum},00`,
      formaPagamento: abaCheckout === "cartao" ? "Cartão" : abaCheckout === "pix" ? "Pix" : "Boleto",
      status: "Pend. Pagamento",
      corColete: corSelecionada.id,
      tamanhoColete: tamanho,
      nomePlano: plano.id as "Básico" | "Premium" | "HaaS",
      idUsuario: 1,
    });
  };

  if (etapa === "sucesso") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F16" }}>
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Pedido Realizado!</h1>
          <p className="text-slate-400 mb-8">Seu colete Sage está a caminho. Você receberá um e-mail de confirmação em breve.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <ArrowLeft className="w-5 h-5" />Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0F16" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4" style={{ background: "rgba(10,15,22,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Voltar</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Sage</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300">Loja</span>
        </div>
        {/* Steps */}
        <div className="ml-auto flex items-center gap-2">
          {[{n:1,l:"Configurar"},{n:2,l:"Checkout"}].map((s,i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${etapa === "configurar" && s.n === 1 ? "text-white" : etapa === "checkout" && s.n === 2 ? "text-white" : "text-slate-500"}`}
                style={{ background: (etapa === "configurar" && s.n === 1) || (etapa === "checkout" && s.n === 2) ? "linear-gradient(135deg, #0EA5E9, #0284C7)" : "rgba(255,255,255,0.05)" }}>
                {s.n}
              </div>
              <span className={`text-sm hidden sm:block ${(etapa === "configurar" && s.n === 1) || (etapa === "checkout" && s.n === 2) ? "text-white" : "text-slate-500"}`}>{s.l}</span>
              {i === 0 && <ChevronRight className="w-4 h-4 text-slate-600" />}
            </div>
          ))}
        </div>
      </header>

      <div className="container py-6 sm:py-10">
        {etapa === "configurar" ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configurador */}
            <div className="lg:col-span-2 space-y-8">
              {/* Planos */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Escolha seu Plano</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLANOS.map(p => (
                    <button key={p.id} onClick={() => setPlano(p)}
                      className="relative p-5 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: plano.id === p.id ? p.bg : "rgba(14,20,30,0.6)", border: `2px solid ${plano.id === p.id ? p.color : "rgba(255,255,255,0.06)"}` }}>
                      {p.destaque && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: p.color }}>Mais Popular</div>
                      )}
                      <div className="font-bold text-white text-lg mb-1">{p.label}</div>
                      <div className="text-sm mb-3" style={{ color: p.color }}>{p.preco}</div>
                      <div className="text-xs text-slate-500 mb-4">{p.descricao}</div>
                      <div className="space-y-1.5">
                        {p.features.slice(0, 3).map(f => (
                          <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                            <Check className="w-3 h-3 flex-shrink-0" style={{ color: p.color }} />{f}
                          </div>
                        ))}
                        {p.features.length > 3 && <div className="text-xs" style={{ color: p.color }}>+{p.features.length - 3} mais...</div>}
                      </div>
                      {plano.id === p.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.color }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Cor do Colete</h2>
                <div className="flex gap-4">
                  {CORES.map(cor => (
                    <button key={cor.id} onClick={() => setCorSelecionada(cor)}
                      className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-full transition-all duration-200 group-hover:scale-110"
                        style={{ background: cor.hex, border: corSelecionada.id === cor.id ? "3px solid #0EA5E9" : "3px solid rgba(255,255,255,0.1)", boxShadow: corSelecionada.id === cor.id ? "0 0 0 2px rgba(14,165,233,0.3)" : "none" }}>
                        {corSelecionada.id === cor.id && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5" style={{ color: cor.id === "branco" ? "#0EA5E9" : "white" }} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{cor.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamanho */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Tamanho</h2>
                <div className="flex gap-3">
                  {TAMANHOS.map(t => (
                    <button key={t} onClick={() => setTamanho(t)}
                      className="w-14 h-14 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: tamanho === t ? "linear-gradient(135deg, #0EA5E9, #0284C7)" : "rgba(14,20,30,0.6)",
                        border: `2px solid ${tamanho === t ? "#0EA5E9" : "rgba(255,255,255,0.08)"}`,
                        color: tamanho === t ? "white" : "#94a3b8",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  P: até 85cm · M: 86–100cm · G: 101–115cm · GG: 116–130cm (circunferência torácica)
                </p>
              </div>

              {/* Frete */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Calcular Frete</h2>
                <div className="flex gap-3">
                  <input
                    value={cep}
                    onChange={e => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="00000-000"
                    className="flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2"
                    style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)",  }}
                  />
                  <button onClick={calcularFrete} disabled={calculandoFrete}
                    className="px-6 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
                    {calculandoFrete ? "..." : "Calcular"}
                  </button>
                </div>
                {frete && (
                  <div className="mt-3 p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <Truck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <div className="text-green-400 font-semibold text-sm">{frete.valor}</div>
                      <div className="text-slate-400 text-xs">{frete.prazo}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-lg font-bold text-white mb-6">Resumo do Pedido</h3>

                {/* Preview do produto */}
                <div className="relative rounded-xl overflow-hidden mb-6 flex items-center justify-center h-48 sm:h-64 bg-white/5"
                  style={{ border: `1px solid ${corSelecionada.hex}33` }}>
                  <img src={corSelecionada.img} alt={`Colete ${corSelecionada.label}`} className="absolute inset-0 w-full h-full object-contain p-2" />
                  <div className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 rounded-full text-white backdrop-blur-md" style={{ background: "rgba(0,0,0,0.5)" }}>
                    Colete {corSelecionada.label} · Tam. {tamanho}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Plano</span>
                    <span className="text-white font-medium">{plano.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Mensalidade</span>
                    <span className="text-white font-medium">{plano.preco}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Colete</span>
                    <span className="text-white font-medium">{plano.colete}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Frete</span>
                    <span className="text-white font-medium">{frete ? frete.valor : "—"}</span>
                  </div>
                  <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total/mês</span>
                      <span className="text-xl font-bold" style={{ color: "#0EA5E9" }}>{plano.preco}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setEtapa("checkout")}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
                  Continuar para Checkout
                </button>

                <div className="mt-4 flex flex-col gap-2">
                  {[{I:Shield,t:"Compra 100% segura"},{I:Truck,t:"Frete grátis acima de R$500"},{I:Check,t:"30 dias de garantia"}].map(({I,t}) => (
                    <div key={t} className="flex items-center gap-2 text-xs text-slate-500">
                      <I className="w-3.5 h-3.5 text-green-400" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHECKOUT */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <button onClick={() => setEtapa("configurar")} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />Voltar ao configurador
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Finalizar Pedido</h2>

              {/* Dados pessoais */}
              <div className="p-6 rounded-2xl mb-6" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-white font-semibold mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{k:"nome",l:"Nome completo",p:"João Silva"},{k:"email",l:"E-mail",p:"joao@email.com"},{k:"cpf",l:"CPF",p:"000.000.000-00"},{k:"telefone",l:"Telefone",p:"(11) 99999-9999"}].map(f => (
                    <div key={f.k}>
                      <label className="block text-xs text-slate-400 mb-1">{f.l}</label>
                      <input value={(form as any)[f.k]} onChange={e => setForm(prev => ({...prev, [f.k]: e.target.value}))}
                        placeholder={f.p}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagamento */}
              <div className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-white font-semibold mb-4">Forma de Pagamento</h3>
                {/* Abas */}
                <div className="flex gap-2 mb-6">
                  {([{id:"cartao",l:"Cartão",I:CreditCard},{id:"pix",l:"Pix",I:QrCode},{id:"boleto",l:"Boleto",I:FileText}] as const).map(aba => (
                    <button key={aba.id} onClick={() => setAbaCheckout(aba.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: abaCheckout === aba.id ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${abaCheckout === aba.id ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.06)"}`, color: abaCheckout === aba.id ? "#0EA5E9" : "#94a3b8" }}>
                      <aba.I className="w-4 h-4" />{aba.l}
                    </button>
                  ))}
                </div>

                {abaCheckout === "cartao" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Número do Cartão</label>
                      <input value={form.cartaoNum} onChange={e => setForm(p => ({...p, cartaoNum: e.target.value}))} placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome no Cartão</label>
                      <input value={form.cartaoNome} onChange={e => setForm(p => ({...p, cartaoNome: e.target.value}))} placeholder="JOÃO SILVA"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Validade</label>
                        <input value={form.cartaoVal} onChange={e => setForm(p => ({...p, cartaoVal: e.target.value}))} placeholder="MM/AA"
                          className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">CVV</label>
                        <input value={form.cartaoCvv} onChange={e => setForm(p => ({...p, cartaoCvv: e.target.value}))} placeholder="000"
                          className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                      </div>
                    </div>
                  </div>
                )}

                {abaCheckout === "pix" && (
                  <div className="text-center py-8">
                    <div className="w-40 h-40 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <QrCode className="w-20 h-20 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm mb-2">QR Code será gerado após confirmar o pedido</p>
                    <p className="text-xs text-slate-500">Válido por 30 minutos · Aprovação imediata</p>
                  </div>
                )}

                {abaCheckout === "boleto" && (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm mb-2">Boleto será gerado após confirmar o pedido</p>
                    <p className="text-xs text-slate-500">Vencimento em 3 dias úteis · Compensação em até 2 dias</p>
                  </div>
                )}

                <button onClick={handleCheckout} disabled={criarPedido.isPending}
                  className="w-full mt-6 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
                  {criarPedido.isPending ? "Processando..." : "Confirmar Pedido"}
                </button>
              </div>
            </div>

            {/* Resumo lateral */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h3 className="text-lg font-bold text-white mb-4">Resumo</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Plano {plano.label}</span><span className="text-white">{plano.preco}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Cor</span><span className="text-white">{corSelecionada.label}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Tamanho</span><span className="text-white">{tamanho}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Frete</span><span className="text-white">{frete?.valor ?? "Grátis"}</span></div>
                  <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total/mês</span>
                      <span style={{ color: "#0EA5E9" }}>{plano.preco}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
