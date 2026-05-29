"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface UserInfo {
  username: string;
  avatarUrl: string | null;
  role: string;
}

interface SiteHeaderProps {
  active?: string;
  accentColor?: string;
  user?: UserInfo | null;
}

const NAV_ITEMS: { href: string; label: string }[] = [
<<<<<<< HEAD
  { href: "/#about", label: "Sobre" },
  { href: "/rankeada", label: "Rankeada" },
=======
  { href: "/", label: "Sobre" },
  { href: "https://loja.packetloss.com.br", label: "Loja" },
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
  { href: "https://packetloss.com.br/discord", label: "Servidor" },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line
            x1="3"
            y1="3"
            x2="17"
            y2="17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="17"
            y1="3"
            x2="3"
            y2="17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <line
            x1="2"
            y1="5"
            x2="18"
            y2="5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="10"
            x2="18"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="15"
            x2="18"
            y2="15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

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

<<<<<<< HEAD
interface UserInfo {
  username: string;
  avatarUrl: string | null;
  role: string;
}

interface SiteHeaderProps {
  active?: string;
  accentColor?: string;
  user?: UserInfo | null;
}

=======
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
export function SiteHeader({ active, accentColor, user }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", f, { passive: true });
    f();
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    const f = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", f, { passive: true });
    return () => window.removeEventListener("resize", f);
  }, []);

  const accent = accentColor ?? "var(--signal-500)";

  const userDropdown = user ? (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: "var(--void-100)",
          border: "1px solid var(--void-400)",
          borderRadius: 6,
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
      >
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.username}
            width={24}
            height={24}
            style={{ borderRadius: "50%" }}
          />
        )}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--hull-200)",
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.username}
        </span>
        <span style={{ color: "var(--hull-400)", fontSize: 10 }}>▾</span>
      </button>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "var(--void-100)",
            border: "1px solid var(--void-400)",
            borderRadius: 8,
            padding: "6px 0",
            minWidth: 180,
            boxShadow: "var(--shadow-deep)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: "8px 14px 10px",
              borderBottom: "1px solid var(--void-300)",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--hull-400)",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {user.role === "super_admin"
                ? "Super Admin"
                : user.role === "admin"
                  ? "Admin"
                  : "Membro"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--hull-100)",
                fontWeight: 600,
              }}
            >
              {user.username}
            </div>
          </div>

          {(user.role === "admin" || user.role === "super_admin") && (
            <a
              href="/admin"
              style={{
                display: "block",
                padding: "8px 14px",
                fontSize: 12,
                color: "var(--signal-300)",
                textDecoration: "none",
                fontFamily: "var(--font-mono)",
                letterSpacing: ".06em",
              }}
            >
              ⚙ Painel Admin
            </a>
          )}

          <a
            href="/alistar"
            style={{
              display: "block",
              padding: "8px 14px",
              fontSize: 12,
              color: "var(--hull-200)",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              letterSpacing: ".06em",
            }}
          >
            ◆ Minha candidatura
          </a>

          <div
            style={{
              borderTop: "1px solid var(--void-300)",
              marginTop: 4,
              paddingTop: 4,
            }}
          >
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  fontSize: 12,
                  color: "var(--impostor-300)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: ".06em",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ Sair
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
          ? "rgba(5,6,10,0.95)"
          : "linear-gradient(180deg,rgba(5,6,10,0.75),transparent)",
        backdropFilter: scrolled ? "blur(20px)" : "blur(8px)",
        borderBottom: scrolled
          ? "1px solid var(--void-300)"
          : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Main bar */}
      <div
        className="container"
        style={{
          height: "var(--header-h)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
            flexShrink: 0,
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
        </a>

        {/* Desktop Nav — hidden on mobile */}
        <nav
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 2 }}
        >
          {NAV_ITEMS.map((n) => (
            <a
              key={n.label}
              href={n.href}
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
                textDecoration: "none",
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Desktop user/login — hidden on mobile */}
          <div className="hidden md:flex" style={{ alignItems: "center" }}>
            {user ? (
              userDropdown
            ) : (
              <a
                href="/auth/discord"
                style={{
                  padding: "8px 16px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: accent,
                  border: `1px solid ${accent}55`,
                  borderRadius: "var(--r-md)",
                  transition: "border-color .15s, color .15s",
                }}
              >
<<<<<<< HEAD
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={24}
                    height={24}
                    style={{ borderRadius: "50%" }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--hull-200)",
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.username}
                </span>
                <span style={{ color: "var(--hull-400)", fontSize: 10 }}>
                  ▾
                </span>
              </button>
=======
                Entrar
              </a>
            )}
          </div>
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="flex md:hidden"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background: "none",
              border: "1px solid var(--void-400)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--hull-200)",
            }}
          >
            <HamburgerIcon open={mobileNavOpen} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div
          className="md:hidden"
          style={{
            background: "rgba(5,6,10,0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--void-300)",
            padding: "12px 0 20px",
          }}
        >
          <div
            className="container"
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {NAV_ITEMS.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  padding: "14px 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color:
                    active === n.label
                      ? "var(--signal-300)"
                      : "var(--hull-200)",
                  borderBottom: "1px solid var(--void-300)",
                  textDecoration: "none",
                }}
              >
                {n.label}
              </a>
            ))}

            <div style={{ paddingTop: 16 }}>
              {user ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
                >
                  <div
                    style={{
                      paddingBottom: 12,
                      marginBottom: 4,
                      borderBottom: "1px solid var(--void-300)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--hull-400)",
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : user.role === "admin"
                          ? "Admin"
                          : "Membro"}
                    </div>
                    <div
<<<<<<< HEAD
                      style={{
                        fontSize: 13,
                        color: "var(--hull-100)",
                        fontWeight: 600,
                      }}
                    >
                      {user.username}
=======
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {user.avatarUrl && (
                        <Image
                          src={user.avatarUrl}
                          alt={user.username}
                          width={28}
                          height={28}
                          style={{ borderRadius: "50%" }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--hull-100)",
                          fontWeight: 600,
                        }}
                      >
                        {user.username}
                      </span>
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
                    </div>
                  </div>
                  {(user.role === "admin" || user.role === "super_admin") && (
                    <a
                      href="/admin"
                      onClick={() => setMobileNavOpen(false)}
                      style={{
                        display: "block",
                        padding: "12px 0",
                        fontSize: 12,
                        color: "var(--signal-300)",
                        textDecoration: "none",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: ".06em",
                        borderBottom: "1px solid var(--void-300)",
                      }}
                    >
                      ⚙ Painel Admin
                    </a>
                  )}
                  <a
                    href="/alistar"
                    onClick={() => setMobileNavOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 0",
                      fontSize: 12,
                      color: "var(--hull-200)",
                      textDecoration: "none",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: ".06em",
                      borderBottom: "1px solid var(--void-300)",
                    }}
                  >
                    ◆ Minha candidatura
                  </a>
<<<<<<< HEAD

                  <div
                    style={{
                      borderTop: "1px solid var(--void-300)",
                      marginTop: 4,
                      paddingTop: 4,
                    }}
                  >
                    <form action="/auth/logout" method="POST">
                      <button
                        type="submit"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 14px",
                          textAlign: "left",
                          fontSize: 12,
                          color: "var(--impostor-300)",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: ".06em",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Sair
                      </button>
                    </form>
                  </div>
=======
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      style={{
                        padding: "12px 0",
                        fontSize: 12,
                        color: "var(--impostor-300)",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: ".06em",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      ✕ Sair
                    </button>
                  </form>
>>>>>>> d32099fa56b88e91dd80ea4b775c6d61492cd9cd
                </div>
              ) : (
                <a
                  href="/auth/discord"
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: accent,
                    border: `1px solid ${accent}55`,
                    borderRadius: "var(--r-md)",
                    textDecoration: "none",
                  }}
                >
                  Entrar com Discord
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

interface SiteFooterProps {
  accentColor?: string;
}

export function SiteFooter({ accentColor }: SiteFooterProps) {
  const accent = accentColor ?? "var(--signal-500)";

  return (
    <footer
      style={{
        borderTop: "1px solid var(--void-300)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        className="container"
        style={{
          padding: "28px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--hull-100)",
          }}
        >
          PACKET<span style={{ color: accent }}>·</span>LOSS
        </div>

        <div style={{ display: "flex", gap: 12 }}>
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

        <div
          className="mono"
          style={{ color: "var(--hull-400)", fontSize: 11 }}
        >
          © 2026 Packet Loss.
        </div>
      </div>
    </footer>
  );
}
