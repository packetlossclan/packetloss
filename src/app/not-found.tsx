import { getCurrentUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Starfield } from "@/components/Starfield";

export const metadata = {
  title: "404 — Página não encontrada | Packet Loss",
};

export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />

      <Starfield intensity={0.6} />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--header-h) var(--s-5) var(--s-8)",
          textAlign: "center",
        }}
      >
        {/* Glow backdrop */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,229,199,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Code badge */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--type-eyebrow)",
            letterSpacing: "var(--tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--signal-500)",
            border: "1px solid var(--signal-700)",
            borderRadius: "var(--r-pill)",
            padding: "4px 14px",
            marginBottom: "var(--s-5)",
          }}
        >
          ERRO 404
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(80px, 18vw, 200px)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "var(--hull-100)",
            textShadow: "var(--glow-signal)",
            marginBottom: "var(--s-4)",
          }}
        >
          4<span style={{ color: "var(--signal-500)" }}>0</span>4
        </h1>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-h2)",
            fontWeight: 700,
            color: "var(--hull-100)",
            marginBottom: "var(--s-3)",
          }}
        >
          Página não encontrada
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--type-body)",
            color: "var(--fg-body)",
            maxWidth: 420,
            lineHeight: 1.7,
            marginBottom: "var(--s-7)",
          }}
        >
          Esse destino não existe no servidor — provavelmente foi removido,
          movido ou você digitou o endereço errado.
        </p>

        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            background: "var(--signal-500)",
            color: "var(--void-000)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--type-small)",
            fontWeight: 600,
            letterSpacing: "var(--tracking-button)",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "var(--r-md)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          ← Voltar ao início
        </a>
      </main>

      <SiteFooter />
    </>
  );
}
