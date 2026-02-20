# Prudência

> Aplicativo web de controle financeiro pessoal com design minimalista, experiência mobile-first e sincronização em nuvem via Supabase.

**Status**: Em desenvolvimento ativo · **Versão**: 1.0.0 (Beta)

---

## Sobre o projeto

O **Prudência** é um app fintech pessoal para controle de gastos e receitas mensais. O foco é em uma UX limpa e fluida, especialmente no mobile, com paleta roxa, cards modernos e feedback visual inteligente.

---

## Funcionalidades implementadas

### Autenticação
- Cadastro e login com e-mail e senha via Supabase Auth
- Confirmação de e-mail obrigatória antes do acesso
- Validação de domínio de e-mail (apenas provedores pessoais: Gmail, Outlook, iCloud, Yahoo, etc.)
- Validação de senha: mínimo 6 caracteres, sem espaços
- Limpeza automática diária de contas não confirmadas após 24h (via `pg_cron`)

### Dashboard (Início)
- Saudação personalizada com nome e avatar do usuário (Dicebear como fallback)
- Card de saldo total com receitas e despesas do período
- **Insights Inteligentes**:
  - Comparação de gastos mês a mês (% de economia ou aumento)
  - Barra de progresso do **Limite de Gastos** com cores dinâmicas (roxo → laranja → vermelho)
  - Categoria com maior gasto no mês
- Lista das últimas 5 transações

### Transações
- Modal de nova transação (bottom drawer) com:
  - Seletor de tipo: Entrada / Saída
  - Campo de valor com máscara monetária brasileira (R$)
  - Grade de categorias com ícones coloridos
  - Seletor de data com calendário
  - Campo de descrição opcional
- Listagem completa de transações com filtro e exclusão
- Agrupamento por data com formatação relativa (Hoje, Ontem, etc.)

### Categorias
- Visualização de gastos por categoria com gráfico
- **Despesas**: Casa, Mercado, Transporte, Alimentação, Lazer, Saúde, Educação, Assinaturas, Manutenção, Outros
- **Receitas**: Salário, Freelance, Investimentos, Outros

### Limite de Gastos (Ajustes → Limite de Gastos)
- Tela dedicada com slider sincronizado e campo de valor editável
- Faixa: R$ 500 a R$ 20.000 (passo de R$ 50)
- Barra de progresso com cores dinâmicas:
  - **Roxo** — dentro do limite
  - **Laranja** — acima de 80%
  - **Vermelho** — limite ultrapassado
- Cards de resumo: gastos do mês, valor restante, % utilizado
- **Sugestão inteligente** baseada na média dos últimos 3 meses
- Botão circular de confirmação no header (ativo apenas quando o valor muda)
- Persistência no Supabase (`user_settings.monthly_budget`) com fallback em `localStorage`

### Ajustes (Settings)
- Perfil do usuário com avatar consistente entre telas
- Acesso ao Limite de Gastos com valor atual exibido
- Seções: Controle Financeiro, Preferências, Segurança & Dados
- Logout

### Navegação
- Bottom navigation bar com 4 abas: Início, Transações, Categorias, Ajustes
- Roteamento via Wouter (SPA, sem reload)

---

## Em desenvolvimento / Planejado

- **Modo escuro** — alternância de tema
- **Exportar CSV** — exportação de transações
- **Notificações** — alertas de limite e lembretes
- **Segurança (PIN)** — bloqueio por PIN
- **Transações recorrentes** — lançamentos automáticos
- **Edição de perfil** — foto e nome personalizados

---

## Stack tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Interface reativa |
| TypeScript | 5.6 | Tipagem estática |
| Vite | 7 | Build e dev server |
| Tailwind CSS | 4 | Estilização utilitária |
| shadcn/ui + Radix UI | — | Componentes acessíveis |
| Wouter | 3 | Roteamento SPA leve |
| TanStack Query | 5 | Gerenciamento de estado assíncrono |
| Vaul | 1 | Bottom drawer (modal de transação) |
| Lucide React | 0.545 | Ícones |
| date-fns | 3 | Manipulação de datas |
| Recharts | 2 | Gráficos de categorias |

### Backend & Banco de dados
| Tecnologia | Uso |
|---|---|
| Supabase Auth | Autenticação com e-mail/senha e confirmação |
| Supabase PostgreSQL | Banco de dados relacional com RLS |
| pg_cron | Limpeza agendada de contas não confirmadas |

---

## Estrutura do projeto

```
prudencia/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Auth.tsx              # Login e cadastro
│       │   ├── Dashboard.tsx         # Tela inicial com insights
│       │   ├── Transactions.tsx      # Lista de transações
│       │   ├── Categories.tsx        # Gastos por categoria
│       │   ├── Settings.tsx          # Ajustes do usuário
│       │   └── BudgetSettings.tsx    # Limite de gastos
│       ├── components/
│       │   ├── TransactionModal.tsx  # Modal de nova transação
│       │   ├── BottomNav.tsx         # Navegação inferior
│       │   └── ui/                  # Componentes shadcn/ui
│       ├── lib/
│       │   ├── supabase.ts           # Cliente Supabase
│       │   ├── transactionsStore.ts  # CRUD de transações
│       │   ├── budgetStore.ts        # Leitura/escrita do limite mensal
│       │   ├── mockData.ts           # Tipos, categorias e dados iniciais
│       │   └── utils.ts             # Helpers (formatCurrency, cn, etc.)
│       └── hooks/
│           └── use-toast.ts          # Hook de notificações toast
├── supabase/
│   └── transactions.sql              # Schema completo do banco + RLS + triggers
├── public/                           # Assets estáticos
├── vercel.json                       # Configuração de deploy (Vercel + Vite)
├── .env.example                      # Variáveis de ambiente necessárias
└── package.json
```

---

## Banco de dados (Supabase)

O schema completo está em `supabase/transactions.sql`. Execute-o no **SQL Editor** do Supabase para configurar o banco do zero.

### Tabelas

#### `public.profiles`
Criado automaticamente no cadastro via trigger.
```sql
id uuid primary key references auth.users(id) on delete cascade,
full_name text,
email text,
created_at timestamptz
```

#### `public.user_settings`
Configurações por usuário. Criado automaticamente no cadastro.
```sql
user_id uuid primary key references auth.users(id) on delete cascade,
monthly_budget numeric not null default 5000,  -- Limite de gastos
currency text not null default 'BRL',
created_at timestamptz
```

#### `public.transactions`
```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references auth.users(id) on delete cascade,
amount numeric not null,
description text not null,
category_id text not null,
date timestamptz not null,
type text not null check (type in ('income', 'expense')),
created_at timestamptz
```

### Segurança (RLS)
Todas as tabelas têm **Row Level Security** ativado. Cada usuário acessa apenas seus próprios dados. Nunca use a `service_role` key no frontend — use apenas a `anon key`.

### Trigger de auto-provisionamento
Ao criar uma conta, o trigger `on_auth_user_created` cria automaticamente um registro em `profiles` e `user_settings` para o novo usuário.

### Limpeza automática de contas não confirmadas
Uma função agendada via `pg_cron` remove diariamente (às 3h UTC) contas criadas há mais de 24h sem confirmação de e-mail.

---

## Configuração local

### 1. Clone e instale

```bash
git clone https://github.com/prudentium/prudencia.git
cd prudencia
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:

```bash
cp .env.example client/.env
```

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

> Encontre essas chaves em: **Supabase Dashboard → Project Settings → API**

### 3. Configure o banco de dados

No **SQL Editor** do Supabase, execute o conteúdo de `supabase/transactions.sql`.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev:client
# Acesse: http://localhost:5000
```

---

## Deploy (Vercel)

O projeto está configurado para deploy **frontend-only** no Vercel via `vercel.json`.

### Configurações do Vercel

| Campo | Valor |
|---|---|
| Framework | Vite |
| Build Command | `npm run build:frontend` |
| Output Directory | `dist/public` |
| Install Command | `npm install` |

### Variáveis de ambiente no Vercel

Adicione em **Project Settings → Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O `vercel.json` já inclui rewrite para SPA (`/* → /index.html`), então todas as rotas funcionam corretamente após o deploy.

---

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev:client` | Servidor de desenvolvimento frontend (porta 5000) |
| `npm run build:frontend` | Build de produção (Vite) |
| `npm run check` | Verificação de tipos TypeScript |

---

## Notas de desenvolvimento

- O app funciona **sem Supabase configurado**: cai automaticamente para dados locais (`localStorage`) com transações de exemplo.
- O orçamento mensal nunca armazena percentuais — apenas o valor absoluto em BRL.
- Domínios de e-mail aceitos no cadastro: `gmail.com`, `outlook.com`, `hotmail.com`, `live.com`, `icloud.com`, `me.com`, `yahoo.com`.

---

## Licença

MIT License — veja o arquivo [LICENSE](LICENSE) para detalhes.