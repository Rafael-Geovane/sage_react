import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  datetime,
  index,
} from "drizzle-orm/mysql-core";

// ─── USERS (auth) ────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── ADMINS ──────────────────────────────────────────────────────────────────
export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  nivelAcesso: varchar("nivel_acesso", { length: 30 }).notNull().default("operador"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

// ─── USUARIOS (pacientes) ─────────────────────────────────────────────────────
export const usuarios = mysqlTable("usuarios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).unique(),
  dataNascimento: varchar("data_nascimento", { length: 10 }),
  endereco: varchar("endereco", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 150 }).unique(),
  senhaHash: varchar("senha_hash", { length: 255 }),
  nomePlano: varchar("nome_plano", { length: 30 }),
  notificarPush: boolean("notificar_push").default(false),
  notificarSms: boolean("notificar_sms").default(false),
  notificarLigacao: boolean("notificar_ligacao").default(false),
  idAdminResponsavel: int("id_admin_responsavel"),
  tipoSanguineo: varchar("tipo_sanguineo", { length: 10 }),
  condicoesMedicas: varchar("condicoes_medicas", { length: 500 }),
  alergias: varchar("alergias", { length: 500 }),
  medicamentos: varchar("medicamentos", { length: 500 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  status: varchar("status", { length: 20 }).default("Ativo"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type InsertUsuario = typeof usuarios.$inferInsert;

// ─── CUIDADORES ───────────────────────────────────────────────────────────────
export const cuidadores = mysqlTable("cuidadores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  email: varchar("email", { length: 150 }),
  parentesco: varchar("parentesco", { length: 50 }),
  idUsuario: int("id_usuario").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export type Cuidador = typeof cuidadores.$inferSelect;
export type InsertCuidador = typeof cuidadores.$inferInsert;

// ─── DISPOSITIVOS ─────────────────────────────────────────────────────────────
export const dispositivos = mysqlTable("dispositivos", {
  id: int("id").autoincrement().primaryKey(),
  codigoSerial: varchar("codigo_serial", { length: 50 }).notNull().unique(),
  versaoFirmware: varchar("versao_firmware", { length: 20 }),
  nivelBateria: int("nivel_bateria"),
  tipoConexao: varchar("tipo_conexao", { length: 20 }),
  statusConexao: varchar("status_conexao", { length: 20 }),
  tempoUltimoSinal: varchar("tempo_ultimo_sinal", { length: 30 }),
  idUsuario: int("id_usuario"),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow(),
});

export type Dispositivo = typeof dispositivos.$inferSelect;
export type InsertDispositivo = typeof dispositivos.$inferInsert;

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────
export const pedidos = mysqlTable("pedidos", {
  id: int("id").autoincrement().primaryKey(),
  numeroPedido: varchar("numero_pedido", { length: 50 }).notNull().unique(),
  valor: varchar("valor", { length: 30 }),
  formaPagamento: varchar("forma_pagamento", { length: 30 }),
  status: varchar("status", { length: 30 }),
  corColete: varchar("cor_colete", { length: 30 }),
  tamanhoColete: varchar("tamanho_colete", { length: 5 }),
  nomePlano: varchar("nome_plano", { length: 30 }),
  idUsuario: int("id_usuario").notNull(),
  idAdminResponsavel: int("id_admin_responsavel"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  numeroTicket: varchar("numero_ticket", { length: 50 }).notNull().unique(),
  assunto: varchar("assunto", { length: 255 }),
  prioridade: varchar("prioridade", { length: 20 }),
  status: varchar("status", { length: 30 }),
  idUsuario: int("id_usuario").notNull(),
  idAdminResponsavel: int("id_admin_responsavel"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── EVENTOS_SAUDE ────────────────────────────────────────────────────────────
export const eventosSaude = mysqlTable("eventos_saude", {
  id: int("id").autoincrement().primaryKey(),
  frequenciaCardiaca: int("frequencia_cardiaca"),
  oxigenacaoSpo2: int("oxigenacao_spo2"),
  temperaturaCorporal: decimal("temperatura_corporal", { precision: 4, scale: 1 }),
  quedasDetectadas: int("quedas_detectadas"),
  localizacaoEndereco: varchar("localizacao_endereco", { length: 255 }),
  categoriaEvento: varchar("categoria_evento", { length: 50 }),
  descricaoEvento: text("descricao_evento"),
  idUsuario: int("id_usuario").notNull(),
  idDispositivo: int("id_dispositivo"),
  dataHoraRegistro: datetime("data_hora_registro").notNull(),
});

export type EventoSaude = typeof eventosSaude.$inferSelect;
export type InsertEventoSaude = typeof eventosSaude.$inferInsert;

// ─── LEITURA_SENSORES ─────────────────────────────────────────────────────────
export const leituraSensores = mysqlTable(
  "leitura_sensores",
  {
    id: int("id").autoincrement().primaryKey(),
    idDispositivo: int("id_dispositivo").notNull(),
    idUsuario: int("id_usuario"),
    payload: json("payload"),
    frequenciaCardiaca: int("frequencia_cardiaca"),
    oxigenacaoSpo2: int("oxigenacao_spo2"),
    temperaturaCorporal: decimal("temperatura_corporal", { precision: 4, scale: 1 }),
    acelerometroX: decimal("acelerometro_x", { precision: 8, scale: 3 }),
    acelerometroY: decimal("acelerometro_y", { precision: 8, scale: 3 }),
    acelerometroZ: decimal("acelerometro_z", { precision: 8, scale: 3 }),
    giroscopioX: decimal("giroscopio_x", { precision: 8, scale: 3 }),
    giroscopioY: decimal("giroscopio_y", { precision: 8, scale: 3 }),
    giroscopioZ: decimal("giroscopio_z", { precision: 8, scale: 3 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    nivelBateria: int("nivel_bateria"),
    quedaDetectada: boolean("queda_detectada").default(false),
    timestampSensor: datetime("timestamp_sensor"),
    recebidoEm: timestamp("recebido_em").defaultNow(),
  },
  (table) => ({
    idxDispRecebido: index("idx_disp_recebido").on(table.idDispositivo, table.recebidoEm),
    idxUserRecebido: index("idx_user_recebido").on(table.idUsuario, table.recebidoEm),
  })
);

export type LeituraSensor = typeof leituraSensores.$inferSelect;
export type InsertLeituraSensor = typeof leituraSensores.$inferInsert;
