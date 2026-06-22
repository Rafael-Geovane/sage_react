import { useState } from "react";
import { useLocation } from "wouter";
import { Heart, Eye, EyeOff, ArrowLeft, ArrowRight, Check, User, Shield, Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Mode = "login" | "cadastro";
type Step = 1 | 2 | 3;

const PLANOS_CADASTRO = ["Básico", "Premium", "HaaS"] as const;
const TIPOS_SANGUINEOS = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Não sei"];

export default function Auth() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) ?? "login");
  const [step, setStep] = useState<Step>(1);
  const [showPass, setShowPass] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // Cadastro form
  const [cadastro, setCadastro] = useState({
    nome: "", email: "", senha: "", confirmarSenha: "", cpf: "", dataNascimento: "", telefone: "", endereco: "",
    nomePlano: "Premium" as typeof PLANOS_CADASTRO[number],
    cuidadorNome: "", cuidadorTelefone: "", cuidadorEmail: "", cuidadorParentesco: "",
    tipoSanguineo: "", condicoesMedicas: "", alergias: "", medicamentos: "",
  });

  const loginMutation = trpc.usuarios.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo, ${data.usuario?.nome}!`);
      if (data.usuario?.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const cadastroMutation = trpc.usuarios.create.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, senha: loginSenha });
  };

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep((s) => (s + 1) as Step); return; }
    if (cadastro.senha !== cadastro.confirmarSenha) { toast.error("As senhas não coincidem."); return; }
    cadastroMutation.mutate({
      nome: cadastro.nome, email: cadastro.email, senha: cadastro.senha,
      cpf: cadastro.cpf, dataNascimento: cadastro.dataNascimento,
      telefone: cadastro.telefone, endereco: cadastro.endereco,
      nomePlano: cadastro.nomePlano,
      tipoSanguineo: cadastro.tipoSanguineo,
      condicoesMedicas: cadastro.condicoesMedicas,
      alergias: cadastro.alergias, medicamentos: cadastro.medicamentos,
    });
  };

  const set = (k: keyof typeof cadastro) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCadastro(p => ({ ...p, [k]: e.target.value }));

  const inputCls = "w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-sky-500/40 transition-all";
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0F16" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #05080A 0%, #0D1520 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #0EA5E9, transparent)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Sage Wearable</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Proteção inteligente para quem você ama
          </h2>
          <p className="text-slate-400 text-lg mb-12">Monitoramento de sinais vitais, detecção de quedas e alertas em tempo real.</p>
          <div className="space-y-4">
            {[{I:Activity,t:"Vitais em tempo real",d:"BPM, SpO₂, temperatura e localização"},{I:Shield,t:"Detecção de quedas",d:"Alerta em menos de 500ms"},{I:User,t:"Multi-cuidadores",d:"Até 5 cuidadores por dispositivo"}].map(({I,t,d}) => (
              <div key={t} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.15)" }}>
                  <I className="w-5 h-5" style={{ color: "#0EA5E9" }} />
                </div>
                <div>
                  <div className="text-white font-medium">{t}</div>
                  <div className="text-slate-500 text-sm">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-slate-600 text-sm">© 2026 Sage Wearable. Todos os direitos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />Voltar ao site
          </a>

          {mode === "login" ? (
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Entrar na sua conta</h1>
              <p className="text-slate-400 mb-8">Acesse o painel de monitoramento</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">E-mail</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="seu@email.com" required className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Senha</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={loginSenha} onChange={e => setLoginSenha(e.target.value)} placeholder="••••••••" required className={`${inputCls} pr-12`} style={inputStyle} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-xs" style={{ color: "#0EA5E9" }}>Esqueceu a senha?</a>
                </div>
                <button type="submit" disabled={loginMutation.isPending}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                Não tem conta?{" "}
                <button onClick={() => { setMode("cadastro"); setStep(1); }} className="font-medium" style={{ color: "#0EA5E9" }}>Criar conta grátis</button>
              </p>

              {/* Demo credentials */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
                <p className="text-xs text-slate-400 mb-2 font-medium">Credenciais de demonstração:</p>
                <div className="space-y-1 text-xs text-slate-500">
                  <div>Usuário: <span className="text-slate-300">joao@sage.com</span> / <span className="text-slate-300">123456</span></div>
                  <div>Admin: <span className="text-slate-300">admin@sage.com</span> / <span className="text-slate-300">admin123</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
              <p className="text-slate-400 mb-6">Comece a proteger quem você ama</p>

              {/* Steps indicator */}
              <div className="flex items-center gap-2 mb-8">
                {[{n:1,l:"Dados Pessoais",I:User},{n:2,l:"Cuidador",I:Shield},{n:3,l:"Ficha Médica",I:Activity}].map((s, i) => (
                  <div key={s.n} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all`}
                        style={{ background: step > s.n ? "#10B981" : step === s.n ? "linear-gradient(135deg, #0EA5E9, #0284C7)" : "rgba(255,255,255,0.06)", color: step >= s.n ? "white" : "#64748b" }}>
                        {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                      </div>
                      <span className={`text-xs mt-1 hidden sm:block ${step === s.n ? "text-white" : "text-slate-500"}`}>{s.l}</span>
                    </div>
                    {i < 2 && <div className="flex-1 h-px mx-1" style={{ background: step > s.n ? "#10B981" : "rgba(255,255,255,0.06)" }} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleCadastro} className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome completo *</label>
                        <input value={cadastro.nome} onChange={set("nome")} placeholder="João Silva" required className={inputCls} style={inputStyle} />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">E-mail *</label>
                        <input type="email" value={cadastro.email} onChange={set("email")} placeholder="joao@email.com" required className={inputCls} style={inputStyle} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Senha *</label>
                          <input type="password" value={cadastro.senha} onChange={set("senha")} placeholder="••••••••" required minLength={6} className={inputCls} style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Confirmar Senha *</label>
                          <input type="password" value={cadastro.confirmarSenha} onChange={set("confirmarSenha")} placeholder="••••••••" required className={inputCls} style={inputStyle} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">CPF</label>
                          <input value={cadastro.cpf} onChange={set("cpf")} placeholder="000.000.000-00" className={inputCls} style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Telefone</label>
                          <input value={cadastro.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" className={inputCls} style={inputStyle} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Data de Nascimento</label>
                          <input type="date" value={cadastro.dataNascimento} onChange={set("dataNascimento")} className={inputCls} style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Endereço</label>
                          <input value={cadastro.endereco} onChange={set("endereco")} placeholder="Rua, número, cidade" className={inputCls} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Plano</label>
                        <select value={cadastro.nomePlano} onChange={set("nomePlano")} className={inputCls} style={inputStyle}>
                          {PLANOS_CADASTRO.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="text-slate-400 text-sm mb-4">Adicione um cuidador principal que receberá alertas de emergência.</p>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Nome do Cuidador *</label>
                      <input value={cadastro.cuidadorNome} onChange={set("cuidadorNome")} placeholder="Maria Silva" required className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Telefone do Cuidador *</label>
                      <input value={cadastro.cuidadorTelefone} onChange={set("cuidadorTelefone")} placeholder="(11) 99999-9999" required className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">E-mail do Cuidador</label>
                      <input type="email" value={cadastro.cuidadorEmail} onChange={set("cuidadorEmail")} placeholder="maria@email.com" className={inputCls} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Parentesco</label>
                      <input value={cadastro.cuidadorParentesco} onChange={set("cuidadorParentesco")} placeholder="Filho(a), Cônjuge, Cuidador..." className={inputCls} style={inputStyle} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-slate-400 text-sm mb-4">Informações médicas ajudam a personalizar os alertas.</p>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tipo Sanguíneo</label>
                      <select value={cadastro.tipoSanguineo} onChange={set("tipoSanguineo")} className={inputCls} style={inputStyle}>
                        <option value="">Selecione...</option>
                        {TIPOS_SANGUINEOS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Condições Médicas</label>
                      <textarea value={cadastro.condicoesMedicas} onChange={set("condicoesMedicas")} placeholder="Hipertensão, diabetes, etc." rows={2}
                        className={`${inputCls} resize-none`} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Alergias</label>
                      <textarea value={cadastro.alergias} onChange={set("alergias")} placeholder="Penicilina, AAS, etc." rows={2}
                        className={`${inputCls} resize-none`} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Medicamentos em Uso</label>
                      <textarea value={cadastro.medicamentos} onChange={set("medicamentos")} placeholder="Losartana 50mg, Metformina..." rows={2}
                        className={`${inputCls} resize-none`} style={inputStyle} />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => (s - 1) as Step)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-300 transition-all hover:text-white"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                      <ArrowLeft className="w-4 h-4" />Voltar
                    </button>
                  )}
                  <button type="submit" disabled={cadastroMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}>
                    {cadastroMutation.isPending ? "Criando..." : step < 3 ? (<>Próximo <ArrowRight className="w-4 h-4" /></>) : "Criar Conta"}
                  </button>
                </div>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="font-medium" style={{ color: "#0EA5E9" }}>Entrar</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
