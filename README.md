# Prudência

> A modern web application for personal financial control with intuitive design and visual analytics.

**Status**: Active Development

---

## Implemented Features

- **Transaction Management** - Complete control of income and expenses
- **Visual Analytics** - Interactive charts to understand your spending
- **Responsive Design** - Mobile-first interface that works on any device
- **Modern UI** - Built with shadcn/ui and Tailwind CSS
- **Smart Categories** - Organize expenses by specific categories
- **Period Filters** - View data from last 7d, 30d, 3m or 1y
- **User Authentication** - Secure login system with Supabase
- **Cloud Sync** - Real-time data synchronization
- **Dashboard Insights** - Smart financial insights and month-over-month comparisons

## In Development

- **Dark Mode** - Theme switching capability
- **Export Functionality** - CSV/PDF export options
- **Budget Goals** - Set and track budget targets
- **Recurring Transactions** - Automated recurring payments

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** - Reactive and type-safe interface
- **Vite** - Ultra-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Recharts** - Charting library
- **Wouter** - Lightweight router
- **React Query** - Data fetching and state management

### Backend & Database
- **Supabase** - Complete backend-as-a-service
  - Authentication system
  - PostgreSQL database
  - Real-time data synchronization
  - Row Level Security (RLS)

### Tools
- **Lucide React** - Consistent icons
- **date-fns** - Date manipulation
- **Vaul** - Drawer/modal components

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/prudentium/prudencia.git
cd prudencia

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser
# Navigate to http://localhost:3000
```

## Cloud Deploy (Vercel + Supabase)

This project is configured for **frontend-only** deployment on Vercel (`vercel.json`) using Vite.

### 1) Get Supabase Credentials

In your Supabase dashboard, go to **Project Settings → API** and copy:

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 2) Configure Vercel Environment Variables

In your Vercel project (imported from GitHub), add these in **Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3) Build/Output Configuration for Vercel

- `buildCommand`: `npm run build:frontend`
- `outputDirectory`: `dist/public`

### 4) Minimum `transactions` table structure

Use this structure in Supabase for the app to work:

```sql
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  description text not null,
  category_id text not null,
  date timestamptz not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);
```

> Security: Do not use `service_role` in the frontend. Use only the `anon key` with RLS configured.

---

## Project Structure

```
prudencia/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components (Dashboard, Transactions, etc.)
│   │   ├── lib/          # Utilities, Supabase client, data stores
│   │   └── hooks/        # Custom React hooks
├── public/               # Static assets
├── shared/              # Shared types
├── vercel.json         # Vercel deployment configuration
└── package.json        # Dependencies and scripts
```

---

## Available Scripts

| Script | Description |
|--------|-----------|
| `npm run dev:client` | Start frontend development server |
| `npm run build:frontend` | Build for production |
| `npm run check` | TypeScript type checking |

---

## Development Status

- **Status**: Active development
- **Last updated**: February 19, 2026
- **Current focus**: UI refinement and code organization

---

## Developer Notes

This is a private project for personal organization and development. The code is versioned on GitHub for progress tracking and backup.

---

## Next Steps

- [ ] Finalize category structure
- [ ] Implement dark mode
- [ ] Add export CSV/PDF functionality
- [ ] Optimize mobile performance
- [ ] Add more data visualizations
- [ ] Implement budget goals
- [ ] Add recurring transactions

---

## License

MIT License - see the [LICENSE](LICENSE) file for details.