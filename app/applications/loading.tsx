export default function ApplicationsLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-40 h-16 border-b border-line bg-canvas/85 backdrop-blur-md" />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-12">
        <div className="h-3 w-28 animate-pulse rounded bg-line" />
        <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded bg-line" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-line/70" />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      </main>
    </div>
  );
}
