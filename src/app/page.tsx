import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 text-center max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-white"
                aria-hidden="true"
              >
                <path d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">
              packetloss
            </h1>
            <p className="mt-1 text-sm text-neutral-400 tracking-wide font-(family-name:--font-geist-mono)">
              .com.br
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-linear-to-b from-transparent via-neutral-700 to-transparent" />

        {/* Auth section */}
        {user ? (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-neutral-700"
                />
              )}
              <div className="text-left">
                <p className="text-sm text-neutral-400">Conectado como</p>
                <p className="text-neutral-100 font-medium">{user.username}</p>
              </div>
            </div>
            <form action="/auth/logout" method="POST" className="w-full">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 border border-neutral-700 hover:border-neutral-600 transition-all duration-200 cursor-pointer"
              >
                Sair
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <p className="text-neutral-400 text-sm">
              Entre com sua conta Discord para continuar.
            </p>
            <a
              href="/auth/discord"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 hover:border-indigo-400 transition-all duration-200 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
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
              Entrar com Discord
            </a>
          </div>
        )}
      </div>

      <p className="absolute bottom-6 text-xs text-neutral-700">
        packetloss.com.br
      </p>
    </main>
  );
}
