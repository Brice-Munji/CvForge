export default function CoverLettersLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-40 h-16 border-b border-line bg-canvas/85 backdrop-blur-md" />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-12">
        <div className="h-3 w-28 animate-pulse rounded bg-line" />
        <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded bg-line" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-line/60" />
          ))}
        </div>
      </main>
    </div>
  );
}
