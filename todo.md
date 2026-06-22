# Sage Wearable - TODO

## Schema & Banco de Dados
- [x] Criar schema Drizzle com tabelas: usuarios, cuidadores, dispositivos, pedidos, tickets, eventos_saude, leitura_sensores
- [x] Aplicar migrations SQL via webdev_execute_sql
- [x] Inserir dados de seed para demonstração

## Variáveis de Ambiente
- [x] Configurar SUPABASE_URL
- [x] Configurar SUPABASE_ANON_KEY
- [x] Configurar DATABASE_URL (Supabase PostgreSQL)

## CSS Global & Assets
- [x] Configurar tema dark #0EA5E9 em index.css
- [x] Upload imagens do produto (hero_elderly, vest_product, sage_vest_*)
- [x] Configurar fontes Inter via Google Fonts

## Backend tRPC
- [x] Router de autenticação (login, logout, register, me)
- [x] Router de usuários (CRUD completo)
- [x] Router de cuidadores (CRUD por usuário)
- [x] Router de dispositivos (CRUD + status)
- [x] Router de pedidos (CRUD + status)
- [x] Router de tickets (CRUD + status)
- [x] Router de sensores (ingest POST, ultimas leituras GET)
- [x] Router de eventos_saude (listar por usuário)
- [x] Middleware de autenticação JWT
- [x] Middleware de role admin

## Landing Page
- [x] Navbar com scroll effect + botões Login/Cadastro
- [x] Seção Hero (headline, CTA, imagem hero_elderly)
- [x] Seção O Problema (stats animadas: 30%, 80%, Angústia)
- [x] Seção A Solução (vest_product, features list)
- [x] Seção Funcionalidades (4 cards: quedas, cardíaco, SpO2, temperatura)
- [x] Seção Como Funciona (3 steps: vestir, conectar, monitorar)
- [x] Seção Depoimentos (2 cards)
- [x] Seção FAQ (accordion)
- [x] Seção CTA Final
- [x] Footer com links e contato

## Loja
- [x] Seletor de cor com preview de imagem (Preto, Cinza, Azul, Branco)
- [x] Seletor de tamanho (P, M, G, GG)
- [x] Seletor de plano (Básico, Premium, HaaS)
- [x] Resumo de pedido dinâmico
- [x] Calculadora de frete por CEP
- [x] Abas de pagamento (Cartão, Pix, Boleto)
- [x] Botão finalizar compra (cria pedido no banco)

## Autenticação
- [x] Modal de Login (email + senha)
- [x] Modal de Cadastro multi-step (3 etapas)
  - [x] Step 1: dados pessoais (nome, email, senha, CPF, nascimento, telefone)
  - [x] Step 2: dados do cuidador (nome, telefone, email, parentesco)
  - [x] Step 3: ficha médica (tipo sanguíneo, condições, alergias, medicamentos)
- [x] Sessão JWT persistida via cookie
- [x] Controle de roles: user e admin
- [x] Redirecionamento pós-login (user → /dashboard, admin → /admin)

## Dashboard do Cuidador
- [x] Sidebar de navegação (Sinais Vitais, Dispositivos, Histórico, Eventos, Contatos, Perfil)
- [x] Cards de sinais vitais (BPM, SpO2, Temperatura, Quedas)
- [x] Seção de localização, bateria e último sinal
- [x] Tabela de dispositivos vinculados (bateria, status, firmware)
- [x] Histórico de saúde com gráficos SVG
- [x] Log de eventos com severidade
- [x] Gestão de contatos de emergência (CRUD)

## Painel Administrativo
- [x] Sidebar admin (Visão Geral, Usuários, Frota IoT, Pedidos, Suporte)
- [x] KPIs: total usuários, coletes online, MRR, tickets abertos
- [x] Tabela de usuários com busca e CRUD
- [x] Tabela de frota IoT (dispositivos + status + bateria)
- [x] Tabela de pedidos com status
- [x] Tabela de tickets com prioridade e status

## Testes
- [x] Testes vitest para routers principais (4 testes passando)
- [x] Verificar fluxo de login/cadastro
- [x] Verificar ingestão de sensores

## Banco de Dados Supabase
- [x] Arquivo supabase_schema.sql completo com todas as tabelas
- [x] Seed de dados de demonstração incluído
- [x] Documentação SETUP.md com instruções completas
