import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { db } from "@/db";
import { inscriptions, type Inscription } from "@/db/schema";

function fmtBRT(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTimeBRT(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseParticipants(
  raw: string,
): { discordId: string; displayName: string; joinedAt: string }[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function inscriptionStatus(insc: Inscription, now: Date): string {
  if (!insc.enabled) return "desabilitada";
  if (insc.startsAt && insc.startsAt > now) return "agendada";
  if (insc.expiresAt && insc.expiresAt <= now) return "encerrada";
  if (!insc.messageId) return "pendente";
  return "ativa";
}

export const metadata = {
  title: "Rankeada — Packet Loss",
  description: "Calendário e inscrições da rankeada do Packet Loss.",
};

export default async function RankeadaPage() {
  const [user, allInscriptions] = await Promise.all([
    getCurrentUser(),
    db.select().from(inscriptions).orderBy(desc(inscriptions.createdAt)),
  ]);

  const now = new Date();

  const visible = allInscriptions.filter((i) => {
    const s = inscriptionStatus(i, now);
    return s !== "desabilitada";
  });

  const upcoming = visible.filter((i) => {
    const s = inscriptionStatus(i, now);
    return s === "agendada" || s === "ativa" || s === "pendente";
  });

  const past = visible.filter((i) => inscriptionStatus(i, now) === "encerrada");

  return (
    <>
      <SiteHeader user={user} active="Rankeada" />

      <main
        style={{
          minHeight: "100vh",
          paddingTop: "var(--header-h)",
          background: "var(--void-000)",
          color: "var(--hull-100)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          className="container"
          style={{ paddingTop: 48, paddingBottom: 64 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 700,
                color: "var(--hull-100)",
                marginBottom: 8,
              }}
            >
              RANKEADA
            </h1>
            <p style={{ fontSize: 13, color: "var(--hull-400)", margin: 0 }}>
              Calendário de partidas e lista de inscrições. Todos os horários em
              Brasília (BRT).
            </p>
          </div>

          {/* Upcoming */}
          <section style={{ marginBottom: 56 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--hull-400)",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: "1px solid var(--void-300)",
              }}
            >
              Próximas partidas ({upcoming.length})
            </div>

            {upcoming.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: "var(--hull-400)",
                  fontSize: 13,
                  background: "var(--void-100)",
                  border: "1px solid var(--void-300)",
                  borderRadius: 8,
                }}
              >
                Nenhuma partida agendada no momento.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {upcoming.map((insc) => {
                  const status = inscriptionStatus(insc, now);
                  const participants = parseParticipants(insc.participants);
                  const announcementOffset = insc.announcementHoursBefore ?? 2;
                  const announcementAt = insc.expiresAt
                    ? new Date(
                        insc.expiresAt.getTime() -
                          announcementOffset * 60 * 60 * 1000,
                      )
                    : null;

                  const statusColor =
                    {
                      ativa: "var(--signal-300)",
                      pendente: "var(--crew-yellow)",
                      agendada: "var(--hull-300)",
                    }[status] ?? "var(--hull-300)";

                  const countStr = insc.maxParticipants
                    ? `${participants.length}/${insc.maxParticipants}`
                    : String(participants.length);

                  return (
                    <div
                      key={insc.id}
                      style={{
                        background: "var(--void-100)",
                        border: "1px solid var(--void-300)",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      {/* Card header */}
                      <div
                        style={{
                          padding: "20px 24px 16px",
                          borderBottom: "1px solid var(--void-200)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            marginBottom: 14,
                          }}
                        >
                          <div>
                            <h2
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 18,
                                fontWeight: 700,
                                color: "var(--hull-100)",
                                margin: 0,
                                marginBottom: 4,
                              }}
                            >
                              {insc.title}
                            </h2>
                            {insc.description && (
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "var(--hull-300)",
                                  margin: 0,
                                }}
                              >
                                {insc.description}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: ".1em",
                              textTransform: "uppercase",
                              color: statusColor,
                              background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${statusColor} 35%, transparent)`,
                              flexShrink: 0,
                            }}
                          >
                            {status}
                          </span>
                        </div>

                        {/* Timeline */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: 12,
                          }}
                        >
                          {insc.startsAt && (
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--hull-400)",
                                  letterSpacing: ".06em",
                                  textTransform: "uppercase",
                                  marginBottom: 3,
                                }}
                              >
                                Inscrições abrem
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "var(--hull-100)",
                                  fontWeight: 600,
                                }}
                              >
                                {fmtBRT(insc.startsAt)}
                              </div>
                            </div>
                          )}
                          {insc.expiresAt && (
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--hull-400)",
                                  letterSpacing: ".06em",
                                  textTransform: "uppercase",
                                  marginBottom: 3,
                                }}
                              >
                                Partida começa
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "var(--signal-300)",
                                  fontWeight: 700,
                                }}
                              >
                                {fmtBRT(insc.expiresAt)}
                              </div>
                            </div>
                          )}
                          {announcementAt && (
                            <div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--hull-400)",
                                  letterSpacing: ".06em",
                                  textTransform: "uppercase",
                                  marginBottom: 3,
                                }}
                              >
                                Anúncio (Discord)
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "var(--crew-yellow)",
                                  fontWeight: 600,
                                }}
                              >
                                {fmtTimeBRT(announcementAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Participants */}
                      <div style={{ padding: "16px 24px 20px" }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--hull-400)",
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            marginBottom: 12,
                          }}
                        >
                          Inscritos — {countStr}
                        </div>

                        {participants.length === 0 ? (
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--hull-400)",
                              margin: 0,
                              fontStyle: "italic",
                            }}
                          >
                            Nenhum inscrito ainda.
                          </p>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(200px, 1fr))",
                              gap: 8,
                            }}
                          >
                            {participants.map((p, i) => (
                              <div
                                key={p.discordId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "6px 10px",
                                  background: "var(--void-200)",
                                  borderRadius: 4,
                                  border: "1px solid var(--void-300)",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "var(--hull-400)",
                                    minWidth: 18,
                                    textAlign: "right",
                                    flexShrink: 0,
                                  }}
                                >
                                  {i + 1}.
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: "var(--hull-100)",
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.displayName}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Past matches */}
          {past.length > 0 && (
            <section>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--hull-400)",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--void-300)",
                }}
              >
                Partidas encerradas ({past.length})
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {past.map((insc) => {
                  const participants = parseParticipants(insc.participants);
                  const countStr = insc.maxParticipants
                    ? `${participants.length}/${insc.maxParticipants}`
                    : String(participants.length);

                  return (
                    <div
                      key={insc.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        background: "var(--void-050)",
                        border: "1px solid var(--void-200)",
                        borderRadius: 6,
                        gap: 12,
                        flexWrap: "wrap",
                        opacity: 0.7,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--hull-200)",
                          }}
                        >
                          {insc.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--hull-400)",
                            marginTop: 2,
                          }}
                        >
                          {fmtBRT(insc.expiresAt)} · {countStr} inscrito
                          {participants.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          color: "var(--hull-400)",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--void-300)",
                        }}
                      >
                        encerrada
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
