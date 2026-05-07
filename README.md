# packetloss

Site do clã Packet Loss — Next.js com autenticação Discord OAuth2, painel de administração e API para o bot de anúncios.

## Arquitetura

- **Framework**: Next.js 16 (App Router)
- **Banco de dados**: SQLite via libSQL + Drizzle ORM
- **Autenticação**: Discord OAuth2 (sem bibliotecas externas de auth)
- **Sessões**: cookie `session_token` com hash SHA-256 armazenado no banco

## Configuração

### 1. Crie o aplicativo Discord

Acesse o [Discord Developer Portal](https://discord.com/developers/applications), crie um novo aplicativo e:

1. Vá em **OAuth2 → Redirects** e adicione a URL de callback:
   - Desenvolvimento: `http://localhost:3000/auth/discord/callback`
   - Produção: `https://packetloss.com.br/auth/discord/callback`
2. Copie o **Client ID** e o **Client Secret** da aba **OAuth2**.

> O mesmo aplicativo Discord é usado pelo bot packetads. O site usa as credenciais OAuth2 (Client ID/Secret) para login de usuários. O bot usa o token de bot (aba **Bot**) para se conectar ao Discord. São peças diferentes do mesmo app.

### 2. Gere o token da API do bot

```bash
openssl rand -hex 32
```

Guarde o valor — ele será configurado aqui como `PACKETADS_API_KEY` e no bot como `BOT_API_TOKEN`.

### 3. Crie o arquivo `.env`

```env
# Caminho do banco SQLite
DB_FILE_NAME=file:local.db

# Credenciais OAuth2 do aplicativo Discord (aba "OAuth2" no Developer Portal)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Opcional: sobrescreve a URL de callback detectada automaticamente
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# E-mail do super administrador — recebe role super_admin automaticamente no login
SUPER_ADMIN_EMAIL=lsbrum@icloud.com

# Token compartilhado com o bot packetads — mesmo valor que BOT_API_TOKEN no .env do bot
# Gere com: openssl rand -hex 32
PACKETADS_API_KEY=
```

| Variável | Onde encontrar |
|---|---|
| `DB_FILE_NAME` | Caminho local do arquivo SQLite (ex.: `file:local.db`) |
| `DISCORD_CLIENT_ID` | Developer Portal → aba **OAuth2** → Client ID |
| `DISCORD_CLIENT_SECRET` | Developer Portal → aba **OAuth2** → Client Secret |
| `DISCORD_REDIRECT_URI` | *(Opcional)* Sobrescreve a URL de callback auto-detectada |
| `SUPER_ADMIN_EMAIL` | E-mail Discord do super administrador — promovido automaticamente no login |
| `PACKETADS_API_KEY` | Você gera (`openssl rand -hex 32`) — mesmo valor que `BOT_API_TOKEN` no bot |

### 4. Instale as dependências e aplique o schema

```bash
pnpm install
pnpm push
```

## Rodando

```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

Abra `http://localhost:3000` e clique em **Entrar com Discord**.

## Painel de administração

Acesse `/admin` após fazer login com uma conta com role `admin` ou `super_admin`.

**Super administrador**: o usuário cujo e-mail Discord coincide com `SUPER_ADMIN_EMAIL` recebe o role `super_admin` automaticamente a cada login. Na primeira vez que alguém faz login (banco vazio), esse usuário também recebe `super_admin`.

| Role | Permissões |
|---|---|
| `user` | Acesso apenas ao site público |
| `admin` | Criar, editar, pausar e excluir mensagens do bot |
| `super_admin` | Tudo acima + gerenciar roles de outros usuários |

## API do bot

O bot packetads consome duas rotas autenticadas com o header `Authorization: Bearer <PACKETADS_API_KEY>`:

| Rota | Método | Descrição |
|---|---|---|
| `/api/packetads` | GET | Lista mensagens ativas dentro da janela de validade |
| `/api/packetads/:id/posted` | PATCH | Atualiza `lastPostedAt` após envio pelo bot |

## Fluxo de autenticação OAuth2

```
Usuário → GET /auth/discord
        → redireciona para Discord com state
        → Discord redireciona para /auth/discord/callback
        → troca code por access token
        → busca perfil do usuário (id, username, avatar, email)
        → cria/atualiza usuário no banco
        → cria sessão (cookie httpOnly, 30 dias)
        → redireciona para /
```

## Estrutura relevante

```
src/
  app/
    admin/
      page.tsx          # painel de administração
      actions.ts        # server actions (CRUD de mensagens, roles)
    api/packetads/
      route.ts          # GET — lista mensagens ativas
      [id]/posted/
        route.ts        # PATCH — marca mensagem como postada
    auth/
      discord/route.ts          # inicia OAuth
      discord/callback/route.ts # finaliza OAuth
      logout/route.ts           # encerra sessão
    page.tsx            # home pública
  db/
    schema.ts           # tabelas: users, sessions, ads
    index.ts            # instância do Drizzle
  lib/
    auth.ts             # createSession, getCurrentUser, clearSession
    discord.ts          # helpers da API do Discord
```
