export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ComplyFlow</h1>
          <p className="text-sm text-muted-foreground">ISO 27001 & SOC 2 Audit Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
