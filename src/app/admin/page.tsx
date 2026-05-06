import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { ads, users } from "@/db/schema";
import {
  createAd,
  updateUserRole,
  deleteAd,
  toggleAd,
  updateAd,
} from "./actions";

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputDatetime(d: Date | null | undefined) {
  if (!d) return "";
  const iso = new Date(d).toISOString();
  return iso.slice(0, 16);
}

const ROLE_LABELS: Record<string, string> = {
  user: "Usuário",
  admin: "Admin",
  super_admin: "Super Admin",
};

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "super_admin")
  ) {
    redirect("/");
  }

  const [allUsers, allAds] = await Promise.all([
    db.select().from(users).orderBy(asc(users.createdAt)),
    db.select().from(ads).orderBy(asc(ads.createdAt)),
  ]);

  const isSuperAdmin = currentUser.role === "super_admin";

  const panelStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--void-000)",
    color: "var(--hull-100)",
    fontFamily: "var(--font-mono)",
    padding: "40px 24px",
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--void-100)",
    border: "1px solid var(--void-300)",
    borderRadius: 8,
    padding: 24,
    marginBottom: 32,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--signal-300)",
    marginBottom: 16,
    letterSpacing: ".04em",
    textTransform: "uppercase",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 12px",
    color: "var(--hull-300)",
    borderBottom: "1px solid var(--void-300)",
    fontWeight: 400,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    fontSize: 11,
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid var(--void-200)",
    verticalAlign: "middle",
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--void-200)",
    border: "1px solid var(--void-400)",
    borderRadius: 4,
    color: "var(--hull-100)",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "6px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 80,
    resize: "vertical",
  };

  const btnPrimary: React.CSSProperties = {
    background: "var(--signal-500)",
    color: "var(--void-000)",
    border: "none",
    borderRadius: 4,
    padding: "8px 16px",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    cursor: "pointer",
  };

  const btnDanger: React.CSSProperties = {
    background: "var(--impostor-500)",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "6px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    background: "var(--void-300)",
    color: "var(--hull-100)",
    border: "none",
    borderRadius: 4,
    padding: "6px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    cursor: "pointer",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    color: "var(--hull-300)",
    letterSpacing: ".06em",
    textTransform: "uppercase",
    marginBottom: 4,
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 14 };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
  };

  return (
    <div style={panelStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--signal-300)",
            marginBottom: 32,
            letterSpacing: ".06em",
          }}
        >
          Painel de Administração
        </h1>

        {/* ─── Users ─── */}
        {isSuperAdmin && (
          <div style={cardStyle}>
            <p style={titleStyle}>Usuários</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Usuário</th>
                  <th style={thStyle}>Discord ID</th>
                  <th style={thStyle}>Cargo</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={tdStyle}>{u.username}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: "var(--hull-300)",
                        fontSize: 11,
                      }}
                    >
                      {u.discordId}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color:
                            u.role === "super_admin"
                              ? "var(--signal-300)"
                              : u.role === "admin"
                                ? "var(--crew-yellow)"
                                : "var(--hull-300)",
                          fontWeight: u.role !== "user" ? 700 : 400,
                        }}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {u.id !== currentUser.id && u.role !== "super_admin" && (
                        <form
                          action={async (fd: FormData) => {
                            "use server";
                            const role = fd.get("role") as "user" | "admin";
                            await updateUserRole(u.id, role);
                          }}
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <select
                            name="role"
                            defaultValue={u.role}
                            style={{
                              ...inputStyle,
                              width: "auto",
                              padding: "4px 8px",
                            }}
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button type="submit" style={btnSecondary}>
                            Salvar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Create Ad ─── */}
        <div style={cardStyle}>
          <p style={titleStyle}>Nova Mensagem</p>
          <form action={createAd}>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="title">
                Título (identificação interna)
              </label>
              <input id="title" name="title" required style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="message">
                Mensagem (conteúdo para o Discord)
              </label>
              <textarea
                id="message"
                name="message"
                required
                style={textareaStyle}
              />
            </div>
            <div style={gridStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="intervalHours">
                  Periodicidade (horas)
                </label>
                <input
                  id="intervalHours"
                  name="intervalHours"
                  type="number"
                  min={1}
                  defaultValue={24}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="startsAt">
                  Válido a partir de (opcional)
                </label>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="expiresAt">
                  Expira em (opcional)
                </label>
                <input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" style={btnPrimary}>
              + Adicionar mensagem
            </button>
          </form>
        </div>

        {/* ─── Ads list ─── */}
        <div style={cardStyle}>
          <p style={titleStyle}>Mensagens ({allAds.length})</p>
          {allAds.length === 0 ? (
            <p style={{ color: "var(--hull-300)", fontSize: 13 }}>
              Nenhuma mensagem cadastrada.
            </p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Título</th>
                  <th style={thStyle}>Intervalo</th>
                  <th style={thStyle}>Inicia</th>
                  <th style={thStyle}>Expira</th>
                  <th style={thStyle}>Último envio</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {allAds.map((ad) => (
                  <tr key={ad.id}>
                    <td style={tdStyle}>
                      <details>
                        <summary style={{ cursor: "pointer" }}>
                          {ad.title}
                        </summary>
                        <pre
                          style={{
                            marginTop: 8,
                            background: "var(--void-050)",
                            padding: 10,
                            borderRadius: 4,
                            fontSize: 12,
                            whiteSpace: "pre-wrap",
                            color: "var(--hull-200)",
                            maxWidth: 420,
                          }}
                        >
                          {ad.message}
                        </pre>
                        {/* Edit form */}
                        <form
                          action={async (fd: FormData) => {
                            "use server";
                            await updateAd(ad.id, fd);
                          }}
                          style={{ marginTop: 12 }}
                        >
                          <div style={fieldStyle}>
                            <label
                              htmlFor={`edit-title-${ad.id}`}
                              style={labelStyle}
                            >
                              Título
                            </label>
                            <input
                              id={`edit-title-${ad.id}`}
                              name="title"
                              defaultValue={ad.title}
                              required
                              style={inputStyle}
                            />
                          </div>
                          <div style={fieldStyle}>
                            <label
                              htmlFor={`edit-message-${ad.id}`}
                              style={labelStyle}
                            >
                              Mensagem
                            </label>
                            <textarea
                              id={`edit-message-${ad.id}`}
                              name="message"
                              defaultValue={ad.message}
                              required
                              style={textareaStyle}
                            />
                          </div>
                          <div style={{ ...gridStyle, marginBottom: 12 }}>
                            <div>
                              <label
                                htmlFor={`edit-interval-${ad.id}`}
                                style={labelStyle}
                              >
                                Periodicidade (horas)
                              </label>
                              <input
                                id={`edit-interval-${ad.id}`}
                                name="intervalHours"
                                type="number"
                                min={1}
                                defaultValue={ad.intervalHours}
                                required
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`edit-starts-${ad.id}`}
                                style={labelStyle}
                              >
                                Inicia
                              </label>
                              <input
                                id={`edit-starts-${ad.id}`}
                                name="startsAt"
                                type="datetime-local"
                                defaultValue={toInputDatetime(ad.startsAt)}
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`edit-expires-${ad.id}`}
                                style={labelStyle}
                              >
                                Expira
                              </label>
                              <input
                                id={`edit-expires-${ad.id}`}
                                name="expiresAt"
                                type="datetime-local"
                                defaultValue={toInputDatetime(ad.expiresAt)}
                                style={inputStyle}
                              />
                            </div>
                          </div>
                          <button type="submit" style={btnSecondary}>
                            Salvar alterações
                          </button>
                        </form>
                      </details>
                    </td>
                    <td style={tdStyle}>{ad.intervalHours}h</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      {fmt(ad.startsAt)}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      {fmt(ad.expiresAt)}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      {fmt(ad.lastPostedAt)}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: ad.enabled
                            ? "var(--signal-500)"
                            : "var(--hull-400)",
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        {ad.enabled ? "Ativa" : "Pausada"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, display: "flex", gap: 6 }}>
                      <form
                        action={async () => {
                          "use server";
                          await toggleAd(ad.id, !ad.enabled);
                        }}
                      >
                        <button type="submit" style={btnSecondary}>
                          {ad.enabled ? "Pausar" : "Ativar"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await deleteAd(ad.id);
                        }}
                      >
                        <button type="submit" style={btnDanger}>
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
