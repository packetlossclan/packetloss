import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { ads, users, type Ad } from "@/db/schema";
import {
  createAd,
  updateUserRole,
  deleteAd,
  toggleAd,
  updateAd,
} from "./actions";
import { ScheduleFields } from "./ScheduleFields";

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
  return new Date(d).toISOString().slice(0, 16);
}

const SCHEDULE_LABELS: Record<string, string> = {
  minutes: "min",
  hours: "h",
  days: "d",
  once: "Uma vez",
  daily_time: "Diário",
  specific_dates: "Datas",
};

function fmtSchedule(ad: Ad): string {
  const t = ad.scheduleType;
  if (t === "minutes" || t === "hours" || t === "days") {
    return `${ad.scheduleInterval ?? "?"}${SCHEDULE_LABELS[t]}`;
  }
  if (t === "once") return `Uma vez: ${ad.scheduleTime ?? "—"}`;
  if (t === "daily_time") return `Diário ${ad.scheduleTime ?? "—"}`;
  if (t === "specific_dates") {
    try {
      const arr: string[] = JSON.parse(ad.scheduleDates ?? "[]");
      return `${arr.length} data${arr.length !== 1 ? "s" : ""}`;
    } catch {
      return "Datas específicas";
    }
  }
  return "—";
}

const ROLE_LABELS: Record<string, string> = {
  user: "Usuário",
  admin: "Admin",
  super_admin: "Super Admin",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "var(--signal-300)",
  admin: "var(--crew-yellow)",
  user: "var(--hull-300)",
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

  // ─── Shared styles ────────────────────────────────────────────────────────

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

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 12px",
    color: "var(--hull-400)",
    borderBottom: "1px solid var(--void-300)",
    fontWeight: 400,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    fontSize: 10,
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderBottom: "1px solid var(--void-200)",
    verticalAlign: "middle",
    fontSize: 13,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--void-000)",
        color: "var(--hull-100)",
        fontFamily: "var(--font-mono)",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ─── Header ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <a
              href="/"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--hull-400)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              ← Início
            </a>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 700,
                color: "var(--hull-100)",
                letterSpacing: ".02em",
                lineHeight: 1,
              }}
            >
              Painel de Administração
            </h1>
          </div>
          <div
            style={{
              padding: "6px 14px",
              border: "1px solid var(--void-400)",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--hull-300)",
            }}
          >
            <span style={{ color: ROLE_COLORS[currentUser.role], fontWeight: 700 }}>
              {ROLE_LABELS[currentUser.role]}
            </span>
            {" · "}
            {currentUser.username}
          </div>
        </div>

        {/* ─── Seção: Usuários (super_admin only) ─── */}
        {isSuperAdmin && (
          <section style={{ marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 18,
                  background: "var(--signal-500)",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--hull-200)",
                }}
              >
                Usuários
              </h2>
            </div>

            <div
              style={{
                background: "var(--void-100)",
                border: "1px solid var(--void-300)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Usuário</th>
                    <th style={thStyle}>Discord ID</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Cargo</th>
                    <th style={thStyle}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ ...tdStyle, color: "var(--hull-400)", fontSize: 11 }}>
                        #{u.id}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{u.username}</td>
                      <td style={{ ...tdStyle, color: "var(--hull-400)", fontSize: 11 }}>
                        {u.discordId}
                      </td>
                      <td style={{ ...tdStyle, color: "var(--hull-300)", fontSize: 12 }}>
                        {u.email ?? "—"}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            color: ROLE_COLORS[u.role],
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
                            style={{ display: "flex", gap: 8, alignItems: "center" }}
                          >
                            <select
                              name="role"
                              defaultValue={u.role}
                              style={{ ...inputStyle, width: "auto", padding: "4px 8px" }}
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
          </section>
        )}

        {/* ─── Seção: Nova Mensagem ─── */}
        <section style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 3,
                height: 18,
                background: "var(--signal-500)",
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "var(--hull-200)",
              }}
            >
              Nova Mensagem
            </h2>
          </div>

          <div
            style={{
              background: "var(--void-100)",
              border: "1px solid var(--void-300)",
              borderRadius: 8,
              padding: 24,
            }}
          >
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
                <textarea id="message" name="message" required style={textareaStyle} />
              </div>
              <ScheduleFields />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
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
        </section>

        {/* ─── Seção: Mensagens Cadastradas ─── */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 3,
                height: 18,
                background: "var(--signal-500)",
                borderRadius: 2,
                display: "inline-block",
              }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                color: "var(--hull-200)",
              }}
            >
              Mensagens ({allAds.length})
            </h2>
          </div>

          <div
            style={{
              background: "var(--void-100)",
              border: "1px solid var(--void-300)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {allAds.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--hull-400)",
                  fontSize: 13,
                }}
              >
                Nenhuma mensagem cadastrada. Adicione a primeira acima.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Título / Mensagem</th>
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
                      <td style={{ ...tdStyle, maxWidth: 320 }}>
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              fontWeight: 600,
                              color: "var(--hull-100)",
                            }}
                          >
                            {ad.title}
                          </summary>
                          <pre
                            style={{
                              marginTop: 8,
                              background: "rgba(0,0,0,0.3)",
                              padding: 10,
                              borderRadius: 4,
                              fontSize: 12,
                              whiteSpace: "pre-wrap",
                              color: "var(--hull-200)",
                              maxWidth: 400,
                            }}
                          >
                            {ad.message}
                          </pre>
                          {/* Formulário de edição */}
                          <form
                            action={async (fd: FormData) => {
                              "use server";
                              await updateAd(ad.id, fd);
                            }}
                            style={{ marginTop: 16 }}
                          >
                            <div style={fieldStyle}>
                              <label htmlFor={`t-${ad.id}`} style={labelStyle}>
                                Título
                              </label>
                              <input
                                id={`t-${ad.id}`}
                                name="title"
                                defaultValue={ad.title}
                                required
                                style={inputStyle}
                              />
                            </div>
                            <div style={fieldStyle}>
                              <label htmlFor={`m-${ad.id}`} style={labelStyle}>
                                Mensagem
                              </label>
                              <textarea
                                id={`m-${ad.id}`}
                                name="message"
                                defaultValue={ad.message}
                                required
                                style={textareaStyle}
                              />
                            </div>
                            <ScheduleFields
                              defaultType={ad.scheduleType as import("./ScheduleFields").ScheduleType}
                              defaultInterval={ad.scheduleInterval}
                              defaultTime={ad.scheduleTime}
                              defaultDates={ad.scheduleDates}
                            />
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                marginBottom: 12,
                              }}
                            >
                              <div>
                                <label htmlFor={`s-${ad.id}`} style={labelStyle}>
                                  Inicia
                                </label>
                                <input
                                  id={`s-${ad.id}`}
                                  name="startsAt"
                                  type="datetime-local"
                                  defaultValue={toInputDatetime(ad.startsAt)}
                                  style={inputStyle}
                                />
                              </div>
                              <div>
                                <label htmlFor={`e-${ad.id}`} style={labelStyle}>
                                  Expira
                                </label>
                                <input
                                  id={`e-${ad.id}`}
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
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {fmtSchedule(ad)}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>
                        {fmt(ad.startsAt)}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>
                        {fmt(ad.expiresAt)}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>
                        {fmt(ad.lastPostedAt)}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            background: ad.enabled
                              ? "rgba(0,229,199,0.12)"
                              : "rgba(255,255,255,0.05)",
                            color: ad.enabled ? "var(--signal-400)" : "var(--hull-400)",
                            border: `1px solid ${ad.enabled ? "var(--signal-700)" : "var(--void-400)"}`,
                          }}
                        >
                          {ad.enabled ? "Ativa" : "Pausada"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
