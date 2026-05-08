import { getCurrentUser } from "@/lib/auth";
import { Starfield } from "@/components/Starfield";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { HeroCommand } from "@/components/Hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Starfield intensity={1} />
      <SiteHeader user={user} />

      <main id="home" style={{ position: "relative", zIndex: 1 }}>
        <HeroCommand user={user} />
      </main>

      <SiteFooter />
    </>
  );
}
