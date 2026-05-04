import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-neutral-950">
      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-sm px-8 py-10 flex flex-col items-center gap-8 shadow-2xl shadow-black/40">

          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src="/images/logo.png"
              alt="Packetloss logo"
              width={80}
              height={80}
              priority
              className="drop-shadow-[0_0_18px_rgba(236,72,153,0.45)]"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
                Crie sua conta
              </h1>
              <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed">
                Cadastre-se em <span className="text-pink-400 font-medium">packetloss.com.br</span> com sua conta Discord.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* Auth section */}
          {user ? (
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex items-center gap-3 w-full px-3 py-3 rounded-xl bg-white/4 border border-white/6">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.username}
                    width={38}
                    height={38}
                    className="rounded-full ring-2 ring-pink-500/30"
                  />
                ) : (
                  <div className="w-9.5 h-9.5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-sm font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left min-w-0">
                  <p className="text-xs text-neutral-500">Conectado como</p>
                  <p className="text-sm text-neutral-100 font-medium truncate">{user.username}</p>
                </div>
                <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              </div>
              <form action="/auth/logout" method="POST" className="w-full">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-white/4 hover:bg-white/8 text-neutral-400 hover:text-neutral-200 border border-white/6 hover:border-white/10 transition-all duration-200 cursor-pointer"
                >
                  Sair da conta
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <a
                href="/auth/discord"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-200 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/30 hover:-translate-y-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03Z" />
                </svg>
                Cadastrar com Discord
              </a>

              <p className="text-center text-xs text-neutral-600">
                Já tem conta?{" "}
                <a href="/auth/discord" className="text-pink-500 hover:text-pink-400 transition-colors">
                  Entrar
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Terms note */}
        <p className="mt-5 text-center text-xs text-neutral-700">
          Ao se cadastrar, você concorda com os nossos termos de uso.
        </p>
      </div>
    </main>
  );
}
