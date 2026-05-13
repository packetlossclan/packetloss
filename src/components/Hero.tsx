"use client";

import { useEffect, useRef } from "react";
import { Crewmate } from "@/components/Crewmate";

interface FloatingTagProps {
  label: string;
  x: string;
  y: string;
  color: string;
  delay?: number;
}

export function FloatingTag({
  label,
  x,
  y,
  color,
  delay = 0,
}: FloatingTagProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "5px 10px",
        background: "rgba(5,6,10,0.88)",
        border: "1px solid var(--void-400)",
        borderRadius: 2,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: ".12em",
        color,
        whiteSpace: "nowrap",
        backdropFilter: "blur(4px)",
        animation: `float 4s ease-in-out ${delay}s infinite`,
        zIndex: 3,
      }}
    >
      {label}
    </div>
  );
}

export function useTyping(
  text: string,
  speed = 45,
  startDelay = 600,
): React.RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = "";
    let i = 0;
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        if (i >= text.length) clearInterval(iv);
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, speed, startDelay]);
  return ref;
}

interface HeroProps {
  accent?: string;
  impostorMode?: boolean;
  user?: { username: string } | null;
}

export function HeroCommand({ accent, impostorMode, user }: HeroProps) {
  const ac = accent ?? "var(--signal-500)";
  const subRef = useTyping(
    "Um clã de elite de Among Us, fundado em 2021.",
    45,
    500,
  );

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "calc(100svh - var(--header-h))",
        display: "flex",
        alignItems: "center",
        paddingTop: "calc(var(--header-h) + 48px)",
        paddingBottom: 80,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          background: impostorMode
            ? "radial-gradient(ellipse, rgba(255,46,77,0.1) 0%, transparent 65%)"
            : "radial-gradient(ellipse, rgba(0,229,199,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{ textAlign: "center", position: "relative" }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: ".24em",
            textTransform: "uppercase",
            color: impostorMode ? "var(--impostor-300)" : ac,
          }}
        >
          <span
            className="dot"
            style={{ background: impostorMode ? "var(--impostor-500)" : ac }}
          />
          {impostorMode ? "Impostor detectado" : "Estação ativa · Região BR-SUL"}
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(72px, 14vw, 160px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            marginBottom: 36,
            color: "var(--hull-100)",
          }}
        >
          PACKET
          <br />
          <span style={{ color: impostorMode ? "var(--impostor-300)" : ac }}>
            LOSS
          </span>
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            color: "var(--hull-300)",
            lineHeight: 1.7,
            maxWidth: "44ch",
            margin: "0 auto 48px",
            minHeight: 48,
          }}
        >
          <span ref={subRef} />
          <span
            style={{
              animation: "blink 0.8s infinite",
              display: "inline-block",
              width: 7,
              height: 13,
              background: "var(--hull-400)",
              verticalAlign: "bottom",
              marginLeft: 2,
            }}
          />
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 72,
          }}
        >
          {user ? (
            <>
              <a
                href="/alistar"
                className="btn btn--primary"
                style={{
                  background: impostorMode ? "var(--impostor-500)" : ac,
                  boxShadow: impostorMode
                    ? "var(--glow-impostor)"
                    : "var(--glow-signal)",
                  color: "var(--void-000)",
                }}
              >
                {impostorMode ? "Você está rodeado →" : "Candidatar-se →"}
              </a>
              <a
                href="https://packetloss.com.br/discord"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                Servidor Discord
              </a>
            </>
          ) : (
            <>
              <a
                href="/auth/discord"
                className="btn btn--primary"
                style={{
                  background: impostorMode ? "var(--impostor-500)" : ac,
                  boxShadow: impostorMode
                    ? "var(--glow-impostor)"
                    : "var(--glow-signal)",
                  color: "var(--void-000)",
                }}
              >
                {impostorMode ? "Você está rodeado →" : "Entrar com Discord →"}
              </a>
              <a
                href="https://packetloss.com.br/discord"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                Servidor Discord
              </a>
            </>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            flexWrap: "wrap",
            borderTop: "1px solid var(--void-300)",
            paddingTop: 32,
          }}
        >
          {(
            [
              ["4.827", "Partidas"],
              ["3.194", "Vitórias"],
              ["12×", "Campeões"],
              ["#03", "Global"],
            ] as const
          ).map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 3.5vw, 36px)",
                  letterSpacing: "-0.02em",
                  color: impostorMode ? "var(--impostor-300)" : ac,
                  lineHeight: 1.1,
                }}
              >
                {v}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: ".18em",
                  color: "var(--hull-400)",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeroBroadcast({ accent, impostorMode }: HeroProps) {
  const ac = accent ?? "var(--signal-500)";

  const corners = [
    { top: 24, left: 24 },
    { top: 24, right: 24 },
    { bottom: 24, left: 24 },
    { bottom: 24, right: 24 },
  ] as const;

  const cornerIds = ["tl", "tr", "bl", "br"] as const;

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Scan-line grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(0,229,199,0.03) 40px,rgba(0,229,199,0.03) 41px)`,
          pointerEvents: "none",
        }}
      />

      {/* Corner HUD marks */}
      {corners.map((pos, i) => (
        <div
          key={cornerIds[i]}
          aria-hidden="true"
          style={{
            position: "absolute",
            ...pos,
            width: 40,
            height: 40,
            borderTop: i < 2 ? `2px solid ${ac}` : "none",
            borderBottom: i >= 2 ? `2px solid ${ac}` : "none",
            borderLeft: i % 2 === 0 ? `2px solid ${ac}` : "none",
            borderRight: i % 2 === 1 ? `2px solid ${ac}` : "none",
            opacity: 0.6,
          }}
        />
      ))}

      {/* Crewmate behind text */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          bottom: 0,
          opacity: 0.12,
          filter: "blur(1px)",
          transform: "scale(1.4)",
          transformOrigin: "bottom center",
        }}
      >
        <Crewmate
          size={380}
          hero
          variant={impostorMode ? "impostor" : "crew"}
        />
      </div>

      {/* Center content */}
      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 3,
          padding: "0 24px",
        }}
      >
        <div
          className="mono"
          style={{
            color: ac,
            fontSize: 11,
            letterSpacing: ".32em",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <span className="dot" style={{ background: ac }} />
          TRANSMISSÃO RECEBIDA — 03:47 UTC
          <span className="dot" style={{ background: ac }} />
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(72px,13vw,180px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            color: "var(--hull-100)",
            animation: "glitch-periodic 4.38s steps(2,end) infinite",
          }}
        >
          PACKET
          <br />
          <span style={{ color: ac }}>LOSS</span>
        </h1>

        <div
          style={{
            marginTop: 32,
            marginBottom: 40,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--hull-300)",
            letterSpacing: ".08em",
            maxWidth: "44ch",
            margin: "32px auto 40px",
          }}
        >
          Não confie em ninguém.
          <br />
          <span style={{ color: "var(--hull-100)" }}>Confie no time.</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#alistar"
            className="btn btn--primary"
            style={{
              background: ac,
              color: "var(--void-000)",
              boxShadow: `0 0 32px ${ac}66`,
            }}
          >
            Iniciar Alistamento →
          </a>
          <a href="#sobre" className="btn btn--ghost">
            Conhecer o Clã
          </a>
        </div>

        {/* Stats mini row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            justifyContent: "center",
            marginTop: 64,
            flexWrap: "wrap",
          }}
        >
          {(
            [
              ["4.827", "PARTIDAS"],
              ["3.194", "VITÓRIAS"],
              ["12×", "CAMPEÕES"],
              ["#03", "GLOBAL"],
            ] as const
          ).map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: "-0.02em",
                  color: ac,
                }}
              >
                {v}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: ".24em",
                  color: "var(--hull-400)",
                  marginTop: 4,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom scroll cue */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: ".2em",
          color: "var(--hull-400)",
          zIndex: 3,
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <span>SCROLL</span>
        <span style={{ fontSize: 18, lineHeight: 1 }}>↓</span>
      </div>
    </section>
  );
}

export function HeroMap({ accent, impostorMode }: HeroProps) {
  const ac = accent ?? "var(--signal-500)";
  const subRef = useTyping(
    "Estratégia, leitura de microexpressão. Histórico de impostores que ninguém acusou a tempo.",
    38,
    400,
  );

  const nodes = [
    { x: 25, y: 30, label: "CAFETERIA", active: true },
    { x: 65, y: 20, label: "ELÉTRICO", active: false },
    { x: 75, y: 55, label: "REATORES", active: false },
    { x: 40, y: 65, label: "ADMIN", active: true },
    { x: 20, y: 70, label: "STORAGE", active: false },
    { x: 55, y: 80, label: "SEGURANÇA", active: false },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        paddingTop: "var(--header-h)",
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
      }}
    >
      {/* Left: tactical map panel */}
      <div
        style={{
          borderRight: "1px solid var(--void-300)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: "rgba(10,12,20,0.6)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Map header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid var(--void-300)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: ".2em",
              color: "var(--hull-400)",
            }}
          >
            MAPA ATIVO / THE SKELD
          </span>
          <span
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: ".12em",
              color: ac,
            }}
          >
            <span
              className="dot"
              style={{
                background: ac,
                display: "inline-block",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            2 IMPOSTORES
          </span>
        </div>

        {/* Map grid */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundImage: `
              linear-gradient(rgba(0,229,199,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,229,199,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        >
          {/* Map paths */}
          <svg
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.3,
            }}
            viewBox="0 0 400 500"
          >
            <polyline
              points="100,150 260,80 300,275 220,325 80,350 100,150"
              stroke={ac}
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 6"
            />
            <line
              x1="260"
              y1="80"
              x2="220"
              y2="325"
              stroke="var(--hull-400)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          </svg>

          {/* Nodes */}
          {nodes.map((n) => (
            <div
              key={n.label}
              style={{
                position: "absolute",
                left: `${n.x}%`,
                top: `${n.y}%`,
                transform: "translate(-50%,-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: n.active ? 12 : 8,
                  height: n.active ? 12 : 8,
                  borderRadius: "50%",
                  background: n.active ? ac : "var(--void-400)",
                  boxShadow: n.active ? `0 0 12px ${ac}` : "none",
                  animation: n.active
                    ? "pulse-signal 2s ease-in-out infinite"
                    : "none",
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: 8,
                  letterSpacing: ".14em",
                  color: n.active ? "var(--hull-200)" : "var(--hull-400)",
                  whiteSpace: "nowrap",
                }}
              >
                {n.label}
              </span>
            </div>
          ))}

          {/* Crewmate on map */}
          <div
            style={{
              position: "absolute",
              left: "48%",
              top: "38%",
              transform: "translate(-50%,-50%)",
              filter: "drop-shadow(0 0 16px rgba(0,229,199,0.5))",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Crewmate size={72} variant={impostorMode ? "impostor" : "crew"} />
          </div>

          {/* Bottom status row */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 24px",
              borderTop: "1px solid var(--void-200)",
              display: "flex",
              gap: 16,
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: ".16em",
            }}
          >
            <span style={{ color: "var(--hull-400)" }}>JOGADORES: 10/10</span>
            <span style={{ color: ac }}>◆ INÍCIO EM 00:47</span>
          </div>
        </div>
      </div>

      {/* Right: hero text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 64px",
          position: "relative",
        }}
      >
        <div
          className="eyebrow"
          style={{
            marginBottom: 24,
            color: impostorMode ? "var(--impostor-300)" : ac,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            className="dot"
            style={{
              background: impostorMode ? "var(--impostor-500)" : ac,
            }}
          />
          <span>
            {impostorMode
              ? "ALERTA: SABOTAGEM EM CURSO"
              : "Clã de Elite · Desde 2023"}
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(52px,7vw,112px)",
            letterSpacing: "-0.03em",
            lineHeight: 0.92,
            color: "var(--hull-100)",
            marginBottom: 28,
          }}
        >
          PACKET
          <br />
          <span style={{ color: impostorMode ? "var(--impostor-300)" : ac }}>
            LOSS
          </span>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: impostorMode ? "var(--impostor-500)" : ac,
              marginLeft: 8,
              verticalAlign: "middle",
              animation: "blink 1.4s infinite",
            }}
          />
        </h1>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--hull-300)",
            lineHeight: 1.7,
            marginBottom: 36,
            minHeight: 44,
            maxWidth: "40ch",
          }}
        >
          {">"} <span ref={subRef} />
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 13,
              background: "var(--hull-400)",
              verticalAlign: "bottom",
              marginLeft: 2,
              animation: "blink 0.9s infinite",
            }}
          />
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <a
            href="#alistar"
            className="btn btn--primary"
            style={{
              background: impostorMode ? "var(--impostor-500)" : ac,
              boxShadow: impostorMode
                ? "var(--glow-impostor)"
                : "var(--glow-signal)",
              color: "var(--void-000)",
            }}
          >
            Iniciar Alistamento →
          </a>
          <a href="#sobre" className="btn btn--ghost">
            Conhecer o Clã
          </a>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["Ranking #03 Global", "Top 1% ELO", "12x Campeões"].map((t) => (
            <div
              key={t}
              className="mono"
              style={{ color: "var(--hull-300)", fontSize: 11 }}
            >
              <span
                style={{
                  color: impostorMode ? "var(--impostor-300)" : ac,
                  marginRight: 6,
                }}
              >
                ◆
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
