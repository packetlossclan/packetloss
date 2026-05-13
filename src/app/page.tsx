import { getCurrentUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { HeroCommand } from "@/components/Hero";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />

      <main id="home" style={{ position: "relative", zIndex: 1 }}>
        <HeroCommand user={user} />
      </main>

      <SiteFooter />
    </>
  );
}
