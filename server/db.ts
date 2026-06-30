import { getSupabase } from "./supabase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sb() {
  return getSupabase();
}

// ─── AUTH USERS ──────────────────────────────────────────────────────────────

export interface InsertUser {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin";
  lastSignedIn?: Date;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const row: Record<string, unknown> = { openId: user.openId };
  if (user.name !== undefined) row.name = user.name;
  if (user.email !== undefined) row.email = user.email;
  if (user.loginMethod !== undefined) row.loginMethod = user.loginMethod;
  if (user.role !== undefined) row.role = user.role;
  row.lastSignedIn = user.lastSignedIn ?? new Date();
  row.updatedAt = new Date();

  const { error } = await sb().from("users").upsert(row, { onConflict: "openId" });
  if (error) { console.error("[DB] upsertUser error:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const { data } = await sb().from("users").select("*").eq("openId", openId).limit(1).single();
  return data ?? undefined;
}

// ─── USUARIOS ────────────────────────────────────────────────────────────────

export interface InsertUsuario {
  nome: string;
  email?: string | null;
  senhaHash?: string | null;
  cpf?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  nomePlano?: string | null;
  tipoSanguineo?: string | null;
  condicoesMedicas?: string | null;
  alergias?: string | null;
  medicamentos?: string | null;
  notificarPush?: boolean;
  notificarSms?: boolean;
  notificarLigacao?: boolean;
  idAdminResponsavel?: number | null;
  role?: "user" | "admin";
  status?: string;
}

function usuarioToRow(data: Partial<InsertUsuario>) {
  const row: Record<string, unknown> = {};
  if (data.nome !== undefined) row.nome = data.nome;
  if (data.email !== undefined) row.email = data.email;
  if (data.senhaHash !== undefined) row.senha_hash = data.senhaHash;
  if (data.cpf !== undefined) row.cpf = data.cpf;
  if (data.dataNascimento !== undefined) row.data_nascimento = data.dataNascimento;
  if (data.telefone !== undefined) row.telefone = data.telefone;
  if (data.endereco !== undefined) row.endereco = data.endereco;
  if (data.nomePlano !== undefined) row.nome_plano = data.nomePlano;
  if (data.tipoSanguineo !== undefined) row.tipo_sanguineo = data.tipoSanguineo;
  if (data.condicoesMedicas !== undefined) row.condicoes_medicas = data.condicoesMedicas;
  if (data.alergias !== undefined) row.alergias = data.alergias;
  if (data.medicamentos !== undefined) row.medicamentos = data.medicamentos;
  if (data.notificarPush !== undefined) row.notificar_push = data.notificarPush;
  if (data.notificarSms !== undefined) row.notificar_sms = data.notificarSms;
  if (data.notificarLigacao !== undefined) row.notificar_ligacao = data.notificarLigacao;
  if (data.idAdminResponsavel !== undefined) row.id_admin_responsavel = data.idAdminResponsavel;
  if (data.role !== undefined) row.role = data.role;
  if (data.status !== undefined) row.status = data.status;
  return row;
}

function rowToUsuario(row: any) {
  if (!row) return undefined;
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    cpf: row.cpf,
    dataNascimento: row.data_nascimento,
    telefone: row.telefone,
    endereco: row.endereco,
    nomePlano: row.nome_plano,
    tipoSanguineo: row.tipo_sanguineo,
    condicoesMedicas: row.condicoes_medicas,
    alergias: row.alergias,
    medicamentos: row.medicamentos,
    notificarPush: row.notificar_push,
    notificarSms: row.notificar_sms,
    notificarLigacao: row.notificar_ligacao,
    idAdminResponsavel: row.id_admin_responsavel,
    role: row.role,
    status: row.status,
    criadoEm: row.criado_em,
  };
}

export async function getUsuarios(search?: string) {
  let query = sb().from("usuarios").select("*").order("criado_em", { ascending: false });
  if (search) query = query.ilike("nome", `%${search}%`);
  const { data, error } = await query;
  if (error) { console.error("[DB] getUsuarios:", error); return []; }
  return (data ?? []).map(rowToUsuario);
}

export async function getUsuarioById(id: number) {
  const { data } = await sb().from("usuarios").select("*").eq("id", id).limit(1).single();
  return rowToUsuario(data);
}

export async function getUsuarioByEmail(email: string) {
  const { data } = await sb().from("usuarios").select("*").eq("email", email).limit(1).single();
  return rowToUsuario(data);
}

export async function createUsuario(input: InsertUsuario) {
  const row = usuarioToRow(input);
  const { data, error } = await sb().from("usuarios").insert(row).select().single();
  if (error) { console.error("[DB] createUsuario:", error); throw error; }
  return data;
}

export async function updateUsuario(id: number, input: Partial<InsertUsuario>) {
  const row = usuarioToRow(input);
  const { error } = await sb().from("usuarios").update(row).eq("id", id);
  if (error) { console.error("[DB] updateUsuario:", error); throw error; }
}

export async function deleteUsuario(id: number) {
  const { error } = await sb().from("usuarios").delete().eq("id", id);
  if (error) { console.error("[DB] deleteUsuario:", error); throw error; }
}

export async function countUsuarios() {
  const { count, error } = await sb().from("usuarios").select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

// ─── CUIDADORES ───────────────────────────────────────────────────────────────

export interface InsertCuidador {
  nome: string;
  telefone: string;
  email?: string | null;
  parentesco?: string | null;
  idUsuario: number;
}

function cuidadorToRow(d: Partial<InsertCuidador>) {
  const r: Record<string, unknown> = {};
  if (d.nome !== undefined) r.nome = d.nome;
  if (d.telefone !== undefined) r.telefone = d.telefone;
  if (d.email !== undefined) r.email = d.email;
  if (d.parentesco !== undefined) r.parentesco = d.parentesco;
  if (d.idUsuario !== undefined) r.id_usuario = d.idUsuario;
  return r;
}

function rowToCuidador(row: any) {
  if (!row) return undefined;
  return { id: row.id, nome: row.nome, telefone: row.telefone, email: row.email, parentesco: row.parentesco, idUsuario: row.id_usuario, criadoEm: row.criado_em };
}

export async function getCuidadoresByUsuario(idUsuario: number) {
  const { data } = await sb().from("cuidadores").select("*").eq("id_usuario", idUsuario);
  return (data ?? []).map(rowToCuidador);
}

export async function createCuidador(input: InsertCuidador) {
  const { data, error } = await sb().from("cuidadores").insert(cuidadorToRow(input)).select().single();
  if (error) throw error;
  return data;
}

export async function updateCuidador(id: number, input: Partial<InsertCuidador>) {
  const { error } = await sb().from("cuidadores").update(cuidadorToRow(input)).eq("id", id);
  if (error) throw error;
}

export async function deleteCuidador(id: number) {
  const { error } = await sb().from("cuidadores").delete().eq("id", id);
  if (error) throw error;
}

// ─── DISPOSITIVOS ─────────────────────────────────────────────────────────────

export interface InsertDispositivo {
  codigoSerial: string;
  versaoFirmware?: string | null;
  nivelBateria?: number | null;
  tipoConexao?: string | null;
  statusConexao?: string | null;
  tempoUltimoSinal?: string | null;
  idUsuario?: number | null;
}

function dispositivoToRow(d: Partial<InsertDispositivo>) {
  const r: Record<string, unknown> = {};
  if (d.codigoSerial !== undefined) r.codigo_serial = d.codigoSerial;
  if (d.versaoFirmware !== undefined) r.versao_firmware = d.versaoFirmware;
  if (d.nivelBateria !== undefined) r.nivel_bateria = d.nivelBateria;
  if (d.tipoConexao !== undefined) r.tipo_conexao = d.tipoConexao;
  if (d.statusConexao !== undefined) r.status_conexao = d.statusConexao;
  if (d.tempoUltimoSinal !== undefined) r.tempo_ultimo_sinal = d.tempoUltimoSinal;
  if (d.idUsuario !== undefined) r.id_usuario = d.idUsuario;
  return r;
}

function rowToDispositivo(row: any) {
  if (!row) return undefined;
  return {
    id: row.id, codigoSerial: row.codigo_serial, versaoFirmware: row.versao_firmware,
    nivelBateria: row.nivel_bateria, tipoConexao: row.tipo_conexao,
    statusConexao: row.status_conexao, tempoUltimoSinal: row.tempo_ultimo_sinal,
    idUsuario: row.id_usuario, atualizadoEm: row.atualizado_em,
  };
}

export async function getDispositivos(idUsuario?: number) {
  let q = sb().from("dispositivos").select("*").order("atualizado_em", { ascending: false });
  if (idUsuario) q = q.eq("id_usuario", idUsuario);
  const { data } = await q;
  return (data ?? []).map(rowToDispositivo);
}

export async function getDispositivoBySerial(serial: string) {
  const { data } = await sb().from("dispositivos").select("*").eq("codigo_serial", serial).limit(1).single();
  return rowToDispositivo(data);
}

export async function createDispositivo(input: InsertDispositivo) {
  const { data, error } = await sb().from("dispositivos").insert(dispositivoToRow(input)).select().single();
  if (error) throw error;
  return data;
}

export async function updateDispositivo(id: number, input: Partial<InsertDispositivo>) {
  const row = dispositivoToRow(input);
  row.atualizado_em = new Date().toISOString();
  const { error } = await sb().from("dispositivos").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteDispositivo(id: number) {
  const { error } = await sb().from("dispositivos").delete().eq("id", id);
  if (error) throw error;
}

export async function countDispositivosOnline() {
  const { count } = await sb().from("dispositivos").select("*", { count: "exact", head: true }).eq("status_conexao", "Online");
  return count ?? 0;
}

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────

export interface InsertPedido {
  numeroPedido: string;
  valor?: string | null;
  formaPagamento?: string | null;
  status?: string | null;
  corColete?: string | null;
  tamanhoColete?: string | null;
  nomePlano?: string | null;
  idUsuario: number;
  idAdminResponsavel?: number | null;
}

function pedidoToRow(d: Partial<InsertPedido>) {
  const r: Record<string, unknown> = {};
  if (d.numeroPedido !== undefined) r.numero_pedido = d.numeroPedido;
  if (d.valor !== undefined) r.valor = d.valor;
  if (d.formaPagamento !== undefined) r.forma_pagamento = d.formaPagamento;
  if (d.status !== undefined) r.status = d.status;
  if (d.corColete !== undefined) r.cor_colete = d.corColete;
  if (d.tamanhoColete !== undefined) r.tamanho_colete = d.tamanhoColete;
  if (d.nomePlano !== undefined) r.nome_plano = d.nomePlano;
  if (d.idUsuario !== undefined) r.id_usuario = d.idUsuario;
  if (d.idAdminResponsavel !== undefined) r.id_admin_responsavel = d.idAdminResponsavel;
  return r;
}

function rowToPedido(row: any) {
  if (!row) return undefined;
  return {
    id: row.id, numeroPedido: row.numero_pedido, valor: row.valor,
    formaPagamento: row.forma_pagamento, status: row.status,
    corColete: row.cor_colete, tamanhoColete: row.tamanho_colete,
    nomePlano: row.nome_plano, idUsuario: row.id_usuario,
    idAdminResponsavel: row.id_admin_responsavel, criadoEm: row.criado_em,
  };
}

export async function getPedidos(idUsuario?: number) {
  let q = sb().from("pedidos").select("*").order("criado_em", { ascending: false });
  if (idUsuario) q = q.eq("id_usuario", idUsuario);
  const { data } = await q;
  return (data ?? []).map(rowToPedido);
}

export async function createPedido(input: InsertPedido) {
  const { data, error } = await sb().from("pedidos").insert(pedidoToRow(input)).select().single();
  if (error) throw error;
  return data;
}

export async function updatePedido(id: number, input: Partial<InsertPedido>) {
  const { error } = await sb().from("pedidos").update(pedidoToRow(input)).eq("id", id);
  if (error) throw error;
}

// ─── TICKETS ──────────────────────────────────────────────────────────────────

export interface InsertTicket {
  numeroTicket: string;
  assunto?: string | null;
  prioridade?: string | null;
  status?: string | null;
  idUsuario: number;
  idAdminResponsavel?: number | null;
}

function ticketToRow(d: Partial<InsertTicket>) {
  const r: Record<string, unknown> = {};
  if (d.numeroTicket !== undefined) r.numero_ticket = d.numeroTicket;
  if (d.assunto !== undefined) r.assunto = d.assunto;
  if (d.prioridade !== undefined) r.prioridade = d.prioridade;
  if (d.status !== undefined) r.status = d.status;
  if (d.idUsuario !== undefined) r.id_usuario = d.idUsuario;
  if (d.idAdminResponsavel !== undefined) r.id_admin_responsavel = d.idAdminResponsavel;
  return r;
}

function rowToTicket(row: any) {
  if (!row) return undefined;
  return {
    id: row.id, numeroTicket: row.numero_ticket, assunto: row.assunto,
    prioridade: row.prioridade, status: row.status,
    idUsuario: row.id_usuario, idAdminResponsavel: row.id_admin_responsavel,
    criadoEm: row.criado_em,
  };
}

export async function getTickets(idUsuario?: number) {
  let q = sb().from("tickets").select("*").order("criado_em", { ascending: false });
  if (idUsuario) q = q.eq("id_usuario", idUsuario);
  const { data } = await q;
  return (data ?? []).map(rowToTicket);
}

export async function createTicket(input: InsertTicket) {
  const { data, error } = await sb().from("tickets").insert(ticketToRow(input)).select().single();
  if (error) throw error;
  return data;
}

export async function updateTicket(id: number, input: Partial<InsertTicket>) {
  const { error } = await sb().from("tickets").update(ticketToRow(input)).eq("id", id);
  if (error) throw error;
}

export async function deleteTicket(id: number) {
  const { error } = await sb().from("tickets").delete().eq("id", id);
  if (error) throw error;
}

export async function countTicketsAbertos() {
  const { count } = await sb().from("tickets").select("*", { count: "exact", head: true }).neq("status", "Respondido");
  return count ?? 0;
}

// ─── EVENTOS_SAUDE ────────────────────────────────────────────────────────────

export interface InsertEventoSaude {
  frequenciaCardiaca?: number | null;
  oxigenacaoSpo2?: number | null;
  temperaturaCorporal?: string | null;
  quedasDetectadas?: number | null;
  localizacaoEndereco?: string | null;
  categoriaEvento?: string | null;
  descricaoEvento?: string | null;
  idUsuario: number;
  idDispositivo?: number | null;
  dataHoraRegistro: Date;
}

function eventoToRow(d: Partial<InsertEventoSaude>) {
  const r: Record<string, unknown> = {};
  if (d.frequenciaCardiaca !== undefined) r.frequencia_cardiaca = d.frequenciaCardiaca;
  if (d.oxigenacaoSpo2 !== undefined) r.oxigenacao_spo2 = d.oxigenacaoSpo2;
  if (d.temperaturaCorporal !== undefined) r.temperatura_corporal = d.temperaturaCorporal;
  if (d.quedasDetectadas !== undefined) r.quedas_detectadas = d.quedasDetectadas;
  if (d.localizacaoEndereco !== undefined) r.localizacao_endereco = d.localizacaoEndereco;
  if (d.categoriaEvento !== undefined) r.categoria_evento = d.categoriaEvento;
  if (d.descricaoEvento !== undefined) r.descricao_evento = d.descricaoEvento;
  if (d.idUsuario !== undefined) r.id_usuario = d.idUsuario;
  if (d.idDispositivo !== undefined) r.id_dispositivo = d.idDispositivo;
  if (d.dataHoraRegistro !== undefined) r.data_hora_registro = d.dataHoraRegistro instanceof Date ? d.dataHoraRegistro.toISOString() : d.dataHoraRegistro;
  return r;
}

function rowToEvento(row: any) {
  if (!row) return undefined;
  return {
    id: row.id, frequenciaCardiaca: row.frequencia_cardiaca, oxigenacaoSpo2: row.oxigenacao_spo2,
    temperaturaCorporal: row.temperatura_corporal, quedasDetectadas: row.quedas_detectadas,
    localizacaoEndereco: row.localizacao_endereco, categoriaEvento: row.categoria_evento,
    descricaoEvento: row.descricao_evento, idUsuario: row.id_usuario,
    idDispositivo: row.id_dispositivo, dataHoraRegistro: row.data_hora_registro,
  };
}

export async function getEventosSaude(idUsuario: number, limit = 50) {
  const { data } = await sb().from("eventos_saude").select("*")
    .eq("id_usuario", idUsuario).order("data_hora_registro", { ascending: false }).limit(limit);
  return (data ?? []).map(rowToEvento);
}

export async function createEventoSaude(input: InsertEventoSaude) {
  const { data, error } = await sb().from("eventos_saude").insert(eventoToRow(input)).select().single();
  if (error) throw error;
  return data;
}

// ─── LEITURA_SENSORES ─────────────────────────────────────────────────────────

export interface InsertLeituraSensor {
  idDispositivo: number;
  idUsuario?: number | null;
  payload?: unknown;
  frequenciaCardiaca?: number | null;
  oxigenacaoSpo2?: number | null;
  temperaturaCorporal?: string | null;
  acelerometroX?: string | null;
  acelerometroY?: string | null;
  acelerometroZ?: string | null;
  giroscopioX?: string | null;
  giroscopioY?: string | null;
  giroscopioZ?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  nivelBateria?: number | null;
  quedaDetectada?: boolean;
  timestampSensor?: Date | null;
}

function leituraToRow(d: InsertLeituraSensor) {
  return {
    id_dispositivo: d.idDispositivo,
    id_usuario: d.idUsuario ?? null,
    payload: d.payload ?? null,
    frequencia_cardiaca: d.frequenciaCardiaca ?? null,
    oxigenacao_spo2: d.oxigenacaoSpo2 ?? null,
    temperatura_corporal: d.temperaturaCorporal ?? null,
    acelerometro_x: d.acelerometroX ?? null,
    acelerometro_y: d.acelerometroY ?? null,
    acelerometro_z: d.acelerometroZ ?? null,
    giroscopio_x: d.giroscopioX ?? null,
    giroscopio_y: d.giroscopioY ?? null,
    giroscopio_z: d.giroscopioZ ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    nivel_bateria: d.nivelBateria ?? null,
    queda_detectada: d.quedaDetectada ?? false,
    timestamp_sensor: d.timestampSensor instanceof Date ? d.timestampSensor.toISOString() : (d.timestampSensor ?? null),
  };
}

function rowToLeitura(row: any) {
  if (!row) return undefined;
  return {
    id: row.id, idDispositivo: row.id_dispositivo, idUsuario: row.id_usuario,
    payload: row.payload,
    frequenciaCardiaca: row.frequencia_cardiaca, oxigenacaoSpo2: row.oxigenacao_spo2,
    temperaturaCorporal: row.temperatura_corporal,
    acelerometroX: row.acelerometro_x, acelerometroY: row.acelerometro_y, acelerometroZ: row.acelerometro_z,
    giroscopioX: row.giroscopio_x, giroscopioY: row.giroscopio_y, giroscopioZ: row.giroscopio_z,
    latitude: row.latitude, longitude: row.longitude,
    nivelBateria: row.nivel_bateria, quedaDetectada: row.queda_detectada,
    timestampSensor: row.timestamp_sensor, recebidoEm: row.recebido_em,
  };
}

export async function ingestLeitura(data: InsertLeituraSensor) {
  const { error } = await sb().from("leitura_sensores").insert(leituraToRow(data));
  if (error) { console.error("[DB] ingestLeitura:", error); throw error; }
}

export async function getUltimasLeituras(idDispositivo: number, limit = 50) {
  const { data } = await sb().from("leitura_sensores").select("*")
    .eq("id_dispositivo", idDispositivo).order("recebido_em", { ascending: false }).limit(limit);
  return (data ?? []).map(rowToLeitura);
}

export async function getUltimaLeituraByUsuario(idUsuario: number) {
  const { data } = await sb().from("leitura_sensores").select("*")
    .eq("id_usuario", idUsuario).order("recebido_em", { ascending: false }).limit(1).single();
  return rowToLeitura(data);
}

export async function getUltimaLeituraByDispositivo(idDispositivo: number) {
  const { data } = await sb().from("leitura_sensores").select("*")
    .eq("id_dispositivo", idDispositivo).order("recebido_em", { ascending: false }).limit(1).single();
  return rowToLeitura(data);
}

// ─── LEITURAS HISTÓRICAS (para relatórios) ───────────────────────────────────

export async function getLeiturasHistorico(idUsuario: number, diasAtras: number = 20) {
  const desde = new Date();
  desde.setDate(desde.getDate() - diasAtras);

  const { data } = await sb().from("leitura_sensores").select("*")
    .eq("id_usuario", idUsuario)
    .gte("recebido_em", desde.toISOString())
    .order("recebido_em", { ascending: true });

  return (data ?? []).map(rowToLeitura);
}

export async function getLeiturasHistoricoByDispositivo(idDispositivo: number, diasAtras: number = 20) {
  const desde = new Date();
  desde.setDate(desde.getDate() - diasAtras);

  const { data } = await sb().from("leitura_sensores").select("*")
    .eq("id_dispositivo", idDispositivo)
    .gte("recebido_em", desde.toISOString())
    .order("recebido_em", { ascending: true });

  return (data ?? []).map(rowToLeitura);
}

export async function getLeiturasResumoDiario(idUsuario: number, diasAtras: number = 20) {
  // Busca todas as leituras do período e agrupa por dia no servidor
  const leituras = await getLeiturasHistorico(idUsuario, diasAtras);

  const porDia: Record<string, { bpms: number[]; spo2s: number[]; temps: number[]; quedas: number; count: number }> = {};

  for (const l of leituras) {
    if (!l) continue;
    const dia = (l.recebidoEm ?? l.timestampSensor ?? "").toString().slice(0, 10); // YYYY-MM-DD
    if (!dia) continue;
    if (!porDia[dia]) porDia[dia] = { bpms: [], spo2s: [], temps: [], quedas: 0, count: 0 };
    const d = porDia[dia];
    if (l.frequenciaCardiaca) d.bpms.push(Number(l.frequenciaCardiaca));
    if (l.oxigenacaoSpo2) d.spo2s.push(Number(l.oxigenacaoSpo2));
    if (l.temperaturaCorporal) d.temps.push(Number(l.temperaturaCorporal));
    if (l.quedaDetectada) d.quedas++;
    d.count++;
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  return Object.entries(porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, d]) => ({
      dia,
      bpmMedio: avg(d.bpms),
      bpmMin: d.bpms.length > 0 ? Math.min(...d.bpms) : null,
      bpmMax: d.bpms.length > 0 ? Math.max(...d.bpms) : null,
      spo2Medio: avg(d.spo2s),
      spo2Min: d.spo2s.length > 0 ? Math.min(...d.spo2s) : null,
      spo2Max: d.spo2s.length > 0 ? Math.max(...d.spo2s) : null,
      tempMedia: avg(d.temps),
      quedas: d.quedas,
      totalLeituras: d.count,
    }));
}

export async function getLeiturasResumoDiarioByDispositivo(idDispositivo: number, diasAtras: number = 20) {
  const leituras = await getLeiturasHistoricoByDispositivo(idDispositivo, diasAtras);

  const porDia: Record<string, { bpms: number[]; spo2s: number[]; temps: number[]; quedas: number; count: number }> = {};

  for (const l of leituras) {
    if (!l) continue;
    const dia = (l.recebidoEm ?? l.timestampSensor ?? "").toString().slice(0, 10);
    if (!dia) continue;
    if (!porDia[dia]) porDia[dia] = { bpms: [], spo2s: [], temps: [], quedas: 0, count: 0 };
    const d = porDia[dia];
    if (l.frequenciaCardiaca) d.bpms.push(Number(l.frequenciaCardiaca));
    if (l.oxigenacaoSpo2) d.spo2s.push(Number(l.oxigenacaoSpo2));
    if (l.temperaturaCorporal) d.temps.push(Number(l.temperaturaCorporal));
    if (l.quedaDetectada) d.quedas++;
    d.count++;
  }

  const avg = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  return Object.entries(porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, d]) => ({
      dia,
      bpmMedio: avg(d.bpms),
      bpmMin: d.bpms.length > 0 ? Math.min(...d.bpms) : null,
      bpmMax: d.bpms.length > 0 ? Math.max(...d.bpms) : null,
      spo2Medio: avg(d.spo2s),
      spo2Min: d.spo2s.length > 0 ? Math.min(...d.spo2s) : null,
      spo2Max: d.spo2s.length > 0 ? Math.max(...d.spo2s) : null,
      tempMedia: avg(d.temps),
      quedas: d.quedas,
      totalLeituras: d.count,
    }));
}

export async function getEventosByDispositivo(idDispositivo: number, limit = 50) {
  const { data } = await sb().from("eventos_saude").select("*")
    .eq("id_dispositivo", idDispositivo).order("data_hora_registro", { ascending: false }).limit(limit);
  return (data ?? []).map(rowToEvento);
}

// ─── ADMINS ──────────────────────────────────────────────────────────────────

export interface InsertAdmin {
  nome: string;
  email: string;
  senhaHash: string;
  nivelAcesso?: string;
}

export async function getAdminByEmail(email: string) {
  const { data } = await sb().from("admins").select("*").eq("email", email).limit(1).single();
  if (!data) return undefined;
  return { id: data.id, nome: data.nome, email: data.email, senhaHash: data.senha_hash, nivelAcesso: data.nivel_acesso, criadoEm: data.criado_em };
}

export async function createAdmin(input: InsertAdmin) {
  const { data, error } = await sb().from("admins").insert({
    nome: input.nome, email: input.email, senha_hash: input.senhaHash, nivel_acesso: input.nivelAcesso ?? "operador",
  }).select().single();
  if (error) throw error;
  return data;
}

// ─── ALERTAS (notificações de saúde) ──────────────────────────────────────────

export interface InsertAlerta {
  idUsuario?: number | null;
  idDispositivo?: number | null;
  tipo: string;
  severidade: "alerta" | "critico";
  titulo: string;
  mensagem?: string | null;
  valorDetectado?: number | null;
  limiteReferencia?: number | null;
}

function alertaToRow(d: InsertAlerta) {
  return {
    id_usuario: d.idUsuario ?? null,
    id_dispositivo: d.idDispositivo ?? null,
    tipo: d.tipo,
    severidade: d.severidade,
    titulo: d.titulo,
    mensagem: d.mensagem ?? null,
    valor_detectado: d.valorDetectado ?? null,
    limite_referencia: d.limiteReferencia ?? null,
  };
}

function rowToAlerta(row: any) {
  if (!row) return undefined;
  return {
    id: row.id,
    idUsuario: row.id_usuario,
    idDispositivo: row.id_dispositivo,
    tipo: row.tipo,
    severidade: row.severidade,
    titulo: row.titulo,
    mensagem: row.mensagem,
    valorDetectado: row.valor_detectado,
    limiteReferencia: row.limite_referencia,
    lido: row.lido,
    criadoEm: row.criado_em,
  };
}

export async function createAlerta(input: InsertAlerta) {
  const { data, error } = await sb().from("alertas").insert(alertaToRow(input)).select().single();
  if (error) { console.error("[DB] createAlerta:", error); throw error; }
  return data;
}

export async function getAlertasByUsuario(idUsuario: number, limit = 50) {
  const { data } = await sb().from("alertas").select("*")
    .eq("id_usuario", idUsuario).order("criado_em", { ascending: false }).limit(limit);
  return (data ?? []).map(rowToAlerta);
}

export async function getAlertasNaoLidos(idUsuario: number) {
  const { count } = await sb().from("alertas").select("*", { count: "exact", head: true })
    .eq("id_usuario", idUsuario).eq("lido", false);
  return count ?? 0;
}

export async function marcarAlertaComoLido(id: number) {
  const { error } = await sb().from("alertas").update({ lido: true }).eq("id", id);
  if (error) throw error;
}

export async function marcarTodosAlertasComoLidos(idUsuario: number) {
  const { error } = await sb().from("alertas").update({ lido: true }).eq("id_usuario", idUsuario).eq("lido", false);
  if (error) throw error;
}

// ─── ALERTAS POR DISPOSITIVO ──────────────────────────────────────────────────

export async function getAlertasByDispositivo(idDispositivo: number, limit = 50) {
  const { data } = await sb().from("alertas").select("*")
    .eq("id_dispositivo", idDispositivo).order("criado_em", { ascending: false }).limit(limit);
  return (data ?? []).map(rowToAlerta);
}

export async function getAlertasNaoLidosByDispositivo(idDispositivo: number) {
  const { count } = await sb().from("alertas").select("*", { count: "exact", head: true })
    .eq("id_dispositivo", idDispositivo).eq("lido", false);
  return count ?? 0;
}

export async function marcarTodosAlertasComoLidosByDispositivo(idDispositivo: number) {
  const { error } = await sb().from("alertas").update({ lido: true }).eq("id_dispositivo", idDispositivo).eq("lido", false);
  if (error) throw error;
}

// ─── LIMITES DE SAÚDE (constantes de referência) ──────────────────────────────

export const LIMITES_SAUDE = {
  BPM_MIN: 50,       // Bradicardia
  BPM_MAX: 120,      // Taquicardia
  SPO2_MIN: 92,      // Hipóxia
  TEMP_MIN: 35.0,    // Hipotermia
  TEMP_MAX: 38.5,    // Febre
};

/**
 * Verifica os valores recebidos de uma leitura de sensor e cria alertas automaticamente
 * quando os valores ultrapassam os limites de segurança.
 */
export async function verificarLimitesSaude(params: {
  idUsuario?: number | null;
  idDispositivo: number;
  codigoSerial: string;
  frequenciaCardiaca?: number | null;
  oxigenacaoSpo2?: number | null;
  temperaturaCorporal?: number | null;
  quedaDetectada?: boolean;
}) {
  const alertas: InsertAlerta[] = [];

  // BPM Baixo (Bradicardia)
  if (params.frequenciaCardiaca != null && params.frequenciaCardiaca < LIMITES_SAUDE.BPM_MIN) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "BPM_BAIXO",
      severidade: params.frequenciaCardiaca < 40 ? "critico" : "alerta",
      titulo: `⚠️ Batimento cardíaco baixo: ${params.frequenciaCardiaca} BPM`,
      mensagem: `O colete ${params.codigoSerial} detectou frequência cardíaca de ${params.frequenciaCardiaca} BPM, abaixo do limite seguro de ${LIMITES_SAUDE.BPM_MIN} BPM. Possível bradicardia.`,
      valorDetectado: params.frequenciaCardiaca,
      limiteReferencia: LIMITES_SAUDE.BPM_MIN,
    });
  }

  // BPM Alto (Taquicardia)
  if (params.frequenciaCardiaca != null && params.frequenciaCardiaca > LIMITES_SAUDE.BPM_MAX) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "BPM_ALTO",
      severidade: params.frequenciaCardiaca > 150 ? "critico" : "alerta",
      titulo: `⚠️ Batimento cardíaco alto: ${params.frequenciaCardiaca} BPM`,
      mensagem: `O colete ${params.codigoSerial} detectou frequência cardíaca de ${params.frequenciaCardiaca} BPM, acima do limite seguro de ${LIMITES_SAUDE.BPM_MAX} BPM. Possível taquicardia.`,
      valorDetectado: params.frequenciaCardiaca,
      limiteReferencia: LIMITES_SAUDE.BPM_MAX,
    });
  }

  // SpO2 Baixo (Hipóxia)
  if (params.oxigenacaoSpo2 != null && params.oxigenacaoSpo2 < LIMITES_SAUDE.SPO2_MIN) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "SPO2_BAIXO",
      severidade: params.oxigenacaoSpo2 < 88 ? "critico" : "alerta",
      titulo: `🫁 Saturação de oxigênio baixa: ${params.oxigenacaoSpo2}%`,
      mensagem: `O colete ${params.codigoSerial} detectou SpO₂ de ${params.oxigenacaoSpo2}%, abaixo do limite seguro de ${LIMITES_SAUDE.SPO2_MIN}%. Risco de hipóxia.`,
      valorDetectado: params.oxigenacaoSpo2,
      limiteReferencia: LIMITES_SAUDE.SPO2_MIN,
    });
  }

  // Temperatura Alta (Febre)
  if (params.temperaturaCorporal != null && params.temperaturaCorporal > LIMITES_SAUDE.TEMP_MAX) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "TEMP_ALTA",
      severidade: params.temperaturaCorporal > 39.5 ? "critico" : "alerta",
      titulo: `🌡️ Temperatura alta: ${params.temperaturaCorporal}°C`,
      mensagem: `O colete ${params.codigoSerial} detectou temperatura de ${params.temperaturaCorporal}°C, acima do limite de ${LIMITES_SAUDE.TEMP_MAX}°C. Possível febre.`,
      valorDetectado: params.temperaturaCorporal,
      limiteReferencia: LIMITES_SAUDE.TEMP_MAX,
    });
  }

  // Temperatura Baixa (Hipotermia)
  if (params.temperaturaCorporal != null && params.temperaturaCorporal < LIMITES_SAUDE.TEMP_MIN) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "TEMP_BAIXA",
      severidade: params.temperaturaCorporal < 34.0 ? "critico" : "alerta",
      titulo: `🌡️ Temperatura baixa: ${params.temperaturaCorporal}°C`,
      mensagem: `O colete ${params.codigoSerial} detectou temperatura de ${params.temperaturaCorporal}°C, abaixo do limite de ${LIMITES_SAUDE.TEMP_MIN}°C. Risco de hipotermia.`,
      valorDetectado: params.temperaturaCorporal,
      limiteReferencia: LIMITES_SAUDE.TEMP_MIN,
    });
  }

  // Queda detectada
  if (params.quedaDetectada) {
    alertas.push({
      idUsuario: params.idUsuario,
      idDispositivo: params.idDispositivo,
      tipo: "QUEDA",
      severidade: "critico",
      titulo: `🚨 Queda detectada!`,
      mensagem: `O colete ${params.codigoSerial} detectou uma queda. Verifique imediatamente o usuário.`,
      valorDetectado: 1,
      limiteReferencia: 0,
    });
  }

  // Salvar todos os alertas gerados
  for (const alerta of alertas) {
    try {
      await createAlerta(alerta);
      console.log(`[ALERTA] ${alerta.tipo}: ${alerta.titulo}`);
    } catch (err) {
      console.error("[ALERTA] Erro ao criar alerta:", err);
    }
  }

  return alertas;
}
