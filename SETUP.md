# Sage Wearable — Guia de Setup e Deploy

## Variáveis de Ambiente Necessárias

| Variável | Descrição | Onde obter |
|---|---|---|
| `SUPABASE_URL` | URL do projeto Supabase | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase → Settings → API |
| `DATABASE_URL` | String de conexão MySQL/TiDB | Fornecido automaticamente pelo template |
| `JWT_SECRET` | Segredo para assinar tokens JWT | Fornecido automaticamente |

## Configurando o Banco de Dados Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Vá em **SQL Editor** e cole o conteúdo do arquivo `supabase_schema.sql`.
3. Execute o script — ele criará todas as tabelas, índices, triggers e dados de seed.
4. Copie a **URL** e a **anon key** em **Settings → API**.
5. Configure as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` no painel de Secrets do projeto.

## Estrutura do Banco de Dados

```
usuarios          — Usuários do sistema (cuidadores e pacientes)
cuidadores        — Contatos de emergência vinculados a usuários
dispositivos      — Coletes IoT cadastrados
pedidos           — Pedidos de compra de coletes
tickets           — Chamados de suporte
eventos_saude     — Log de eventos clínicos (quedas, alertas vitais)
leitura_sensores  — Telemetria em tempo real dos sensores
```

## Endpoint de Ingestão de Sensores

```
POST /api/trpc/sensores.ingest
Content-Type: application/json

{
  "idDispositivo": 1,
  "bpm": 72.5,
  "spo2": 98.1,
  "temperatura": 36.5,
  "quedaDetectada": false,
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

## Credenciais de Demonstração

| Tipo | E-mail | Senha |
|---|---|---|
| Usuário | joao@sage.com | 123456 |
| Admin | admin@sage.com | admin123 |

## Rotas da Aplicação

| Rota | Descrição |
|---|---|
| `/` | Landing Page |
| `/loja` | Loja e configurador de produto |
| `/auth` | Login e cadastro |
| `/dashboard` | Dashboard do cuidador |
| `/admin` | Painel administrativo |

## Deploy na Vercel

1. Faça o checkpoint do projeto (botão **Publish** no painel).
2. Exporte o código via **Code → Download ZIP** ou conecte ao GitHub.
3. Na Vercel, importe o repositório e configure as variáveis de ambiente.
4. O build command é `pnpm build` e o output directory é `dist`.

## Planos Disponíveis

| Plano | Preço | Colete | Cuidadores |
|---|---|---|---|
| **Básico** | R$ 149/mês | R$ 899 à vista | 2 |
| **Premium** | R$ 249/mês | Incluso | 5 |
| **HaaS** | R$ 349/mês | Sem custo inicial | Ilimitado |

## Tamanhos do Colete

| Tamanho | Circunferência Torácica |
|---|---|
| P | até 85 cm |
| M | 86 — 100 cm |
| G | 101 — 115 cm |
| GG | 116 — 130 cm |
