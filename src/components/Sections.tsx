"use client";

import { useState, useEffect, useRef } from "react";
import { Crewmate, CrewChip } from "@/components/Crewmate";

// ── Stats Bar ─────────────────────────────────────────────────────────────────

interface StatsBarProps {
  accent?: string;
}

export function StatsBar({ accent }: StatsBarProps) {
  const ac = accent ?? "var(--signal-500)";
  const items = [
    { label: "Partidas Disputadas", value: "4.827" },
    { label: "Vitórias", value: "3.194", accent: true },
    { label: "Impostores Caçados", value: "1.856", impostor: true },
    { label: "Campeonatos", value: "12", suffix: "×" },
  ];

  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        zIndex: 2,
        borderTop: "1px solid var(--void-300)",
        borderBottom: "1px solid var(--void-300)",
        background: "rgba(15,18,32,0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          padding: "40px 0",
        }}
      >
        {items.map((it, i) => (
          <div
            key={it.label}
            style={{
              padding: "0 32px",
              borderRight:
                i < items.length - 1 ? "1px solid var(--void-300)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px,4vw,56px)",
                color: it.impostor ? "var(--impostor-300)" : ac,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              {it.value}
              {it.suffix && (
                <span style={{ fontSize: ".5em", marginLeft: 4 }}>
                  {it.suffix}
                </span>
              )}
            </span>
            <span
              className="mono"
              style={{
                color: "var(--hull-300)",
                textTransform: "uppercase",
                fontSize: 10,
                letterSpacing: ".2em",
              }}
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Home Features ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    no: "01",
    title: "Estratégia obsessiva",
    body: "Cada partida é debriefada. VODs, mapas de calor, anotações sobre comportamento. Treinamos como esports porque somos esports.",
  },
  {
    no: "02",
    title: "Roster transparente",
    body: "Estatísticas individuais públicas: winrate, accuracy de impostor, kills, partidas. Sem filtro, sem maquiagem.",
  },
  {
    no: "03",
    title: "Eventos semanais",
    body: "Scrims, ranked nights, torneios convidados. Calendário aberto e atualizado — sem partidas fantasma.",
  },
  {
    no: "04",
    title: "Recrutamento real",
    body: "Tryout estruturado em 3 fases. Não passa quem fala alto, passa quem entrega. Aplicações abertas.",
  },
];

interface HomeFeaturesProps {
  accent?: string;
}

export function HomeFeatures({ accent }: HomeFeaturesProps) {
  const ac = accent ?? "var(--signal-500)";
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="section" id="sobre">
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: 48,
            marginBottom: 56,
            alignItems: "end",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 12, color: ac }}>
              · O CLÃ
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px,4vw,56px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Quatro pilares.
              <br />
              Zero atalhos.
            </h2>
          </div>
          <p className="body-lg">
            Packet Loss não foi construído pra ser fofo. Foi construído pra
            ganhar. Tudo que fazemos vem desses quatro princípios — e a gente
            cobra isso de cada membro, todo dia.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 16,
          }}
        >
          {FEATURES.map((f, i) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: visual-only hover card
            <div
              key={f.no}
              className="pk-hover-card"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 36,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                minHeight: 240,
                cursor: "pointer",
                background: "var(--bg-card)",
                border: `1px solid ${hovered === i ? ac : "var(--void-300)"}`,
                borderRadius: "var(--r-lg)",
                backdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden",
                transform: hovered === i ? "translateY(-4px)" : "translateY(0)",
                transition: "transform .2s, border-color .2s, box-shadow .2s",
                boxShadow:
                  hovered === i
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${ac}22`
                    : "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: `linear-gradient(90deg,transparent,${ac} 50%,transparent)`,
                  opacity: hovered === i ? 0.7 : 0.3,
                  transition: "opacity .2s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  width: 12,
                  height: 12,
                  borderTop: `2px solid ${ac}`,
                  borderLeft: `2px solid ${ac}`,
                  opacity: hovered === i ? 0.8 : 0.4,
                  transition: "opacity .2s",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  width: 12,
                  height: 12,
                  borderBottom: `2px solid ${ac}`,
                  borderRight: `2px solid ${ac}`,
                  opacity: hovered === i ? 0.8 : 0.4,
                  transition: "opacity .2s",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  className="mono"
                  style={{ color: ac, fontSize: 11, letterSpacing: ".2em" }}
                >
                  / {f.no}
                </span>
                <span
                  style={{
                    color: hovered === i ? ac : "var(--hull-400)",
                    fontSize: 16,
                    transition: "transform .2s, color .2s",
                    transform: hovered === i ? "translateX(4px)" : "none",
                  }}
                >
                  →
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  color: "var(--hull-100)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  color: "var(--hull-300)",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Eventos ───────────────────────────────────────────────────────────────────

const EVENTS = [
  {
    date: "12 MAI",
    time: "21:00",
    title: "Ranked Night #47",
    type: "Interno",
    status: "confirmado",
  },
  {
    date: "17 MAI",
    time: "20:00",
    title: "Scrim vs. CHAOS.INC",
    type: "Scrim",
    status: "confirmado",
  },
  {
    date: "24 MAI",
    time: "19:00",
    title: "Torneio Fungle Open",
    type: "Torneio",
    status: "aberto",
  },
  {
    date: "31 MAI",
    time: "21:30",
    title: "Ranked Night #48",
    type: "Interno",
    status: "confirmado",
  },
  {
    date: "07 JUN",
    time: "20:00",
    title: "Tryout — Fase 1",
    type: "Recrutamento",
    status: "inscrições abertas",
  },
];

interface HomeEventsProps {
  accent?: string;
}

export function HomeEvents({ accent }: HomeEventsProps) {
  const ac = accent ?? "var(--signal-500)";
  const typeColor: Record<string, string> = {
    Interno: "var(--hull-300)",
    Scrim: "var(--signal-300)",
    Torneio: ac,
    Recrutamento: "var(--impostor-300)",
  };
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      className="section"
      id="eventos"
      style={{ borderTop: "1px solid var(--void-300)" }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 12, color: ac }}>
              AGENDA · TEMPORADA 5
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px,4vw,52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Próximos eventos.
            </h2>
          </div>
          <a
            href="/eventos"
            className="btn btn--ghost"
            style={{ flexShrink: 0 }}
          >
            Ver calendário completo →
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {EVENTS.map((ev, i) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: visual-only hover row
            <div
              key={`ev-${ev.date}-${ev.title}`}
              className="pk-hover-row"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr auto auto",
                gap: 24,
                alignItems: "center",
                padding: "20px 24px",
                border: `1px solid ${hovered === i ? ac : "var(--void-300)"}`,
                borderRadius: "var(--r-md)",
                background:
                  hovered === i ? "rgba(22,26,44,0.6)" : "transparent",
                transition: "border-color .15s, background .15s",
                cursor: "pointer",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--hull-100)",
                    letterSpacing: ".04em",
                  }}
                >
                  {ev.date}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--hull-400)",
                    letterSpacing: ".1em",
                  }}
                >
                  {ev.time} BRT
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--hull-100)",
                  }}
                >
                  {ev.title}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: typeColor[ev.type] ?? "var(--hull-300)",
                    letterSpacing: ".14em",
                    marginTop: 4,
                  }}
                >
                  {ev.type}
                </div>
              </div>
              <div
                style={{
                  padding: "4px 12px",
                  border: `1px solid ${ev.status === "inscrições abertas" ? ac : "var(--void-400)"}`,
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: ".16em",
                  color:
                    ev.status === "inscrições abertas" ? ac : "var(--hull-300)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {ev.status}
              </div>
              <span
                style={{
                  color: hovered === i ? ac : "var(--hull-400)",
                  transition: "color .15s, transform .15s",
                  transform: hovered === i ? "translateX(4px)" : "none",
                  display: "inline-block",
                }}
              >
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Hall da Fama ──────────────────────────────────────────────────────────────

const HALL = [
  {
    handle: "VENT.LORD",
    color: "red",
    role: "Capitão",
    wins: 847,
    impostor: true,
    mvp: true,
    season: "S1–S5",
  },
  {
    handle: "404_GHOST",
    color: "purple",
    role: "Vice-Capitão",
    wins: 612,
    impostor: false,
    mvp: false,
    season: "S2–S5",
  },
  {
    handle: "PING.SPIKE",
    color: "cyan",
    role: "Estrategista",
    wins: 534,
    impostor: false,
    mvp: false,
    season: "S3–S5",
  },
  {
    handle: "ZER0.COOL",
    color: "black",
    role: "Impostor de Elite",
    wins: 498,
    impostor: true,
    mvp: false,
    season: "S3–S5",
  },
  {
    handle: "QUEEN.BIT",
    color: "pink",
    role: "Impostor de Elite",
    wins: 455,
    impostor: false,
    mvp: false,
    season: "S4–S5",
  },
  {
    handle: "DROP.FRAME",
    color: "blue",
    role: "Crewmate Veterano",
    wins: 401,
    impostor: false,
    mvp: false,
    season: "S4–S5",
  },
];

interface HallDaFamaProps {
  accent?: string;
}

export function HallDaFama({ accent }: HallDaFamaProps) {
  const ac = accent ?? "var(--signal-500)";
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      className="section"
      id="hall"
      style={{ borderTop: "1px solid var(--void-300)" }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "end",
            marginBottom: 48,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 16, color: ac }}>
              HALL DA FAMA · TODOS OS TEMPOS
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px,4vw,52px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Dez tripulantes.
              <br />
              <span style={{ color: ac }}>Dois</span> sempre mentem.
            </h2>
          </div>
          <p className="body-lg">
            Identifique a ameaça antes que ela identifique você. Acompanhe
            estatísticas em tempo real e o hall dos impostores lendários.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
          }}
        >
          {HALL.map((m, i) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: visual-only hover card
            <div
              key={m.handle}
              className="pk-hover-card"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                background: "var(--bg-card)",
                border: `1px solid ${hovered === i ? (m.impostor ? "var(--impostor-500)" : ac) : "var(--void-300)"}`,
                borderRadius: "var(--r-lg)",
                backdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden",
                transform: hovered === i ? "translateY(-4px)" : "none",
                transition: "transform .2s, border-color .2s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: m.impostor
                    ? "linear-gradient(90deg,transparent,var(--impostor-500) 50%,transparent)"
                    : `linear-gradient(90deg,transparent,${ac} 50%,transparent)`,
                  opacity: hovered === i ? 0.8 : 0.3,
                  transition: "opacity .2s",
                }}
              />

              {m.mvp && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "2px 8px",
                    background: ac,
                    borderRadius: "var(--r-sm)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    letterSpacing: ".2em",
                    color: "var(--void-000)",
                    fontWeight: 700,
                  }}
                >
                  MVP
                </div>
              )}

              <Crewmate size={96} variant={m.impostor ? "impostor" : "crew"} />

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <CrewChip color={m.color} size={9} />
                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      letterSpacing: ".1em",
                      color: m.impostor
                        ? "var(--impostor-300)"
                        : "var(--hull-100)",
                      fontWeight: 600,
                    }}
                  >
                    {m.handle}
                  </span>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: "var(--hull-400)",
                    letterSpacing: ".16em",
                    marginBottom: 12,
                  }}
                >
                  {m.role}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 24,
                        color: m.impostor ? "var(--impostor-300)" : ac,
                      }}
                    >
                      {m.wins}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 8,
                        color: "var(--hull-400)",
                        letterSpacing: ".16em",
                      }}
                    >
                      VITÓRIAS
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--hull-200)",
                        letterSpacing: ".06em",
                        paddingTop: 4,
                      }}
                    >
                      {m.season}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 8,
                        color: "var(--hull-400)",
                        letterSpacing: ".16em",
                      }}
                    >
                      TEMPORADAS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA de Recrutamento ───────────────────────────────────────────────────────

interface HomeJoinCTAProps {
  accent?: string;
  impostorMode?: boolean;
}

export function HomeJoinCTA({ accent, impostorMode }: HomeJoinCTAProps) {
  const ac = accent ?? "var(--signal-500)";
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState("");
  const [discord, setDiscord] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !discord.trim()) return;
    setStep(2);
  }

  const phases = [
    {
      n: "01",
      label: "Candidatura",
      desc: "Formulário + handle + Discord",
    },
    {
      n: "02",
      label: "Observação",
      desc: "3 partidas ao vivo com capitão",
    },
    {
      n: "03",
      label: "Deliberação",
      desc: "Votação secreta do roster ativo",
    },
  ];

  return (
    <section
      className="section"
      id="alistar"
      style={{ borderTop: "1px solid var(--void-300)" }}
    >
      <div
        className="container"
        style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}
      >
        <div
          className="eyebrow"
          style={{
            marginBottom: 16,
            color: impostorMode ? "var(--impostor-300)" : ac,
          }}
        >
          · PRÓXIMO PASSO
        </div>

        {step === 0 && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px,5vw,64px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              O recrutamento de inverno está{" "}
              <span
                style={{
                  color: impostorMode ? "var(--impostor-300)" : ac,
                }}
              >
                aberto
              </span>
              .
            </h2>
            <p
              className="body-lg"
              style={{ margin: "0 auto 32px", maxWidth: "40ch" }}
            >
              184 candidaturas. Aprovamos 2. Tente.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: 48,
              }}
            >
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setStep(1)}
                style={{
                  background: impostorMode ? "var(--impostor-500)" : ac,
                  boxShadow: impostorMode
                    ? "var(--glow-impostor)"
                    : "var(--glow-signal)",
                  color: "var(--void-000)",
                }}
              >
                Iniciar Alistamento →
              </button>
              <a href="#hall" className="btn btn--ghost">
                Ver Hall da Fama
              </a>
            </div>

            {/* 3-phase tryout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 1,
                background: "var(--void-300)",
                borderRadius: "var(--r-lg)",
                overflow: "hidden",
              }}
            >
              {phases.map((ph) => (
                <div
                  key={ph.n}
                  style={{
                    background: "rgba(15,18,32,0.8)",
                    padding: "24px 20px",
                    textAlign: "left",
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: ac,
                      marginBottom: 8,
                      letterSpacing: ".2em",
                    }}
                  >
                    / {ph.n}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--hull-100)",
                      marginBottom: 6,
                    }}
                  >
                    {ph.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--hull-300)",
                      lineHeight: 1.5,
                    }}
                  >
                    {ph.desc}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <form
            onSubmit={handleSubmit}
            style={{ textAlign: "left", maxWidth: 480, margin: "0 auto" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "-0.02em",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Candidatura
            </h2>
            <p
              className="mono"
              style={{
                color: "var(--hull-400)",
                fontSize: 11,
                letterSpacing: ".16em",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              FASE 01 / 03 · FORMULÁRIO
            </p>
            {[
              {
                id: "handle",
                label: "Seu handle (ex: ZERO.COOL)",
                val: handle,
                set: setHandle,
                placeholder: "HANDLE.AQUI",
              },
              {
                id: "discord",
                label: "Discord (ex: handle#0001)",
                val: discord,
                set: setDiscord,
                placeholder: "usuario#0000",
              },
            ].map((f) => (
              <div key={f.id} style={{ marginBottom: 20 }}>
                <label
                  htmlFor={f.id}
                  className="mono"
                  style={{
                    display: "block",
                    fontSize: 10,
                    letterSpacing: ".2em",
                    color: "var(--hull-300)",
                    marginBottom: 8,
                  }}
                >
                  {f.label.toUpperCase()}
                </label>
                <input
                  id={f.id}
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(15,18,32,0.8)",
                    border: "1px solid var(--void-400)",
                    borderRadius: "var(--r-md)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "var(--hull-100)",
                    outline: "none",
                    transition: "border-color .15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = ac;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--void-400)";
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn--primary"
                style={{
                  flex: 1,
                  background: ac,
                  color: "var(--void-000)",
                  boxShadow: `0 0 24px ${ac}44`,
                }}
              >
                Enviar Candidatura →
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setStep(0)}
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: `${ac}22`,
                border: `2px solid ${ac}`,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 24px",
              }}
            >
              <span style={{ fontSize: 28, color: ac }}>◆</span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "-0.02em",
                marginBottom: 12,
                color: "var(--hull-100)",
              }}
            >
              Transmissão recebida.
            </h2>
            <p
              style={{
                color: "var(--hull-300)",
                marginBottom: 32,
                maxWidth: "38ch",
                margin: "0 auto 32px",
              }}
            >
              Candidatura de{" "}
              <strong
                style={{
                  color: "var(--hull-100)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                {handle || "ANON"}
              </strong>{" "}
              registrada. O capitão entrará em contato via Discord em até 72h.
            </p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setStep(0);
                setHandle("");
                setDiscord("");
              }}
            >
              Voltar ao início
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
