export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h1 className="text-3xl font-bold text-white mb-4">
        Welcome to RPG Engine
      </h1>
      <p className="text-gray-400 text-lg mb-6">
        Chat interface coming soon.
      </p>
      <a
        href="/settings"
        className="text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        Go to Settings
      </a>
    </div>
  );
}
