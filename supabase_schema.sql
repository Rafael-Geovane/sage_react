-- ============================================================
-- SAGE WEARABLE — Schema Completo para Supabase (PostgreSQL)
-- Execute este arquivo INTEIRO no SQL Editor do Supabase
-- Versão: 2.0 — Sincronizado com Drizzle schema.ts
-- ============================================================

-- ============================================================
-- 0. EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABELA: users (autenticação interna do app)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  "openId"        VARCHAR(64) NOT NULL UNIQUE,
  name            TEXT,
  email           VARCHAR(320),
  "loginMethod"   VARCHAR(64),
  role            VARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nivel_acesso    VARCHAR(30) NOT NULL DEFAULT 'operador',
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABELA: usuarios (pacientes/clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id                    SERIAL PRIMARY KEY,
  nome                  VARCHAR(100) NOT NULL,
  cpf                   VARCHAR(14) UNIQUE,
  data_nascimento       VARCHAR(10),
  endereco              VARCHAR(255),
  telefone              VARCHAR(20),
  email                 VARCHAR(150) UNIQUE,
  senha_hash            VARCHAR(255),
  nome_plano            VARCHAR(30),
  notificar_push        BOOLEAN DEFAULT FALSE,
  notificar_sms         BOOLEAN DEFAULT FALSE,
  notificar_ligacao     BOOLEAN DEFAULT FALSE,
  id_admin_responsavel  INTEGER,
  tipo_sanguineo        VARCHAR(10),
  condicoes_medicas     VARCHAR(500),
  alergias              VARCHAR(500),
  medicamentos          VARCHAR(500),
  role                  VARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL DEFAULT 'user',
  status                VARCHAR(20) DEFAULT 'Ativo',
  criado_em             TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABELA: cuidadores
-- ============================================================
CREATE TABLE IF NOT EXISTS cuidadores (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL,
  telefone        VARCHAR(20) NOT NULL,
  email           VARCHAR(150),
  parentesco      VARCHAR(50),
  id_usuario      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABELA: dispositivos
-- ============================================================
CREATE TABLE IF NOT EXISTS dispositivos (
  id                  SERIAL PRIMARY KEY,
  codigo_serial       VARCHAR(50) NOT NULL UNIQUE,
  versao_firmware     VARCHAR(20),
  nivel_bateria       INTEGER,
  tipo_conexao        VARCHAR(20),
  status_conexao      VARCHAR(20),
  tempo_ultimo_sinal  VARCHAR(30),
  id_usuario          INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABELA: pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id                    SERIAL PRIMARY KEY,
  numero_pedido         VARCHAR(50) NOT NULL UNIQUE,
  valor                 VARCHAR(30),
  forma_pagamento       VARCHAR(30),
  status                VARCHAR(30),
  cor_colete            VARCHAR(30),
  tamanho_colete        VARCHAR(5),
  nome_plano            VARCHAR(30),
  id_usuario            INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_admin_responsavel  INTEGER,
  criado_em             TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TABELA: tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id                    SERIAL PRIMARY KEY,
  numero_ticket         VARCHAR(50) NOT NULL UNIQUE,
  assunto               VARCHAR(255),
  prioridade            VARCHAR(20),
  status                VARCHAR(30),
  id_usuario            INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_admin_responsavel  INTEGER,
  criado_em             TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TABELA: eventos_saude
-- ============================================================
CREATE TABLE IF NOT EXISTS eventos_saude (
  id                    SERIAL PRIMARY KEY,
  frequencia_cardiaca   INTEGER,
  oxigenacao_spo2       INTEGER,
  temperatura_corporal  NUMERIC(4,1),
  quedas_detectadas     INTEGER,
  localizacao_endereco  VARCHAR(255),
  categoria_evento      VARCHAR(50),
  descricao_evento      TEXT,
  id_usuario            INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_dispositivo        INTEGER REFERENCES dispositivos(id) ON DELETE SET NULL,
  data_hora_registro    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. TABELA: leitura_sensores (telemetria IoT completa)
-- ============================================================
CREATE TABLE IF NOT EXISTS leitura_sensores (
  id                    SERIAL PRIMARY KEY,
  id_dispositivo        INTEGER NOT NULL REFERENCES dispositivos(id) ON DELETE CASCADE,
  id_usuario            INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  payload               JSONB,
  frequencia_cardiaca   INTEGER,
  oxigenacao_spo2       INTEGER,
  temperatura_corporal  NUMERIC(4,1),
  acelerometro_x        NUMERIC(8,3),
  acelerometro_y        NUMERIC(8,3),
  acelerometro_z        NUMERIC(8,3),
  giroscopio_x          NUMERIC(8,3),
  giroscopio_y          NUMERIC(8,3),
  giroscopio_z          NUMERIC(8,3),
  latitude              NUMERIC(10,7),
  longitude             NUMERIC(10,7),
  nivel_bateria         INTEGER,
  queda_detectada       BOOLEAN DEFAULT FALSE,
  timestamp_sensor      TIMESTAMPTZ,
  recebido_em           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cuidadores_usuario     ON cuidadores(id_usuario);
CREATE INDEX IF NOT EXISTS idx_dispositivos_usuario    ON dispositivos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario         ON pedidos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_tickets_usuario         ON tickets(id_usuario);
CREATE INDEX IF NOT EXISTS idx_eventos_usuario         ON eventos_saude(id_usuario);
CREATE INDEX IF NOT EXISTS idx_eventos_dispositivo     ON eventos_saude(id_dispositivo);
CREATE INDEX IF NOT EXISTS idx_disp_recebido           ON leitura_sensores(id_dispositivo, recebido_em DESC);
CREATE INDEX IF NOT EXISTS idx_user_recebido           ON leitura_sensores(id_usuario, recebido_em DESC);
CREATE INDEX IF NOT EXISTS idx_users_openid            ON users("openId");

-- ============================================================
-- TRIGGER: atualizar atualizado_em automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users.updatedAt
CREATE OR REPLACE FUNCTION set_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated') THEN
    CREATE TRIGGER trg_users_updated
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_users_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispositivos_updated') THEN
    CREATE TRIGGER trg_dispositivos_updated
      BEFORE UPDATE ON dispositivos
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuidadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE leitura_sensores ENABLE ROW LEVEL SECURITY;

-- Policies: permitir acesso total via service_role (backend)
-- O backend usa a service_role key, então precisa de bypass completo

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on admins"
  ON admins FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on usuarios"
  ON usuarios FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on cuidadores"
  ON cuidadores FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on dispositivos"
  ON dispositivos FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on pedidos"
  ON pedidos FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on tickets"
  ON tickets FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on eventos_saude"
  ON eventos_saude FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on leitura_sensores"
  ON leitura_sensores FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SEED: Dados de demonstração
-- ============================================================

-- Admin padrão (senha: admin123 — bcrypt hash)
INSERT INTO admins (nome, email, senha_hash, nivel_acesso)
VALUES
  ('Admin Sage', 'admin@sage.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Usuários (senha_hash = bcrypt de '123456' para pacientes, 'admin123' para admin)
INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, nome_plano, tipo_sanguineo, role, status, condicoes_medicas, alergias, medicamentos)
VALUES
  ('João Silva',   'joao@sage.com',  '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FCtizCjoztsAFfzZTim6YxU2oBszJ5e', '123.456.789-00', '(11) 98765-4321', 'Premium', 'A+',  'user',  'Ativo',   'Hipertensão leve',   'Dipirona',          'Losartana 50mg'),
  ('Maria Costa',  'maria@sage.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FCtizCjoztsAFfzZTim6YxU2oBszJ5e', '987.654.321-00', '(11) 91234-5678', 'HaaS',    'O+',  'user',  'Ativo',   'Diabetes tipo 2',    'Penicilina',        'Metformina 850mg'),
  ('Pedro Lima',   'pedro@sage.com', '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FCtizCjoztsAFfzZTim6YxU2oBszJ5e', '456.789.123-00', '(11) 94567-8901', 'Básico',  'B-',  'user',  'Inativo', NULL,                 NULL,                NULL),
  ('Admin Sage',   'admin@sage.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL,              '(11) 99999-0000', 'Premium', NULL,  'admin', 'Ativo',   NULL,                 NULL,                NULL)
ON CONFLICT (email) DO NOTHING;

-- Cuidadores
INSERT INTO cuidadores (id_usuario, nome, telefone, email, parentesco)
VALUES
  (1, 'Ana Silva',    '(11) 98765-0001', 'ana@email.com',    'Filha'),
  (1, 'Carlos Silva', '(11) 98765-0002', 'carlos@email.com', 'Filho'),
  (2, 'Luiz Costa',   '(11) 91234-0001', 'luiz@email.com',   'Cônjuge')
ON CONFLICT DO NOTHING;

-- Dispositivos
INSERT INTO dispositivos (id_usuario, codigo_serial, versao_firmware, tipo_conexao, nivel_bateria, status_conexao, tempo_ultimo_sinal, atualizado_em)
VALUES
  (1, 'SGW-001', 'v2.1.3', '4G',   78, 'Online',     'Há 2 min',  NOW() - INTERVAL '2 minutes'),
  (2, 'SGW-002', 'v2.1.3', 'WiFi', 45, 'Online',     'Há 5 min',  NOW() - INTERVAL '5 minutes'),
  (3, 'SGW-003', 'v2.0.1', '4G',   12, 'Offline',    'Há 3 horas', NOW() - INTERVAL '3 hours'),
  (NULL, 'SGW-004', 'v2.1.3', '4G',100, 'Offline',    'Nunca',      NOW()),
  (NULL, 'SGW-005', 'v2.1.3', 'WiFi',100,'Offline',   'Nunca',      NOW())
ON CONFLICT (codigo_serial) DO NOTHING;

-- Pedidos
INSERT INTO pedidos (id_usuario, numero_pedido, nome_plano, cor_colete, tamanho_colete, forma_pagamento, valor, status)
VALUES
  (1, '#SG-001', 'Premium', 'azul',  'M',  'Cartão', 'R$ 249', 'Enviado'),
  (2, '#SG-002', 'HaaS',    'preto', 'G',  'Pix',    'R$ 349', 'Pend. Pagamento'),
  (3, '#SG-003', 'Básico',  'cinza', 'P',  'Boleto', 'R$ 149', 'Entregue')
ON CONFLICT (numero_pedido) DO NOTHING;

-- Tickets
INSERT INTO tickets (id_usuario, numero_ticket, assunto, prioridade, status)
VALUES
  (1, '#T-001', 'Colete não conecta ao app',  'Alta',  'Aguardando'),
  (2, '#T-002', 'Dúvida sobre plano HaaS',    'Baixa', 'Respondido'),
  (3, '#T-003', 'Alerta falso de queda',       'Média', 'Em Análise')
ON CONFLICT (numero_ticket) DO NOTHING;

-- Eventos de saúde
INSERT INTO eventos_saude (id_usuario, id_dispositivo, categoria_evento, descricao_evento, frequencia_cardiaca, oxigenacao_spo2, temperatura_corporal, quedas_detectadas, data_hora_registro)
VALUES
  (1, 1, 'Queda',       'Queda detectada no banheiro. Alerta enviado para cuidadores.',     NULL,  NULL, NULL,  1,    NOW() - INTERVAL '1 day 3 hours'),
  (1, 1, 'SpO2 Baixo',  'Saturação caiu para 93%. Retornou ao normal em 2 minutos.',         72,    93,  36.5,  0,    NOW() - INTERVAL '2 days 1 hour'),
  (1, 1, 'BPM Alto',    'Frequência cardíaca: 102 BPM por 5 minutos.',                       102,   97,  36.8,  0,    NOW() - INTERVAL '2 days 9 hours'),
  (2, 2, 'Bateria',     'Nível de bateria: 15%. Conecte o carregador.',                       68,    98,  36.2,  0,    NOW() - INTERVAL '3 days'),
  (1, 1, 'Conexão',     'Dispositivo SGW-001 reconectado à rede.',                            75,    98,  36.4,  0,    NOW() - INTERVAL '2 days 16 hours')
ON CONFLICT DO NOTHING;

-- Leituras de sensores (últimas 20 leituras do dispositivo 1 — usuário 1)
INSERT INTO leitura_sensores (
  id_dispositivo, id_usuario, frequencia_cardiaca, oxigenacao_spo2, temperatura_corporal,
  acelerometro_x, acelerometro_y, acelerometro_z,
  giroscopio_x, giroscopio_y, giroscopio_z,
  latitude, longitude, nivel_bateria, queda_detectada, recebido_em
)
SELECT
  1,                                                          -- id_dispositivo
  1,                                                          -- id_usuario
  (65 + random() * 20)::INTEGER,                              -- frequencia_cardiaca (65-85 BPM)
  (95 + random() * 4)::INTEGER,                               -- oxigenacao_spo2 (95-99%)
  (36.0 + random() * 1.5)::NUMERIC(4,1),                     -- temperatura_corporal
  (random() * 2 - 1)::NUMERIC(8,3),                           -- acelerometro_x
  (9.8 + random() * 0.2 - 0.1)::NUMERIC(8,3),                -- acelerometro_y (gravidade)
  (random() * 2 - 1)::NUMERIC(8,3),                           -- acelerometro_z
  (random() * 0.5 - 0.25)::NUMERIC(8,3),                      -- giroscopio_x
  (random() * 0.5 - 0.25)::NUMERIC(8,3),                      -- giroscopio_y
  (random() * 0.5 - 0.25)::NUMERIC(8,3),                      -- giroscopio_z
  (-23.5505 + (random() - 0.5) * 0.01)::NUMERIC(10,7),       -- latitude (São Paulo)
  (-46.6333 + (random() - 0.5) * 0.01)::NUMERIC(10,7),       -- longitude
  (78 - gs)::INTEGER,                                          -- nivel_bateria (decresce)
  FALSE,                                                       -- queda_detectada
  NOW() - (gs * INTERVAL '3 seconds')                          -- recebido_em
FROM generate_series(1, 20) AS gs;

-- Leituras de sensores — dispositivo 2 (usuário 2)
INSERT INTO leitura_sensores (
  id_dispositivo, id_usuario, frequencia_cardiaca, oxigenacao_spo2, temperatura_corporal,
  acelerometro_x, acelerometro_y, acelerometro_z,
  latitude, longitude, nivel_bateria, queda_detectada, recebido_em
)
SELECT
  2, 2,
  (60 + random() * 25)::INTEGER,
  (94 + random() * 5)::INTEGER,
  (35.8 + random() * 1.8)::NUMERIC(4,1),
  (random() * 2 - 1)::NUMERIC(8,3),
  (9.8 + random() * 0.2 - 0.1)::NUMERIC(8,3),
  (random() * 2 - 1)::NUMERIC(8,3),
  (-23.5610 + (random() - 0.5) * 0.01)::NUMERIC(10,7),
  (-46.6550 + (random() - 0.5) * 0.01)::NUMERIC(10,7),
  (45 - gs)::INTEGER,
  FALSE,
  NOW() - (gs * INTERVAL '5 seconds')
FROM generate_series(1, 10) AS gs;

-- ============================================================
-- FUNÇÕES AUXILIARES (usadas pelo backend)
-- ============================================================

-- Função para contar usuários ativos
CREATE OR REPLACE FUNCTION count_usuarios_ativos()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM usuarios WHERE status = 'Ativo';
$$ LANGUAGE sql STABLE;

-- Função para contar dispositivos online
CREATE OR REPLACE FUNCTION count_dispositivos_online()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM dispositivos WHERE status_conexao = 'Online';
$$ LANGUAGE sql STABLE;

-- Função para contar tickets abertos
CREATE OR REPLACE FUNCTION count_tickets_abertos()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM tickets WHERE status != 'Respondido';
$$ LANGUAGE sql STABLE;

-- ============================================================
-- VIEWS (opcionais — facilitam consultas no dashboard)
-- ============================================================

-- Última leitura de cada dispositivo
CREATE OR REPLACE VIEW v_ultima_leitura_dispositivo AS
SELECT DISTINCT ON (id_dispositivo)
  id,
  id_dispositivo,
  id_usuario,
  frequencia_cardiaca,
  oxigenacao_spo2,
  temperatura_corporal,
  acelerometro_x, acelerometro_y, acelerometro_z,
  giroscopio_x, giroscopio_y, giroscopio_z,
  latitude, longitude,
  nivel_bateria,
  queda_detectada,
  recebido_em
FROM leitura_sensores
ORDER BY id_dispositivo, recebido_em DESC;

-- Resumo de KPIs para painel admin
CREATE OR REPLACE VIEW v_admin_kpis AS
SELECT
  (SELECT COUNT(*) FROM usuarios)::INTEGER AS total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE status = 'Ativo')::INTEGER AS usuarios_ativos,
  (SELECT COUNT(*) FROM dispositivos WHERE status_conexao = 'Online')::INTEGER AS coletes_online,
  (SELECT COUNT(*) FROM tickets WHERE status != 'Respondido')::INTEGER AS tickets_abertos,
  (SELECT COUNT(*) FROM pedidos WHERE status = 'Pend. Pagamento')::INTEGER AS pedidos_pendentes;

-- ============================================================
-- FIM DO SCHEMA — Sage Wearable v2.0
-- ============================================================
