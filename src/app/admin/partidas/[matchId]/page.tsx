import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { inscriptions, lobbyResults, matches } from "@/db/schema";
import { submitLobbyScores } from "../../actions";

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

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "super_admin")
  ) {
    redirect("/");
  }

  const { matchId: matchIdStr } = await params;
  const matchId = Number(matchIdStr);

  const match = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId))
    .get();

  if (!match) redirect("/admin?sec=partidas");

  const inscription = match.inscriptionId
    ? await db
        .select()
        .from(inscriptions)
        .where(eq(inscriptions.id, match.inscriptionId))
        .get()
    : null;

  const results = await db
    .select()
    .from(lobbyResults)
    .where(eq(lobbyResults.matchId, matchId));

  type Participant = {
    discordId: string;
    displayName: string;
    joinedAt?: string;
  };
  type Lobby = { number: number; players: Participant[] };

  let lobbyList: Lobby[] = [];
  try {
    lobbyList = JSON.parse(match.lobbies);
  } catch {
    /* empty */
  }

  let suplentes: Participant[] = [];
  try {
    suplentes = JSON.parse(match.suplentes);
  } catch {
    /* empty */
  }

  const resultMap = Object.fromEntries(results.map((r) => [r.lobbyNumber, r]));

  type Score = {
    discordId: string;
    displayName: string;
    role: string;
    outcome: string;
    points: number;
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--void-200)",
    border: "1px solid var(--void-400)",
    borderRadius: 4,
    color: "var(--hull-100)",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "5px 8px",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    width: "100%",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--void-000)",
        color: "var(--hull-100)",
        fontFamily: "var(--font-mono)",
        padding: "0 0 80px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--void-300)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <a
          href="/admin?sec=partidas"
          style={{
            fontSize: 11,
            color: "var(--hull-400)",
            textDecoration: "none",
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}
        >
          ← Partidas
        </a>
        <span style={{ color: "var(--void-400)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--hull-200)" }}>
          {inscription?.rankedNumber != null
            ? (() => {
                const s = Math.ceil(inscription.rankedNumber! / 28);
                const m = ((inscription.rankedNumber! - 1) % 28) + 1;
                return `Rankeada #${m} Temporada: ${s}`;
              })()
            : `Partida #${matchId}`}
        </span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--hull-100)",
              marginBottom: 4,
            }}
          >
            {inscription?.rankedNumber != null
              ? (() => {
                  const s = Math.ceil(inscription.rankedNumber! / 28);
                  const m = ((inscription.rankedNumber! - 1) % 28) + 1;
                  return `Rankeada #${m} Temporada: ${s}`;
                })()
              : `Partida #${matchId}`}
          </h1>
          <p style={{ fontSize: 12, color: "var(--hull-400)" }}>
            {lobbyList.length} lobby{lobbyList.length !== 1 ? "s" : ""} ·{" "}
            {suplentes.length} suplente{suplentes.length !== 1 ? "s" : ""} ·
            Criado em {fmt(match.createdAt)}
          </p>
        </div>

        {/* Suplentes */}
        {suplentes.length > 0 && (
          <div
            style={{
              background: "var(--void-100)",
              border: "1px solid var(--void-300)",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--hull-400)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Suplentes ({suplentes.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
              {suplentes.map((p) => (
                <span
                  key={p.discordId}
                  style={{ fontSize: 13, color: "var(--hull-300)" }}
                >
                  {p.displayName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lobbies */}
        {lobbyList.map((lobby) => {
          const result = resultMap[lobby.number];
          const submitted = result?.status === "submitted";
          let existingScores: Score[] = [];
          try {
            existingScores = result ? JSON.parse(result.scores) : [];
          } catch {
            /* empty */
          }
          const scoreByDiscordId = Object.fromEntries(
            existingScores.map((s) => [s.discordId, s]),
          );

          return (
            <div
              key={lobby.number}
              style={{
                background: "var(--void-100)",
                border: `1px solid ${submitted ? "var(--signal-700)" : "var(--void-300)"}`,
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--void-300)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--hull-100)",
                  }}
                >
                  Lobby {lobby.number}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: "var(--hull-400)",
                      marginLeft: 10,
                    }}
                  >
                    {lobby.players.length} jogadores
                  </span>
                </div>
                {submitted && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      color: "var(--signal-300)",
                      background: "rgba(0,229,199,0.1)",
                      border: "1px solid var(--signal-700)",
                      borderRadius: 4,
                      padding: "3px 8px",
                    }}
                  >
                    Pontuado
                  </span>
                )}
              </div>

              <form
                action={async (formData: FormData) => {
                  "use server";
                  await submitLobbyScores(matchId, lobby.number, formData);
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "8px 20px",
                          textAlign: "left",
                          fontSize: 10,
                          color: "var(--hull-400)",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--void-300)",
                          fontWeight: 400,
                        }}
                      >
                        Jogador
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 10,
                          color: "var(--hull-400)",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--void-300)",
                          fontWeight: 400,
                          width: 140,
                        }}
                      >
                        Função
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 10,
                          color: "var(--hull-400)",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--void-300)",
                          fontWeight: 400,
                          width: 130,
                        }}
                      >
                        Resultado
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 10,
                          color: "var(--hull-400)",
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--void-300)",
                          fontWeight: 400,
                          width: 100,
                        }}
                      >
                        Pontos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lobby.players.map((player, idx) => {
                      const prev = scoreByDiscordId[player.discordId];
                      return (
                        <tr
                          key={player.discordId}
                          style={{
                            background:
                              idx % 2 === 0
                                ? "transparent"
                                : "rgba(255,255,255,0.02)",
                          }}
                        >
                          <td
                            style={{
                              padding: "10px 20px",
                              color: "var(--hull-200)",
                              borderBottom: "1px solid var(--void-200)",
                            }}
                          >
                            {player.displayName}
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid var(--void-200)",
                            }}
                          >
                            <select
                              name={`role_${player.discordId}`}
                              defaultValue={prev?.role ?? "crewmate"}
                              style={selectStyle}
                            >
                              <option value="crewmate">Tripulante</option>
                              <option value="impostor">Impostor</option>
                            </select>
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid var(--void-200)",
                            }}
                          >
                            <select
                              name={`outcome_${player.discordId}`}
                              defaultValue={prev?.outcome ?? "loss"}
                              style={selectStyle}
                            >
                              <option value="win">Vitória</option>
                              <option value="loss">Derrota</option>
                            </select>
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid var(--void-200)",
                            }}
                          >
                            <input
                              type="number"
                              name={`points_${player.discordId}`}
                              defaultValue={prev?.points ?? 0}
                              min="0"
                              style={{ ...inputStyle, width: 80 }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div
                  style={{
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      background: "var(--signal-500)",
                      color: "var(--void-000)",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 20px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {submitted ? "Atualizar Pontuação" : "Salvar Pontuação"}
                  </button>
                </div>
              </form>
            </div>
          );
        })}

        {lobbyList.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--hull-400)",
              fontSize: 13,
              background: "var(--void-100)",
              border: "1px solid var(--void-300)",
              borderRadius: 8,
            }}
          >
            Nenhum lobby nesta partida.
          </div>
        )}
      </div>
    </div>
  );
}
