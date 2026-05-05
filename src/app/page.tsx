import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { Starfield } from "@/components/Starfield";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { HeroCommand } from "@/components/Hero";
import {
  StatsBar,
  HomeFeatures,
  HomeEvents,
  HallDaFama,
  HomeJoinCTA,
} from "@/components/Sections";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Starfield intensity={1} />
      <SiteHeader />

      <main id="home" style={{ position: "relative", zIndex: 1 }}>
        <HeroCommand />
        <StatsBar />
        <HomeFeatures />
        <HomeEvents />
        <HallDaFama />
        <HomeJoinCTA />
      </main>

      <SiteFooter />

      {/* Auth widget — visible only when logged in */}
      {user && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: "rgba(15,18,32,0.92)",
            border: "1px solid var(--void-300)",
            borderRadius: "var(--r-lg)",
            backdropFilter: "blur(16px)",
            boxShadow: "var(--shadow-deep)",
          }}
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
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--hull-200)",
              letterSpacing: ".08em",
            }}
          >
            {user.username}
          </span>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "var(--hull-400)",
                cursor: "pointer",
                padding: "4px 8px",
                border: "1px solid var(--void-400)",
                borderRadius: "var(--r-sm)",
                background: "none",
                transition: "color .15s, border-color .15s",
              }}
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </>
  );
}
