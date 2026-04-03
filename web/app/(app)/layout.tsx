import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function LogoutButton() {
  async function logout() {
    'use server';
    const session = await getSession();
    session.destroy();
    redirect('/login');
  }

  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Logout
      </button>
    </form>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-6">
          <a href="/" className="text-lg font-semibold text-emerald-400">
            RPG Engine
          </a>
        </div>
        <div className="flex items-center gap-4">
          {session.username && (
            <span className="text-sm text-gray-400">{session.username}</span>
          )}
          <a
            href="/settings"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Settings
          </a>
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
