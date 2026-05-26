"use client";

import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Starfield } from "@/components/Starfield";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader user={null} />

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
        {/* Glow backdrop — red tint for errors */}
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
              "radial-gradient(circle, rgba(255,46,77,0.07) 0%, transparent 70%)",
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
            color: "var(--impostor-300)",
            border: "1px solid var(--impostor-700)",
            borderRadius: "var(--r-pill)",
            padding: "4px 14px",
            marginBottom: "var(--s-5)",
          }}
        >
          ERRO INESPERADO
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
            textShadow: "var(--glow-impostor)",
            marginBottom: "var(--s-4)",
          }}
        >
          5<span style={{ color: "var(--impostor-500)" }}>0</span>0
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
          Algo deu errado
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--type-body)",
            color: "var(--fg-body)",
            maxWidth: 420,
            lineHeight: 1.7,
            marginBottom: error.digest ? "var(--s-5)" : "var(--s-7)",
          }}
        >
          Ocorreu um erro no servidor. Você pode tentar novamente ou voltar para
          a página inicial.
        </p>

        {/* Digest for debugging — only shown when present */}
        {error.digest && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-mono)",
              color: "var(--hull-400)",
              letterSpacing: "var(--tracking-mono)",
              marginBottom: "var(--s-7)",
            }}
          >
            digest: {error.digest}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "var(--s-3)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "var(--impostor-500)",
              color: "var(--hull-100)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-small)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-button)",
              textTransform: "uppercase",
              border: "none",
              borderRadius: "var(--r-md)",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
          >
            ↺ Tentar novamente
          </button>

          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "transparent",
              color: "var(--hull-200)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--type-small)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-button)",
              textTransform: "uppercase",
              textDecoration: "none",
              border: "1px solid var(--void-400)",
              borderRadius: "var(--r-md)",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--hull-300)";
              (e.currentTarget as HTMLElement).style.color = "var(--hull-100)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--void-400)";
              (e.currentTarget as HTMLElement).style.color = "var(--hull-200)";
            }}
          >
            ← Início
          </a>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
