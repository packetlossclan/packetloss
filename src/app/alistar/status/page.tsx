import { Starfield } from "@/components/Starfield";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const STATUS_CONFIG: Record<
  string,
  { icon: string; title: string; desc: string; color: string; cta?: string; ctaHref?: string }
> = {
  submitted: {
    icon: "✦",
    title: "Candidatura enviada!",
    desc: "Recebemos sua candidatura. Nossa liderança vai analisá-la e você será notificado no Discord em até 72 horas.",
    color: "var(--signal-500)",
    cta: "Voltar ao início",
    ctaHref: "/",
  },
  already_pending: {
    icon: "◌",
    title: "Candidatura em análise",
    desc: "Você já possui uma candidatura pendente. Aguarde o retorno da nossa equipe no Discord.",
    color: "var(--crew-yellow)",
    cta: "Voltar ao início",
    ctaHref: "/",
  },
  already_approved: {
    icon: "◆",
    title: "Bem-vindo ao clã!",
    desc: "Sua candidatura já foi aprovada. Você faz parte do Packet Loss.",
    color: "var(--signal-300)",
    cta: "Entrar no servidor",
    ctaHref: "https://discord.gg/nauSjkVG",
  },
  rejected: {
    icon: "✕",
    title: "Candidatura não aprovada",
    desc: "Infelizmente sua candidatura anterior não foi aceita. Você pode tentar novamente.",
    color: "var(--impostor-300)",
    cta: "Nova candidatura",
    ctaHref: "/alistar",
  },
};

export default async function AlistarStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "submitted" } = await searchParams;
  const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.submitted;

  return (
    <>
      <Starfield intensity={0.5} />
      <SiteHeader />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - var(--header-h))",
          display: "grid",
          placeItems: "center",
          paddingTop: "var(--header-h)",
          padding: "var(--header-h) 24px 96px",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 64,
              color: cfg.color,
              marginBottom: 24,
              fontFamily: "var(--font-display)",
              filter: `drop-shadow(0 0 24px ${cfg.color}88)`,
            }}
          >
            {cfg.icon}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 40px)",
              letterSpacing: "-0.02em",
              color: "var(--hull-100)",
              marginBottom: 16,
            }}
          >
            {cfg.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--hull-200)",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            {cfg.desc}
          </p>
          {cfg.cta && cfg.ctaHref && (
            <a
              href={cfg.ctaHref}
              className="btn btn--primary"
              style={{
                background: cfg.color,
                boxShadow: `0 0 24px ${cfg.color}55`,
                color: "var(--void-000)",
              }}
            >
              {cfg.cta}
            </a>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
