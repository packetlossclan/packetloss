import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {user ? (
        <div>
          {user.avatarUrl && (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={64}
              height={64}
              style={{ borderRadius: "50%" }}
            />
          )}
          <p>Olá, <strong>{user.username}</strong>!</p>
          <form action="/auth/logout" method="POST">
            <button type="submit">Sair</button>
          </form>
        </div>
      ) : (
        <div>
          <p>Você não está logado.</p>
          <a href="/auth/discord">Entrar com Discord</a>
        </div>
      )}
    </main>
  );
}
