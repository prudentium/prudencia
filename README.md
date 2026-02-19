# 💰 Prudência

> Aplicação web moderna para controle financeiro pessoal com design intuitivo e analytics visuais.

🚧 **Status**: Em Desenvolvimento Ativo

---

## ✅ Funcionalidades Implementadas

- 📊 **Gestão de Transações** - Controle completo de receitas e despesas
- 📈 **Analytics Visuais** - Gráficos interativos para entender seus gastos
- 📱 **Design Responsivo** - Interface mobile-first que funciona em qualquer dispositivo
- 🎨 **UI Moderna** - Construída com shadcn/ui e Tailwind CSS
- 💳 **Categorias Inteligentes** - Organize despesas por categorias específicas
- 📅 **Filtros por Período** - Visualize dados dos últimos 7d, 30d, 3m ou 1a

## 🚧 Em Desenvolvimento

- 🔐 **Autenticação de Usuário**
- ☁️ **Sincronização na Nuvem**
- 🌙 **Modo Escuro**
- 📤 **Funcionalidade de Exportação**
- 🎯 **Metas de Orçamento**
- 🔄 **Transações Recorrentes**

---

## 🛠 Stack Tecnológico

### Frontend
- **React 19** + **TypeScript** - Interface reativa e type-safe
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI de alta qualidade
- **Recharts** - Biblioteca de gráficos
- **Wouter** - Router leve e simples

### Backend
- **Express** + **TypeScript** - API robusta
- **Drizzle ORM** - ORM type-safe
- **PostgreSQL** - Banco de dados (configurável)

### Ferramentas
- **Lucide React** - Ícones consistentes
- **date-fns** - Manipulação de datas
- **Vaul** - Componentes de drawer/modal

---

## 🚀 Guia Rápido

```bash
# Clone o repositório
git clone https://github.com/prudentium/prudencia.git
cd prudencia

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev

# Abra seu navegador
# Navegue para http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
Prudencia/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes UI reutilizáveis
│   │   ├── pages/        # Componentes de página
│   │   ├── lib/          # Utilitários e dados mock
│   │   └── hooks/        # Hooks React customizados
├── server/               # Backend Express
│   ├── index.ts         # Arquivo principal do servidor
│   ├── routes/          # Rotas da API
│   └── static/          # Serviço de arquivos estáticos
├── shared/              # Tipos compartilhados
└── drizzle.config.ts    # Configuração do banco
```

---

## ⚡ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run check` | Verificação de tipos TypeScript |
| `npm run db:push` | Migrações do banco de dados |

---

## 📊 Status do Desenvolvimento

- 🚧 **Status**: Em desenvolvimento ativo
- 📝 **Última atualização**: 19/02/2026
- 🔄 **Foco atual**: Refinamento da UI e organização do código

---

## 📝 Notas do Desenvolvedor

Este é um projeto privado para organização e desenvolvimento pessoal. O código está sendo versionado no GitHub para acompanhamento do progresso e backup.

---

## 🎯 Próximos Passos

- [ ] Finalizar estrutura de categorias
- [ ] Implementar autenticação
- [ ] Configurar banco de dados persistente
- [ ] Adicionar mais visualizações de dados
- [ ] Otimizar performance mobile
- [ ] Implementar modo escuro
- [ ] Adicionar exportação CSV/PDF

---

## 📄 Licença

MIT License - consulte o arquivo [LICENSE](LICENSE) para detalhes.