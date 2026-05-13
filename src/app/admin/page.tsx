import { redirect } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { ads, users, applications, inscriptions, type Ad, type Inscription } from "@/db/schema";
import {
  createAd,
  updateUserRole,
  deleteAd,
  toggleAd,
  updateAd,
  reviewApplication,
  deleteApplication,
  createInscription,
  toggleInscription,
  resetInscription,
  deleteInscription,
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

const APP_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

// Inline in JSX via statusColor local var

const ROLE_LABELS_APP: Record<string, string> = {
  crewmate: "Tripulante",
  impostor: "Impostor",
  both: "Ambos",
};

const HOW_FOUND_LABELS: Record<string, string> = {
  amigo: "Por um amigo",
  discord: "Servidor Discord",
  reddit: "Reddit / fórum",
  youtube: "YouTube / stream",
  site: "Google / site",
  outro: "Outro",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sec?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "super_admin")
  ) {
    redirect("/");
  }

  const { sec } = await searchParams;
  const activeSection =
    sec === "usuarios" || sec === "anuncios" || sec === "candidaturas" || sec === "inscricao"
      ? sec
      : "candidaturas";

  const isSuperAdmin = currentUser.role === "super_admin";

  const [allUsers, allAds, allApplications, allInscriptions] = await Promise.all([
    isSuperAdmin
      ? db.select().from(users).orderBy(asc(users.createdAt))
      : Promise.resolve([]),
    db.select().from(ads).orderBy(asc(ads.createdAt)),
    db.select().from(applications).orderBy(desc(applications.createdAt)),
    db.select().from(inscriptions).orderBy(desc(inscriptions.createdAt)),
  ]);

  // Join application user info
  const appUsersRaw = await db
    .select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl, discordId: users.discordId })
    .from(users);
  const userMap = Object.fromEntries(appUsersRaw.map((u) => [u.id, u]));
  const pendingCount = allApplications.filter((a) => a.status === "pending").length;

  function inscriptionStatus(insc: Inscription, now: Date): string {
    if (!insc.enabled) return "desabilitada";
    if (insc.startsAt && insc.startsAt > now) return "agendada";
    if (insc.expiresAt && insc.expiresAt <= now) return "encerrada";
    if (!insc.messageId) return "pendente";
    return "ativa";
  }

  function parseParticipants(raw: string): { discordId: string; displayName: string; joinedAt: string }[] {
    try { return JSON.parse(raw); } catch { return []; }
  }

  const now = new Date();
  const activeInscriptionCount = allInscriptions.filter((i) => {
    const s = inscriptionStatus(i, now);
    return s === "ativa" || s === "pendente";
  }).length;

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

  const btnSuccess: React.CSSProperties = {
    background: "rgba(0,229,199,0.15)",
    color: "var(--signal-300)",
    border: "1px solid var(--signal-700)",
    borderRadius: 4,
    padding: "6px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    cursor: "pointer",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--void-000)", color: "var(--hull-100)", fontFamily: "var(--font-mono)", display: "flex" }}>
      {/* ─── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{ width: 220, flexShrink: 0, background: "var(--void-050)", borderRight: "1px solid var(--void-300)", display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
        <div style={{ padding: "0 20px 28px" }}>
          <a href="/" style={{ display: "block", fontSize: 10, letterSpacing: ".12em", color: "var(--hull-400)", textDecoration: "none", marginBottom: 20, textTransform: "uppercase" }}>← Início</a>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--hull-100)", letterSpacing: ".02em" }}>
            PACKET<span style={{ color: "var(--signal-500)" }}>·</span>LOSS
          </div>
          <div style={{ fontSize: 10, color: "var(--hull-400)", marginTop: 2, letterSpacing: ".06em" }}>Painel de Admin</div>
        </div>
        <nav style={{ flex: 1 }}>
          {([
            { key: "candidaturas", label: "Candidaturas", badge: pendingCount > 0 ? pendingCount : null },
            ...(isSuperAdmin ? [{ key: "usuarios", label: "Usuários", badge: null as number | null }] : []),
            { key: "anuncios", label: "Anúncios", badge: allAds.length > 0 ? allAds.length : null },
            { key: "inscricao", label: "Inscrição", badge: activeInscriptionCount > 0 ? activeInscriptionCount : null },
          ] as { key: string; label: string; badge: number | null }[]).map(({ key, label, badge }) => (
            <a key={key} href={`/admin?sec=${key}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: activeSection === key ? "var(--signal-300)" : "var(--hull-300)", background: activeSection === key ? "rgba(0,229,199,0.07)" : "transparent", borderLeft: `2px solid ${activeSection === key ? "var(--signal-500)" : "transparent"}`, textDecoration: "none", transition: "color 0.15s" }}>
              {label}
              {badge !== null && (
                <span style={{ background: key === "candidaturas" ? "var(--crew-yellow)" : "var(--void-400)", color: key === "candidaturas" ? "var(--void-000)" : "var(--hull-200)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>
                  {badge}
                </span>
              )}
            </a>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--void-300)", marginTop: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>{ROLE_LABELS[currentUser.role]}</div>
          <div style={{ fontSize: 12, color: "var(--hull-200)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.username}</div>
          <form action="/auth/logout" method="POST">
            <button type="submit" style={{ ...btnSecondary, width: "100%", textAlign: "center", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>Sair</button>
          </form>
        </div>
      </aside>

      {/* ─── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>

        {/* ══ CANDIDATURAS ══════════════════════════════════════════════════════ */}
        {activeSection === "candidaturas" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--hull-100)", marginBottom: 4 }}>Candidaturas</h1>
              <p style={{ fontSize: 12, color: "var(--hull-400)" }}>{pendingCount} pendente{pendingCount !== 1 ? "s" : ""} · {allApplications.length} total</p>
            </div>
            {allApplications.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--hull-400)", fontSize: 13, background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8 }}>Nenhuma candidatura recebida ainda.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {allApplications.map((app) => {
                  const appUser = userMap[app.userId];
                  const statusColor = { pending: "var(--crew-yellow)", approved: "var(--signal-300)", rejected: "var(--impostor-300)" }[app.status] ?? "var(--hull-300)";
                  const borderColor = { pending: "var(--void-400)", approved: "var(--signal-700)", rejected: "var(--impostor-700)" }[app.status] ?? "var(--void-400)";
                  return (
                    <div key={app.id} style={{ background: "var(--void-100)", border: `1px solid ${borderColor}`, borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--void-300)", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--hull-100)" }}>{app.fullName}</div>
                          <div style={{ fontSize: 11, color: "var(--hull-400)", marginTop: 2 }}>{appUser?.username ?? `User #${app.userId}`} · {app.city}, {app.state}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: statusColor, background: `color-mix(in srgb, ${statusColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor} 35%, transparent)` }}>
                            {APP_STATUS_LABELS[app.status] ?? app.status}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--hull-400)" }}>{fmt(app.createdAt)}</span>
                        </div>
                      </div>
                      <details>
                        <summary style={{ padding: "10px 20px", cursor: "pointer", fontSize: 11, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", listStyle: "none", userSelect: "none" }}>Ver detalhes ▾</summary>
                        <div style={{ padding: "0 20px 20px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 16, marginTop: 12 }}>
                            {[
                              { label: "Data de nasc.", value: app.birthDate },
                              { label: "País", value: app.country },
                              { label: "Papel favorito", value: ROLE_LABELS_APP[app.favoriteRole] ?? app.favoriteRole },
                              { label: "Horas em Among Us", value: `${app.amogusHours}h` },
                              { label: "Disponibilidade", value: `${app.hoursPerWeek}h/sem` },
                              { label: "Como encontrou", value: HOW_FOUND_LABELS[app.howFound ?? ""] ?? app.howFound ?? "—" },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 13, color: "var(--hull-200)" }}>{value}</div>
                              </div>
                            ))}
                          </div>
                          {app.otherGames && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Outros jogos</div><p style={{ fontSize: 13, color: "var(--hull-200)", lineHeight: 1.65, margin: 0 }}>{app.otherGames}</p></div>}
                          <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Motivo</div><p style={{ fontSize: 13, color: "var(--hull-200)", lineHeight: 1.65, margin: 0 }}>{app.reason}</p></div>
                          {app.extraInfo && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Info adicional</div><p style={{ fontSize: 13, color: "var(--hull-200)", lineHeight: 1.65, margin: 0 }}>{app.extraInfo}</p></div>}

                          {app.status === "pending" && (
                            <div style={{ marginTop: 16, padding: 16, background: "var(--void-200)", borderRadius: 6, border: "1px solid var(--void-400)" }}>
                              <div style={{ fontSize: 11, color: "var(--hull-300)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Avaliar candidatura</div>
                              <div style={{ marginBottom: 12 }}>
                                <label style={labelStyle} htmlFor={`note-${app.id}`}>Nota de revisão (opcional)</label>
                                <input id={`note-${app.id}`} name="reviewNote" form={`review-approve-${app.id}`} placeholder="Feedback..." style={inputStyle} />
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <form id={`review-approve-${app.id}`} action={async (fd: FormData) => { "use server"; await reviewApplication(app.id, "approved", String(fd.get("reviewNote") ?? "")); }}>
                                  <button type="submit" style={btnSuccess}>✓ Aprovar</button>
                                </form>
                                <form action={async (fd: FormData) => { "use server"; await reviewApplication(app.id, "rejected", String(fd.get("reviewNote") ?? "")); }}>
                                  <input type="hidden" name="reviewNote" value="" />
                                  <button type="submit" style={btnDanger}>✕ Rejeitar</button>
                                </form>
                              </div>
                            </div>
                          )}
                          {app.status !== "pending" && app.reviewNote && (
                            <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--void-200)", borderRadius: 6, fontSize: 12, color: "var(--hull-300)", borderLeft: `3px solid ${statusColor}` }}>
                              <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4, color: "var(--hull-400)" }}>Nota da revisão</span>
                              {app.reviewNote}
                            </div>
                          )}
                          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                            <form action={async () => { "use server"; await deleteApplication(app.id); }}>
                              <button type="submit" style={{ ...btnDanger, background: "transparent", color: "var(--impostor-300)", border: "1px solid var(--impostor-700)", fontSize: 10 }}>Excluir candidatura</button>
                            </form>
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══ USUÁRIOS (super_admin only) ════════════════════════════════════════ */}
        {activeSection === "usuarios" && isSuperAdmin && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--hull-100)", marginBottom: 4 }}>Usuários</h1>
              <p style={{ fontSize: 12, color: "var(--hull-400)" }}>{allUsers.length} usuário{allUsers.length !== 1 ? "s" : ""} cadastrado{allUsers.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Usuário</th>
                    <th style={thStyle}>Discord ID</th>
                    <th style={thStyle}>E-mail</th>
                    <th style={thStyle}>Cargo</th>
                    <th style={thStyle}>Cadastro</th>
                    <th style={thStyle}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ ...tdStyle, color: "var(--hull-400)", fontSize: 11 }}>#{u.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{u.username}</td>
                      <td style={{ ...tdStyle, color: "var(--hull-400)", fontSize: 11 }}>{u.discordId}</td>
                      <td style={{ ...tdStyle, color: "var(--hull-300)", fontSize: 12 }}>{u.email ?? "—"}</td>
                      <td style={tdStyle}><span style={{ color: ROLE_COLORS[u.role], fontWeight: u.role !== "user" ? 700 : 400 }}>{ROLE_LABELS[u.role]}</span></td>
                      <td style={{ ...tdStyle, color: "var(--hull-400)", fontSize: 11 }}>{fmt(u.createdAt)}</td>
                      <td style={tdStyle}>
                        {u.id !== currentUser.id && u.role !== "super_admin" && (
                          <form action={async (fd: FormData) => { "use server"; const role = fd.get("role") as "user" | "admin"; await updateUserRole(u.id, role); }} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <select name="role" defaultValue={u.role} style={{ ...inputStyle, width: "auto", padding: "4px 8px" }}>
                              <option value="user">Usuário</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button type="submit" style={btnSecondary}>Salvar</button>
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

        {/* ══ ANÚNCIOS ═══════════════════════════════════════════════════════════ */}
        {activeSection === "anuncios" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--hull-100)", marginBottom: 4 }}>Anúncios do Bot</h1>
              <p style={{ fontSize: 12, color: "var(--hull-400)" }}>Mensagens automáticas enviadas pelo bot no Discord</p>
            </div>

            {/* Nova mensagem */}
            <div style={{ background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: "var(--hull-300)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>Nova mensagem</div>
              <form action={createAd}>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="title">Título (identificação interna)</label>
                  <input id="title" name="title" required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="message">Mensagem (conteúdo para o Discord)</label>
                  <textarea id="message" name="message" required style={textareaStyle} />
                </div>
                <ScheduleFields />
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="channelId">Canal do Discord (ID, opcional)</label>
                  <input id="channelId" name="channelId" placeholder="Padrão: ADVERTISEMENT_CHANNEL_ID" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="startsAt">Válido a partir de (opcional)</label>
                    <input id="startsAt" name="startsAt" type="datetime-local" style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="expiresAt">Expira em (opcional)</label>
                    <input id="expiresAt" name="expiresAt" type="datetime-local" style={inputStyle} />
                  </div>
                </div>
                <button type="submit" style={btnPrimary}>+ Adicionar mensagem</button>
              </form>
            </div>

            {/* Lista */}
            <div style={{ fontSize: 11, color: "var(--hull-400)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Mensagens cadastradas ({allAds.length})</div>
            <div style={{ background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8, overflow: "hidden" }}>
              {allAds.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--hull-400)", fontSize: 13 }}>Nenhuma mensagem cadastrada. Adicione a primeira acima.</div>
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
                            <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--hull-100)" }}>{ad.title}</summary>
                            <pre style={{ marginTop: 8, background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 4, fontSize: 12, whiteSpace: "pre-wrap", color: "var(--hull-200)", maxWidth: 400 }}>{ad.message}</pre>
                            <form action={async (fd: FormData) => { "use server"; await updateAd(ad.id, fd); }} style={{ marginTop: 16 }}>
                              <div style={fieldStyle}>
                                <label htmlFor={`t-${ad.id}`} style={labelStyle}>Título</label>
                                <input id={`t-${ad.id}`} name="title" defaultValue={ad.title} required style={inputStyle} />
                              </div>
                              <div style={fieldStyle}>
                                <label htmlFor={`m-${ad.id}`} style={labelStyle}>Mensagem</label>
                                <textarea id={`m-${ad.id}`} name="message" defaultValue={ad.message} required style={textareaStyle} />
                              </div>
                              <ScheduleFields defaultType={ad.scheduleType as import("./ScheduleFields").ScheduleType} defaultInterval={ad.scheduleInterval} defaultTime={ad.scheduleTime} defaultDates={ad.scheduleDates} />
                              <div style={fieldStyle}>
                                <label htmlFor={`ch-${ad.id}`} style={labelStyle}>Canal do Discord (ID, opcional)</label>
                                <input id={`ch-${ad.id}`} name="channelId" defaultValue={ad.channelId ?? ""} placeholder="Padrão: ADVERTISEMENT_CHANNEL_ID" style={inputStyle} />
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                                <div>
                                  <label htmlFor={`s-${ad.id}`} style={labelStyle}>Inicia</label>
                                  <input id={`s-${ad.id}`} name="startsAt" type="datetime-local" defaultValue={toInputDatetime(ad.startsAt)} style={inputStyle} />
                                </div>
                                <div>
                                  <label htmlFor={`e-${ad.id}`} style={labelStyle}>Expira</label>
                                  <input id={`e-${ad.id}`} name="expiresAt" type="datetime-local" defaultValue={toInputDatetime(ad.expiresAt)} style={inputStyle} />
                                </div>
                              </div>
                              <button type="submit" style={btnSecondary}>Salvar alterações</button>
                            </form>
                          </details>
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{fmtSchedule(ad)}</td>
                        <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>{fmt(ad.startsAt)}</td>
                        <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>{fmt(ad.expiresAt)}</td>
                        <td style={{ ...tdStyle, fontSize: 12, color: "var(--hull-300)" }}>{fmt(ad.lastPostedAt)}</td>
                        <td style={tdStyle}>
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", background: ad.enabled ? "rgba(0,229,199,0.12)" : "rgba(255,255,255,0.05)", color: ad.enabled ? "var(--signal-300)" : "var(--hull-400)", border: `1px solid ${ad.enabled ? "var(--signal-700)" : "var(--void-400)"}` }}>
                            {ad.enabled ? "Ativa" : "Pausada"}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <form action={async () => { "use server"; await toggleAd(ad.id, !ad.enabled); }}>
                              <button type="submit" style={btnSecondary}>{ad.enabled ? "Pausar" : "Ativar"}</button>
                            </form>
                            <form action={async () => { "use server"; await deleteAd(ad.id); }}>
                              <button type="submit" style={btnDanger}>Excluir</button>
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
        )}
        {/* ══ INSCRIÇÃO ══════════════════════════════════════════════════════════ */}
        {activeSection === "inscricao" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--hull-100)", marginBottom: 4 }}>Inscrição</h1>
              <p style={{ fontSize: 12, color: "var(--hull-400)" }}>Lista de inscrições gerenciadas pelo bot no Discord</p>
            </div>

            {/* Nova inscrição */}
            <div style={{ background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 12, color: "var(--hull-300)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 16 }}>Nova inscrição</div>
              <form action={createInscription}>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="insc-title">Título</label>
                  <input id="insc-title" name="title" required placeholder="Ex: Inscrição para o Torneio #5" style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="insc-desc">Descrição (opcional)</label>
                  <textarea id="insc-desc" name="description" style={textareaStyle} placeholder="Texto exibido na mensagem do Discord" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="insc-channel">Canal do Discord (ID)</label>
                    <input id="insc-channel" name="channelId" placeholder="Padrão: INSCRICAO_CHANNEL_ID" style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="insc-max">Máximo de participantes (opcional)</label>
                    <input id="insc-max" name="maxParticipants" type="number" min="1" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="insc-starts">Abertura (opcional)</label>
                    <input id="insc-starts" name="startsAt" type="datetime-local" style={inputStyle} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle} htmlFor="insc-expires">Encerramento (opcional)</label>
                    <input id="insc-expires" name="expiresAt" type="datetime-local" style={inputStyle} />
                  </div>
                </div>
                <button type="submit" style={btnPrimary}>+ Criar inscrição</button>
              </form>
            </div>

            {/* Lista */}
            <div style={{ fontSize: 11, color: "var(--hull-400)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>
              Inscrições cadastradas ({allInscriptions.length})
            </div>
            {allInscriptions.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--hull-400)", fontSize: 13, background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8 }}>Nenhuma inscrição criada ainda.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {allInscriptions.map((insc) => {
                  const status = inscriptionStatus(insc, now);
                  const participants = parseParticipants(insc.participants);
                  const statusColor = { ativa: "var(--signal-300)", pendente: "var(--crew-yellow)", agendada: "var(--hull-300)", encerrada: "var(--hull-400)", desabilitada: "var(--impostor-300)" }[status] ?? "var(--hull-300)";
                  const countStr = insc.maxParticipants ? `${participants.length}/${insc.maxParticipants}` : String(participants.length);
                  return (
                    <div key={insc.id} style={{ background: "var(--void-100)", border: "1px solid var(--void-300)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--hull-100)" }}>{insc.title}</div>
                          <div style={{ fontSize: 11, color: "var(--hull-400)", marginTop: 2 }}>
                            {participants.length > 0 ? `${countStr} participante${participants.length !== 1 ? "s" : ""}` : "Nenhum participante"}
                            {insc.expiresAt ? ` · Encerra ${fmt(insc.expiresAt)}` : ""}
                            {insc.messageId ? ` · msg: ${insc.messageId}` : ""}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: statusColor, background: `color-mix(in srgb, ${statusColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${statusColor} 35%, transparent)` }}>
                            {status}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <form action={async () => { "use server"; await toggleInscription(insc.id, !insc.enabled); }}>
                              <button type="submit" style={btnSecondary}>{insc.enabled ? "Pausar" : "Ativar"}</button>
                            </form>
                            <form action={async () => { "use server"; await resetInscription(insc.id); }}>
                              <button type="submit" style={btnSecondary} title="Limpa participantes e repostará a mensagem">Resetar</button>
                            </form>
                            <form action={async () => { "use server"; await deleteInscription(insc.id); }}>
                              <button type="submit" style={btnDanger}>Excluir</button>
                            </form>
                          </div>
                        </div>
                      </div>
                      {(insc.description || participants.length > 0) && (
                        <details>
                          <summary style={{ padding: "8px 20px", cursor: "pointer", fontSize: 11, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", listStyle: "none", userSelect: "none", borderTop: "1px solid var(--void-300)" }}>Ver detalhes ▾</summary>
                          <div style={{ padding: "12px 20px 20px" }}>
                            {insc.description && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Descrição</div>
                                <p style={{ fontSize: 13, color: "var(--hull-200)", margin: 0, lineHeight: 1.65 }}>{insc.description}</p>
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 10, color: "var(--hull-400)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Participantes ({countStr})</div>
                              {participants.length === 0 ? (
                                <p style={{ fontSize: 13, color: "var(--hull-400)", margin: 0, fontStyle: "italic" }}>Nenhum participante ainda.</p>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  {participants.map((p, i) => (
                                    <div key={p.discordId} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--hull-200)" }}>
                                      <span style={{ fontSize: 11, color: "var(--hull-400)", minWidth: 20, textAlign: "right" }}>{i + 1}.</span>
                                      <span style={{ fontWeight: 500 }}>{p.displayName}</span>
                                      <span style={{ fontSize: 11, color: "var(--hull-400)" }}>({p.discordId})</span>
                                      <span style={{ fontSize: 11, color: "var(--hull-400)", marginLeft: "auto" }}>{fmt(new Date(p.joinedAt))}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
