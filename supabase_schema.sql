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
-- 10. TABELA: alertas (notificações de saúde geradas pelo sistema)
-- ============================================================
CREATE TABLE IF NOT EXISTS alertas (
  id                    SERIAL PRIMARY KEY,
  id_usuario            INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  id_dispositivo        INTEGER REFERENCES dispositivos(id) ON DELETE SET NULL,
  tipo                  VARCHAR(50) NOT NULL,        -- 'BPM_BAIXO', 'BPM_ALTO', 'SPO2_BAIXO', 'TEMP_ALTA', 'TEMP_BAIXA', 'QUEDA'
  severidade            VARCHAR(20) NOT NULL DEFAULT 'alerta', -- 'alerta', 'critico'
  titulo                VARCHAR(255) NOT NULL,
  mensagem              TEXT,
  valor_detectado       NUMERIC(8,2),
  limite_referencia     NUMERIC(8,2),
  lido                  BOOLEAN DEFAULT FALSE,
  criado_em             TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_alertas_usuario          ON alertas(id_usuario, criado_em DESC);

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
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Service role full access on alertas"
  ON alertas FOR ALL
  USING (true)
  WITH CHECK (true);

-- Permitir que o hardware (ESP) com a chave anônima (anon) faça apenas inserts
CREATE POLICY "Permitir inserts anonimos de sensores" 
  ON leitura_sensores FOR INSERT 
  TO anon
  WITH CHECK (true);

-- ============================================================
-- RPC: Inserir leitura via Código Serial (para o ESP32)
-- ============================================================
CREATE OR REPLACE FUNCTION inserir_leitura_via_serial(
  p_codigo_serial VARCHAR,
  p_frequencia_cardiaca INTEGER DEFAULT NULL,
  p_temperatura NUMERIC DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS json AS $$
DECLARE
  v_id_dispositivo INTEGER;
  v_id_usuario INTEGER;
BEGIN
  -- 1. Busca o ID do dispositivo e a qual usuário ele pertence no momento
  SELECT id, id_usuario INTO v_id_dispositivo, v_id_usuario
  FROM dispositivos
  WHERE codigo_serial = p_codigo_serial;

  -- 2. Se o dispositivo não existir, retorna erro
  IF v_id_dispositivo IS NULL THEN
    RAISE EXCEPTION 'Dispositivo com serial % não encontrado.', p_codigo_serial;
  END IF;

  -- 3. Insere a leitura na tabela
  INSERT INTO leitura_sensores (
    id_dispositivo, 
    id_usuario, 
    frequencia_cardiaca, 
    temperatura_corporal, 
    payload
  ) VALUES (
    v_id_dispositivo, 
    v_id_usuario, 
    p_frequencia_cardiaca, 
    p_temperatura, 
    p_payload
  );

  RETURN json_build_object('sucesso', true, 'id_dispositivo', v_id_dispositivo);
END;
$$ LANGUAGE plpgsql;

-- Permite que a chave pública (anon) chame essa função
GRANT EXECUTE ON FUNCTION inserir_leitura_via_serial TO anon;

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

-- Dispositivos (3 cenários de demonstração)
-- SGE-034 → João Silva  — Colete REAL (recebe dados do ESP32 de verdade)
-- SGE-020 → Maria Costa — Dados SIMULADOS normais (tudo saudável)
-- SGE-299 → Pedro Lima  — Dados SIMULADOS críticos (gera alertas)
INSERT INTO dispositivos (id_usuario, codigo_serial, versao_firmware, tipo_conexao, nivel_bateria, status_conexao, tempo_ultimo_sinal, atualizado_em)
VALUES
  (1, 'SGE-034', 'v2.1.3', '4G',   85, 'Online',     'Agora',       NOW()),
  (2, 'SGE-020', 'v2.1.3', 'WiFi', 92, 'Online',     'Há 1 min',   NOW() - INTERVAL '1 minute'),
  (3, 'SGE-299', 'v2.0.1', '4G',   15, 'Online',     'Há 30 seg',  NOW() - INTERVAL '30 seconds')
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
  -- João (SGE-034) — eventos reais virão do ESP
  (1, 1, 'Conexão',     'Dispositivo SGE-034 conectado à rede pela primeira vez.',              75,    98,  36.4,  0,    NOW() - INTERVAL '1 hour'),
  -- Maria (SGE-020) — eventos normais simulados
  (2, 2, 'Conexão',     'Dispositivo SGE-020 reconectado à rede.',                              72,    97,  36.6,  0,    NOW() - INTERVAL '2 hours'),
  (2, 2, 'Bateria',     'Nível de bateria: 15%. Conecte o carregador.',                          68,    98,  36.2,  0,    NOW() - INTERVAL '3 days'),
  -- Pedro (SGE-299) — eventos CRÍTICOS simulados para demonstrar alertas
  (3, 3, 'BPM Baixo',   'Frequência cardíaca caiu para 42 BPM. Bradicardia detectada!',         42,    88,  34.5,  0,    NOW() - INTERVAL '10 minutes'),
  (3, 3, 'SpO2 Baixo',  'Saturação caiu para 85%. Nível crítico de oxigenação!',                 45,    85,  34.8,  0,    NOW() - INTERVAL '8 minutes'),
  (3, 3, 'Queda',        'Queda detectada! Alerta enviado para cuidadores.',                     38,    87,  34.2,  1,    NOW() - INTERVAL '5 minutes'),
  (3, 3, 'Temp Baixa',   'Temperatura corporal caiu para 34.2°C. Risco de hipotermia!',         40,    86,  34.2,  0,    NOW() - INTERVAL '3 minutes')
ON CONFLICT DO NOTHING;

-- ============================================================
-- LEITURAS DE SENSORES — SGE-020 (Maria Costa · Dados NORMAIS)
-- Simula 20 leituras saudáveis ao longo da última hora
-- ============================================================
INSERT INTO leitura_sensores (
  id_dispositivo, id_usuario, frequencia_cardiaca, oxigenacao_spo2, temperatura_corporal,
  acelerometro_x, acelerometro_y, acelerometro_z,
  giroscopio_x, giroscopio_y, giroscopio_z,
  latitude, longitude, nivel_bateria, queda_detectada, recebido_em
)
SELECT
  2,                                                          -- id_dispositivo (SGE-020)
  2,                                                          -- id_usuario (Maria)
  (68 + random() * 12)::INTEGER,                              -- BPM normal: 68-80
  (96 + random() * 3)::INTEGER,                               -- SpO2 normal: 96-99%
  (36.2 + random() * 0.8)::NUMERIC(4,1),                     -- Temp normal: 36.2-37.0°C
  (random() * 0.4 - 0.2)::NUMERIC(8,3),                       -- acelerometro_x (pouco movimento)
  (9.8 + random() * 0.1 - 0.05)::NUMERIC(8,3),               -- acelerometro_y (gravidade)
  (random() * 0.4 - 0.2)::NUMERIC(8,3),                       -- acelerometro_z
  (random() * 0.1 - 0.05)::NUMERIC(8,3),                      -- giroscopio_x
  (random() * 0.1 - 0.05)::NUMERIC(8,3),                      -- giroscopio_y
  (random() * 0.1 - 0.05)::NUMERIC(8,3),                      -- giroscopio_z
  (-23.5505 + (random() - 0.5) * 0.001)::NUMERIC(10,7),      -- latitude (São Paulo)
  (-46.6333 + (random() - 0.5) * 0.001)::NUMERIC(10,7),      -- longitude
  (92 - gs / 3)::INTEGER,                                      -- bateria: 92% descendo devagar
  FALSE,                                                       -- sem quedas
  NOW() - (gs * INTERVAL '3 minutes')                          -- a cada 3 minutos na última hora
FROM generate_series(1, 20) AS gs;

-- ============================================================
-- LEITURAS DE SENSORES — SGE-299 (Pedro Lima · Dados CRÍTICOS)
-- Simula 20 leituras com valores PERIGOSOS para demonstrar alertas
-- ============================================================
INSERT INTO leitura_sensores (
  id_dispositivo, id_usuario, frequencia_cardiaca, oxigenacao_spo2, temperatura_corporal,
  acelerometro_x, acelerometro_y, acelerometro_z,
  giroscopio_x, giroscopio_y, giroscopio_z,
  latitude, longitude, nivel_bateria, queda_detectada, recebido_em
)
SELECT
  3,                                                          -- id_dispositivo (SGE-299)
  3,                                                          -- id_usuario (Pedro)
  (35 + random() * 15)::INTEGER,                              -- BPM BAIXO: 35-50 (bradicardia!)
  (82 + random() * 10)::INTEGER,                              -- SpO2 BAIXO: 82-92% (hipóxia!)
  (33.5 + random() * 1.5)::NUMERIC(4,1),                     -- Temp BAIXA: 33.5-35.0°C (hipotermia!)
  (random() * 6 - 3)::NUMERIC(8,3),                           -- acelerometro_x (movimento intenso = queda)
  (random() * 6 - 3)::NUMERIC(8,3),                           -- acelerometro_y (fora da gravidade)
  (random() * 6 - 3)::NUMERIC(8,3),                           -- acelerometro_z
  (random() * 3 - 1.5)::NUMERIC(8,3),                         -- giroscopio_x (muita rotação)
  (random() * 3 - 1.5)::NUMERIC(8,3),                         -- giroscopio_y
  (random() * 3 - 1.5)::NUMERIC(8,3),                         -- giroscopio_z
  (-23.5610 + (random() - 0.5) * 0.005)::NUMERIC(10,7),      -- latitude
  (-46.6550 + (random() - 0.5) * 0.005)::NUMERIC(10,7),      -- longitude
  (15 - gs / 2)::INTEGER,                                      -- bateria BAIXA: 15% descendo rápido
  CASE WHEN gs IN (3, 8, 15) THEN TRUE ELSE FALSE END,        -- 3 quedas detectadas nos registros 3, 8, 15
  NOW() - (gs * INTERVAL '2 minutes')                          -- a cada 2 minutos nos últimos 40 minutos
FROM generate_series(1, 20) AS gs;

-- ============================================================
-- ALERTAS SEED — SGE-299 (Pedro Lima · Alertas pré-gerados)
-- Demonstra o painel de alertas com dados reais
-- ============================================================
INSERT INTO alertas (id_usuario, id_dispositivo, tipo, severidade, titulo, mensagem, valor_detectado, limite_referencia, lido, criado_em)
VALUES
  (3, 3, 'BPM_BAIXO',  'critico', '⚠️ Batimento cardíaco baixo: 38 BPM',
   'O colete SGE-299 detectou frequência cardíaca de 38 BPM, abaixo do limite seguro de 50 BPM. Possível bradicardia.',
   38, 50, FALSE, NOW() - INTERVAL '10 minutes'),

  (3, 3, 'BPM_BAIXO',  'alerta',  '⚠️ Batimento cardíaco baixo: 45 BPM',
   'O colete SGE-299 detectou frequência cardíaca de 45 BPM, abaixo do limite seguro de 50 BPM. Possível bradicardia.',
   45, 50, FALSE, NOW() - INTERVAL '8 minutes'),

  (3, 3, 'SPO2_BAIXO', 'critico', '🫁 Saturação de oxigênio baixa: 85%',
   'O colete SGE-299 detectou SpO₂ de 85%, abaixo do limite seguro de 92%. Risco de hipóxia.',
   85, 92, FALSE, NOW() - INTERVAL '7 minutes'),

  (3, 3, 'SPO2_BAIXO', 'alerta',  '🫁 Saturação de oxigênio baixa: 89%',
   'O colete SGE-299 detectou SpO₂ de 89%, abaixo do limite seguro de 92%. Risco de hipóxia.',
   89, 92, FALSE, NOW() - INTERVAL '6 minutes'),

  (3, 3, 'TEMP_BAIXA', 'critico', '🌡️ Temperatura baixa: 33.8°C',
   'O colete SGE-299 detectou temperatura de 33.8°C, abaixo do limite de 35.0°C. Risco de hipotermia.',
   33.8, 35.0, FALSE, NOW() - INTERVAL '5 minutes'),

  (3, 3, 'QUEDA',      'critico', '🚨 Queda detectada!',
   'O colete SGE-299 detectou uma queda. Verifique imediatamente o usuário.',
   1, 0, FALSE, NOW() - INTERVAL '3 minutes'),

  (3, 3, 'BPM_BAIXO',  'critico', '⚠️ Batimento cardíaco baixo: 36 BPM',
   'O colete SGE-299 detectou frequência cardíaca de 36 BPM, abaixo do limite seguro de 50 BPM. Possível bradicardia.',
   36, 50, FALSE, NOW() - INTERVAL '1 minute')
ON CONFLICT DO NOTHING;

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
