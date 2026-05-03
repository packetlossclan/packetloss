<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Convenções do projeto

- **Gerenciador de pacotes**: pnpm
- **Linter/formatter**: Biome (`pnpm lint`, `pnpm format`)
- **Type check**: `pnpm check` (executa `tsc --noEmit`)

## Autenticação

- Fluxo: Discord OAuth2 → upsert em `users` → `sessions` com token hasheado (SHA-256)
- Cookie: `session_token` (httpOnly, sameSite=lax, 30 dias)
- CSRF no OAuth: cookie de estado efêmero (`discord_oauth_state`) validado no callback
- `getCurrentUser()` em Server Components para obter o usuário da sessão atual
- Logout via `POST /auth/logout` (método POST para evitar logout por requisição GET)

## Banco de dados

- SQLite local via `@libsql/client` + `drizzle-orm`
- Aplicar mudanças de schema: `pnpm push`
- Schema em `src/db/schema.ts` — tabelas: `users`, `sessions`
- Instância do Drizzle em `src/db/index.ts`

## Variáveis de ambiente obrigatórias

| Variável | Descrição |
|---|---|
| `DB_FILE_NAME` | ex.: `file:./packetloss.db` |
| `DISCORD_CLIENT_ID` | Client ID do Discord |
| `DISCORD_CLIENT_SECRET` | Client Secret do Discord |
| `DISCORD_REDIRECT_URI` | *(Opcional)* Sobrescreve callback auto-detectado |

