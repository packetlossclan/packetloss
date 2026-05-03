Aplicativo Next.js com login/cadastro via Discord e persistência com Drizzle ORM (SQLite/libSQL).

## Arquitetura

- **Framework**: Next.js 16 (App Router)
- **Banco de dados**: SQLite via libSQL + Drizzle ORM
- **Autenticação**: Discord OAuth2 (sem bibliotecas externas de auth)
- **Sessões**: cookie `session_token` com hash SHA-256 armazenado no banco

### Fluxo de autenticação

```
Usuário → GET /auth/discord → Discord OAuth → GET /auth/discord/callback
→ upsert do usuário no banco → cria sessão → redireciona para /
```

### Rotas de autenticação

| Rota | Método | Descrição |
|---|---|---|
| `/auth/discord` | GET | Inicia o fluxo OAuth2 com o Discord |
| `/auth/discord/callback` | GET | Recebe o código do Discord, cria/atualiza usuário e cria sessão |
| `/auth/logout` | POST | Encerra a sessão e redireciona para `/` |

### Estrutura relevante

```
src/
  app/
    auth/
      discord/
        route.ts          # inicia OAuth
        callback/
          route.ts        # finaliza OAuth
      logout/
        route.ts          # encerra sessão
    page.tsx              # home: exibe usuário logado ou botão de login
  db/
    index.ts              # instância do Drizzle
    schema.ts             # tabelas: users, sessions
  lib/
    auth.ts               # createSession, getCurrentUser, clearSession
    discord.ts            # helpers da API do Discord
```

## Configuração

1. Crie um app OAuth2 no [Discord Developer Portal](https://discord.com/developers/applications).
2. Em **OAuth2 → Redirects**, adicione: `http://localhost:3000/auth/discord/callback`.
3. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

4. Preencha as variáveis:

| Variável | Descrição |
|---|---|
| `DB_FILE_NAME` | Caminho do banco SQLite (ex.: `file:./packetloss.db`) |
| `DISCORD_CLIENT_ID` | Client ID do app no Discord |
| `DISCORD_CLIENT_SECRET` | Client Secret do app no Discord |
| `DISCORD_REDIRECT_URI` | *(Opcional)* Sobrescreve a URL de callback auto-detectada |

5. Aplique o schema no banco:

```bash
pnpm push
```

## Rodando

```bash
pnpm dev
```

Abra `http://localhost:3000` e clique em "Entrar com Discord".

