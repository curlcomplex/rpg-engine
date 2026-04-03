export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-md bg-gray-900 rounded-lg p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}
