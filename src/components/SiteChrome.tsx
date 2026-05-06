"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "#home", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#roster", label: "Roster" },
  { href: "#conquistas", label: "Conquistas" },
  { href: "#eventos", label: "Eventos" },
  { href: "#hall", label: "Hall da Fama" },
];

function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/images/logo.png"
      alt="Packet Loss"
      width={size}
      height={size}
      style={{
        display: "block",
        filter: "drop-shadow(0 0 12px rgba(255,46,120,0.55))",
      }}
    />
  );
}

interface SiteHeaderProps {
  active?: string;
  onNavigate?: (label: string) => void;
  accentColor?: string;
}

export function SiteHeader({
  active,
  onNavigate,
  accentColor,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", f, { passive: true });
    f();
    return () => window.removeEventListener("scroll", f);
  }, []);

  const accent = accentColor ?? "var(--signal-500)";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "var(--header-h)",
        background: scrolled
          ? "rgba(5,6,10,0.92)"
          : "linear-gradient(180deg,rgba(5,6,10,0.75),transparent)",
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        borderBottom: scrolled
          ? "1px solid var(--void-300)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        className="container"
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate?.("Início")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Logo />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: ".02em",
              color: "var(--hull-100)",
            }}
          >
            PACKET<span style={{ color: accent }}>·</span>LOSS
          </span>
        </button>
        <nav style={{ display: "flex", gap: 2 }}>
          {NAV_ITEMS.map((n) => (
            <a
              key={n.label}
              href={n.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(n.label);
              }}
              style={{
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color:
                  active === n.label ? "var(--signal-300)" : "var(--hull-200)",
                borderBottom: `1px solid ${active === n.label ? accent : "transparent"}`,
                transition: "color .15s, border-color .15s",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="/auth/discord"
          className="btn btn--primary"
          style={{
            padding: "10px 18px",
            fontSize: 11,
            background: accent,
            boxShadow: `0 0 24px ${accent}55`,
          }}
          onClick={() => onNavigate?.("Alistar")}
        >
          <span className="dot" style={{ background: "var(--void-000)" }} />
          Alistar
        </a>
      </div>
    </header>
  );
}

interface SiteFooterProps {
  accentColor?: string;
}

export function SiteFooter({ accentColor }: SiteFooterProps) {
  const accent = accentColor ?? "var(--signal-500)";
  const cols = [
    { title: "Navegar", links: ["Sobre", "Roster", "Conquistas", "Eventos"] },
    {
      title: "Comunidade",
      links: ["Hall da Fama", "Notícias", "Recrutamento"],
    },
    {
      title: "Contato",
      links: ["Discord ↗", "Twitch ↗", "X / Twitter ↗", "roster@packetloss.gg"],
    },
  ];

  return (
    <footer
      style={{
        marginTop: 96,
        borderTop: "1px solid var(--void-300)",
        background: "linear-gradient(180deg,rgba(5,6,10,0),rgba(15,18,32,0.7))",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        className="container"
        style={{
          padding: "64px 0 32px",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 48,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--hull-100)",
            }}
          >
            PACKET<span style={{ color: accent }}>·</span>LOSS
          </div>
          <p
            style={{
              color: "var(--hull-300)",
              maxWidth: 320,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Clã de elite Among Us. Fundado em 21 de agosto de 2021.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {["Discord", "WhatsApp"].map((s) => (
              <a
                key={s}
                href={`https://packetloss.com.br/${s.toLowerCase()}`}
                rel="noopener noreferrer"
                target="_blank"
                style={{
                  padding: "6px 12px",
                  border: "1px solid var(--void-400)",
                  borderRadius: "var(--r-md)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--hull-300)",
                  textDecoration: "none",
                  transition: "border-color .15s, color .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = accent;
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--hull-100)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--void-400)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--hull-300)";
                }}
              >
                {s} ↗
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="eyebrow eyebrow--hull" style={{ marginBottom: 16 }}>
              {c.title}
            </div>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 0,
                margin: 0,
              }}
            >
              {c.links.map((l) => (
                <li key={l}>
                  <a
                    href={l.includes("↗") ? "#" : "#"}
                    style={{
                      color: "var(--hull-200)",
                      fontSize: 14,
                      textDecoration: "none",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--signal-300)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--hull-200)";
                    }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="container"
        style={{
          padding: "24px 0 32px",
          borderTop: "1px solid var(--void-200)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div className="mono" style={{ color: "var(--hull-300)" }}>
          © 2026 Packet Loss. Todos os impostores reservados.
        </div>
        <div
          className="mono"
          style={{
            color: "var(--hull-300)",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span
            style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
          >
            <span className="dot" /> Servidor online
          </span>
          <span>v 4.2.1 — Fungle Patch</span>
        </div>
      </div>
    </footer>
  );
}
