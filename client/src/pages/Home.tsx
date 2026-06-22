import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Heart, Shield, Activity, Thermometer, MapPin, Bell, ChevronDown,
  CheckCircle, Star, Phone, Mail, Menu, X, ArrowRight, Zap, Users,
  AlertTriangle, Wifi, Clock
} from "lucide-react";

function Navbar({ onLogin, onCadastro }: { onLogin: () => void; onCadastro: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: scrolled ? "rgba(10,15,22,0.95)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
      <div className="container flex items-center justify-between py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Sage</span>
          <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.3)" }}>Wearable</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Solução","Funcionalidades","Como Funciona","Depoimentos","FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,"-")}`} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={onLogin} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">Entrar</button>
          <button onClick={onCadastro} className="px-4 py-2 text-sm text-white rounded-full font-medium transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>Começar Agora</button>
        </div>
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ background: "rgba(10,15,22,0.98)" }}>
          {["Solução","Funcionalidades","Como Funciona","Depoimentos","FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,"-")}`} className="text-slate-300 hover:text-white py-2 border-b border-white/5" onClick={() => setMobileOpen(false)}>{item}</a>
          ))}
          <button onClick={() => { onLogin(); setMobileOpen(false); }} className="w-full py-3 text-center text-slate-300 border border-white/10 rounded-xl">Entrar</button>
          <button onClick={() => { onCadastro(); setMobileOpen(false); }} className="w-full py-3 text-center text-white rounded-xl font-medium" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>Começar Agora</button>
        </div>
      )}
    </nav>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 2000 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const handleLogin = () => { window.location.href = "/auth?mode=login"; };
  const handleCadastro = () => { window.location.href = "/auth?mode=cadastro"; };

  return (
    <div className="min-h-screen" style={{ background: "#0A0F16" }}>
      <Navbar onLogin={handleLogin} onCadastro={handleCadastro} />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, #05080A 0%, #0A0F16 50%, #0D1520 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #0EA5E9, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl" style={{ background: "radial-gradient(circle, #0284C7, transparent)" }} />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="container relative z-10 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-sage-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>
                <Zap className="w-4 h-4" />Edge AI · Detecção em Tempo Real
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Cuidado que{" "}
                <span style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>se veste</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">O colete inteligente Sage monitora sinais vitais, detecta quedas e conecta idosos aos seus cuidadores em tempo real — com tecnologia Edge AI embarcada.</p>
              <div className="flex flex-wrap gap-4 mb-10">
                <button onClick={handleCadastro} className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold text-lg transition-all hover:-translate-y-1"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 6px 20px rgba(14,165,233,0.4)" }}>
                  Pedir Meu Colete <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/loja" className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold text-lg transition-all hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  Ver Planos
                </Link>
              </div>
              <div className="flex flex-wrap gap-8">
                {[{v:98,s:"%",l:"Precisão de detecção"},{v:30,s:"s",l:"Tempo de resposta"},{v:2500,s:"+",l:"Famílias protegidas"}].map(s => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold" style={{ color: "#0EA5E9" }}><AnimatedCounter target={s.v} suffix={s.s} /></div>
                    <div className="text-xs text-slate-500">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center items-center animate-sage-float">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: "radial-gradient(circle, #0EA5E9, transparent)" }} />
                <img src="/imagens/hero_elderly.png" alt="Idosa usando colete Sage" className="relative z-10 rounded-3xl max-h-[500px] object-cover shadow-2xl" style={{ border: "1px solid rgba(14,165,233,0.2)" }} />
                <div className="absolute -bottom-4 -left-4 z-20 px-4 py-3 rounded-2xl" style={{ background: "rgba(10,15,22,0.9)", border: "1px solid rgba(14,165,233,0.3)", backdropFilter: "blur(20px)" }}>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 animate-pulse" style={{ color: "#F43F5E" }} />
                    <div><div className="text-white font-bold text-lg">72 BPM</div><div className="text-xs text-slate-400">Frequência Cardíaca</div></div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 z-20 px-4 py-3 rounded-2xl" style={{ background: "rgba(10,15,22,0.9)", border: "1px solid rgba(16,185,129,0.3)", backdropFilter: "blur(20px)" }}>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5" style={{ color: "#10B981" }} />
                    <div><div className="text-white font-bold text-lg">98%</div><div className="text-xs text-slate-400">SpO₂</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-500">Role para saber mais</span>
          <ChevronDown className="w-5 h-5 text-slate-500" />
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="solução" className="py-24" style={{ background: "#07090E" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
                <AlertTriangle className="w-4 h-4" />O Problema
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Cada minuto conta em uma emergência</h2>
              <p className="text-slate-400 leading-relaxed mb-8">Quedas são a principal causa de morte acidental em idosos. A maioria ocorre quando estão sozinhos, e o socorro demora — não por falta de cuidado, mas por falta de informação em tempo real.</p>
              <div className="space-y-4">
                {["Idosos passam horas no chão após uma queda sem socorro","Famílias não sabem o estado de saúde em tempo real","Alertas chegam tarde demais para fazer diferença","Dispositivos atuais são desconfortáveis e difíceis de usar"].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
                      <X className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,15,22,0.6)" }}>
              <img src="/imagens/family_worry.png" alt="Família preocupada" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="relative z-10 grid grid-cols-2 gap-4">
                {[{v:30,s:"%",l:"das quedas causam lesões graves",c:"#EF4444",bg:"rgba(239,68,68,0.1)",b:"rgba(239,68,68,0.2)"},
                  {v:80,s:"%",l:"dos idosos moram sozinhos parte do dia",c:"#F59E0B",bg:"rgba(245,158,11,0.1)",b:"rgba(245,158,11,0.2)"},
                  {v:45,s:"min",l:"tempo médio até o socorro chegar",c:"#EF4444",bg:"rgba(239,68,68,0.1)",b:"rgba(239,68,68,0.2)"},
                  {v:3,s:"x",l:"mais risco de morte com socorro tardio",c:"#F59E0B",bg:"rgba(245,158,11,0.1)",b:"rgba(245,158,11,0.2)"}
                ].map(stat => (
                  <div key={stat.l} className="p-6 rounded-2xl backdrop-blur-sm" style={{ background: stat.bg, border: `1px solid ${stat.b}` }}>
                    <div className="text-4xl font-bold mb-2" style={{ color: stat.c }}><AnimatedCounter target={stat.v} suffix={stat.s} /></div>
                    <div className="text-sm text-slate-300 font-medium">{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, #07090E 0%, #0A0F16 100%)" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #0EA5E9, transparent)" }} />
                <img src="/imagens/vest_product.png" alt="Colete Sage Wearable" className="relative z-10 max-h-[450px] object-contain animate-sage-float" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>
                <Shield className="w-4 h-4" />A Solução
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Tecnologia que protege com <span style={{ color: "#0EA5E9" }}>discrição e conforto</span></h2>
              <p className="text-slate-400 leading-relaxed mb-8">O colete Sage é discreto, confortável e inteligente. Com sensores embarcados e Edge AI, ele monitora continuamente e age em segundos — sem depender de internet para detecção.</p>
              <div className="space-y-4">
                {[{I:Zap,t:"Edge AI processa dados localmente — sem latência de nuvem"},{I:Heart,t:"Monitoramento contínuo de BPM, SpO₂ e temperatura"},{I:Shield,t:"Detecção de quedas com acelerômetro de 6 eixos"},{I:MapPin,t:"Localização GPS em tempo real para cuidadores"},{I:Bell,t:"Alertas instantâneos via app, SMS e ligação"}].map(({I,t}) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.15)" }}>
                      <I className="w-4 h-4" style={{ color: "#0EA5E9" }} />
                    </div>
                    <span className="text-slate-300 text-sm pt-1.5">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24" style={{ background: "#07090E" }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>
              <Zap className="w-4 h-4" />Funcionalidades
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Tudo que você precisa, em um colete</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Tecnologia de ponta embarcada em um colete confortável e discreto, projetado para o dia a dia de idosos.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {I:Shield,t:"Detecção de Quedas",d:"Acelerômetro de 6 eixos com algoritmo Edge AI detecta quedas em menos de 500ms e aciona alerta imediato.",c:"#EF4444",bg:"rgba(239,68,68,0.1)",b:"rgba(239,68,68,0.2)"},
              {I:Heart,t:"Monitoramento Cardíaco",d:"Sensor óptico PPG monitora frequência cardíaca continuamente e alerta sobre arritmias e taquicardias.",c:"#F43F5E",bg:"rgba(244,63,94,0.1)",b:"rgba(244,63,94,0.2)"},
              {I:Activity,t:"Oximetria SpO₂",d:"Mede saturação de oxigênio no sangue em tempo real. Alertas configuráveis para níveis críticos.",c:"#10B981",bg:"rgba(16,185,129,0.1)",b:"rgba(16,185,129,0.2)"},
              {I:Thermometer,t:"Temperatura Corporal",d:"Sensor infravermelho de alta precisão monitora temperatura e detecta febre ou hipotermia.",c:"#F59E0B",bg:"rgba(245,158,11,0.1)",b:"rgba(245,158,11,0.2)"},
              {I:MapPin,t:"Localização GPS",d:"GPS integrado com atualização a cada 30 segundos. Histórico de rotas e geofencing configurável.",c:"#0EA5E9",bg:"rgba(14,165,233,0.1)",b:"rgba(14,165,233,0.2)"},
              {I:Bell,t:"Alertas Multicanal",d:"Notificações push, SMS e ligação automática para cuidadores cadastrados em ordem de prioridade.",c:"#8B5CF6",bg:"rgba(139,92,246,0.1)",b:"rgba(139,92,246,0.2)"},
            ].map(f => (
              <div key={f.t} className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-default" style={{ background: f.bg, border: `1px solid ${f.b}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <f.I className="w-6 h-6" style={{ color: f.c }} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.t}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-24" style={{ background: "linear-gradient(180deg, #07090E 0%, #0A0F16 100%)" }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>
              <Clock className="w-4 h-4" />Como Funciona
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Simples para quem usa, poderoso por dentro</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {n:"01",I:Shield,t:"Veste o Colete",d:"O idoso veste o colete Sage como qualquer peça de roupa. Leve, respirável e discreto."},
              {n:"02",I:Wifi,t:"Conecta ao App",d:"O cuidador instala o app Sage e vincula o dispositivo em minutos. Sem configurações complexas."},
              {n:"03",I:Activity,t:"Monitoramento Contínuo",d:"Os sensores trabalham 24h por dia, processando dados localmente com Edge AI."},
              {n:"04",I:Bell,t:"Alertas em Tempo Real",d:"Em caso de queda ou sinal vital crítico, alertas chegam em segundos para todos os cuidadores."},
            ].map((step, i, arr) => (
              <div key={step.n} className="relative">
                {i < arr.length - 1 && <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0" style={{ background: "linear-gradient(90deg, rgba(14,165,233,0.4), transparent)" }} />}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)" }}>
                    <step.I className="w-7 h-7" style={{ color: "#0EA5E9" }} />
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color: "#0EA5E9" }}>{step.n}</div>
                  <h3 className="text-white font-semibold text-lg mb-3">{step.t}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-24" style={{ background: "#07090E" }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>
              <Users className="w-4 h-4" />Depoimentos
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Quem usa, confia</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {n:"Paulo Santos",c:"Filho cuidador, São Paulo",t:"Minha mãe caiu no banheiro às 3h da manhã. O Sage detectou em segundos e recebi a ligação imediatamente. Ela estava bem, mas sem o colete poderia ter ficado horas no chão.",a:"PS"},
              {n:"Dr. Ricardo Alves",c:"Geriatra, Hospital das Clínicas",t:"Recomendo o Sage para todos os meus pacientes acima de 70 anos. A qualidade dos dados de SpO₂ e frequência cardíaca é comparável a equipamentos hospitalares.",a:"RA"},
              {n:"Carla Mendonça",c:"Cuidadora profissional, Curitiba",t:"Cuido de 3 idosos e o Sage mudou completamente meu trabalho. Consigo monitorar todos pelo app e agir rápido quando algo acontece. Indispensável.",a:"CM"},
            ].map(dep => (
              <div key={dep.n} className="p-6 rounded-2xl" style={{ background: "rgba(14,20,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} />)}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{dep.t}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>{dep.a}</div>
                  <div><div className="text-white font-semibold text-sm">{dep.n}</div><div className="text-slate-500 text-xs">{dep.c}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24" style={{ background: "linear-gradient(180deg, #07090E 0%, #0A0F16 100%)" }}>
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", color: "#0EA5E9" }}>Perguntas Frequentes</div>
            <h2 className="text-4xl font-bold text-white mb-4">Tire suas dúvidas</h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: "#07090E" }}>
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(2,132,199,0.1) 100%)", border: "1px solid rgba(14,165,233,0.2)" }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #0EA5E9 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.4)" }}>
                <Shield className="w-8 h-8" style={{ color: "#0EA5E9" }} />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Pronto para proteger quem você ama?</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">Junte-se a mais de 2.500 famílias que já confiam no Sage. Comece hoje com 30 dias de garantia.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={handleCadastro} className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold text-lg transition-all hover:-translate-y-1" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 6px 20px rgba(14,165,233,0.4)" }}>
                  Criar Conta Grátis <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/loja" className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold text-lg transition-all hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                  Ver Planos e Preços
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 justify-center mt-8 text-sm text-slate-500">
                {["30 dias de garantia","Suporte 24/7","Frete grátis"].map(t => (
                  <span key={t} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t" style={{ background: "#05080A", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}><Heart className="w-4 h-4 text-white" /></div>
                <span className="text-xl font-bold text-white">Sage</span>
              </div>
              <p className="text-slate-500 text-sm">Cuidado inteligente para quem você ama.</p>
            </div>
            {[{h:"Produto",ls:["Funcionalidades","Planos","Como Funciona","Segurança"]},{h:"Empresa",ls:["Sobre nós","Blog","Carreiras","Imprensa"]},{h:"Contato",ls:[]}].map(col => (
              <div key={col.h}>
                <h4 className="text-white font-semibold mb-4">{col.h}</h4>
                {col.h === "Contato" ? (
                  <div className="space-y-3">
                    <a href="tel:08001234567" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"><Phone className="w-4 h-4" />0800 123 4567</a>
                    <a href="mailto:contato@sage.com.br" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"><Mail className="w-4 h-4" />contato@sage.com.br</a>
                  </div>
                ) : (
                  <div className="space-y-2">{col.ls.map(l => <a key={l} href="#" className="block text-slate-500 hover:text-white text-sm transition-colors">{l}</a>)}</div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-slate-600 text-sm">© 2026 Sage Wearable. Todos os direitos reservados.</p>
            <div className="flex gap-6">{["Privacidade","Termos","Cookies"].map(l => <a key={l} href="#" className="text-slate-600 hover:text-white text-sm transition-colors">{l}</a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    {q:"O colete é confortável para uso diário?",a:"Sim. O Sage foi projetado com tecido respirável e leve, pesando apenas 380g. Pode ser usado o dia todo sem desconforto, inclusive durante o sono."},
    {q:"Precisa de internet para funcionar?",a:"A detecção de quedas e monitoramento local funcionam sem internet via Edge AI. A internet é necessária apenas para enviar alertas e sincronizar dados com o app."},
    {q:"Qual a duração da bateria?",a:"A bateria dura até 72 horas com uso contínuo. O carregamento é feito por cabo USB-C e leva cerca de 2 horas para carga completa."},
    {q:"Como funciona o plano HaaS?",a:"No modelo Hardware as a Service, você paga uma mensalidade e recebe o colete sem custo inicial. Inclui suporte técnico, reposição em caso de defeito e atualizações de firmware."},
    {q:"O Sage é resistente à água?",a:"Sim, o colete possui certificação IP54 — resistente a respingos e suor. Não é recomendado para uso em banho ou piscina."},
    {q:"Quantos cuidadores posso cadastrar?",a:"No plano Básico, até 2 cuidadores. No Premium e HaaS, até 5 cuidadores com diferentes níveis de alerta e permissão."},
  ];
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: "rgba(14,20,30,0.6)", border: `1px solid ${openIdx === i ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.06)"}` }}>
          <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span className="text-white font-medium pr-4">{faq.q}</span>
            <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform duration-300" style={{ color: "#0EA5E9", transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          {openIdx === i && <div className="px-5 pb-5"><p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p></div>}
        </div>
      ))}
    </div>
  );
}
