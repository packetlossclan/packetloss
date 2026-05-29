import { redirect } from "next/navigation";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { Starfield } from "@/components/Starfield";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ApplicationForm } from "./ApplicationForm";

export const metadata = {
  title: "Alistar · Packet Loss",
  description: "Candidate-se para entrar no clã Packet Loss",
};

export default async function AlistarPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/discord?next=/alistar");
  }

  // Check if user already has an application
  const [existing] = await db
    .select({ id: applications.id, status: applications.status })
    .from(applications)
    .where(eq(applications.userId, user.id))
    .limit(1);

  if (existing?.status === "approved")
    redirect("/alistar/status?s=already_approved");
  if (existing?.status === "pending")
    redirect("/alistar/status?s=already_pending");

  return (
    <>
      <Starfield intensity={0.5} />
      <SiteHeader user={user} />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - var(--header-h))",
          paddingTop: "calc(var(--header-h) + 48px)",
          paddingBottom: 96,
        }}
      >
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Page header */}
          <div style={{ marginBottom: 40 }}>
            <div
              className="eyebrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
                color: "var(--signal-500)",
              }}
            >
              <span
                className="dot"
                style={{ background: "var(--signal-500)" }}
              />
              <span>Recrutamento aberto</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 56px)",
                letterSpacing: "-0.02em",
                color: "var(--hull-100)",
                marginBottom: 12,
              }}
            >
              Candidatura ao Clã
            </h1>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--hull-200)",
                lineHeight: 1.7,
                maxWidth: "60ch",
              }}
            >
              Preencha o formulário abaixo para solicitar sua entrada no Packet
              Loss. Nossa liderança analisará sua candidatura e retornará em até
              72 horas.
            </p>
          </div>

          {/* Discord identity card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              background: "var(--void-100)",
              border: "1px solid var(--void-400)",
              borderRadius: 8,
              marginBottom: 32,
            }}
          >
            {user.avatarUrl && (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={40}
                height={40}
                style={{ borderRadius: "50%", flexShrink: 0 }}
              />
            )}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--hull-400)",
                  marginBottom: 2,
                }}
              >
                Candidatura como:
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--hull-100)",
                }}
              >
                {user.username}
              </p>
            </div>
            <form
              action="/auth/logout"
              method="POST"
              style={{ marginLeft: "auto" }}
            >
              <button
                type="submit"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--hull-400)",
                  padding: "4px 10px",
                  border: "1px solid var(--void-400)",
                  borderRadius: 4,
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Trocar conta
              </button>
            </form>
          </div>

          {/* Form card */}
          <div
            style={{
              background: "var(--void-100)",
              border: "1px solid var(--void-300)",
              borderRadius: 12,
              padding: "32px 36px",
            }}
          >
            <ApplicationForm username={user.username} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
