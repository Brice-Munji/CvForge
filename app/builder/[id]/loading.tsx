export default function BuilderLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="sticky top-0 z-40 h-16 border-b border-line bg-canvas/85 backdrop-blur-md" />
      <div className="h-12 border-b border-line bg-surface/80" />
      <div className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]">
        <div className="space-y-4 px-4 py-6 sm:px-6">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-line" />
            ))}
          </div>
          <div className="h-8 w-56 animate-pulse rounded bg-line" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-line" />
            ))}
          </div>
        </div>
        <div className="border-t border-line bg-[#F4F2EC] p-8 lg:border-l lg:border-t-0">
          <div className="mx-auto aspect-[1/1.414] max-w-[640px] animate-pulse rounded-lg bg-white/70 shadow-paper" />
        </div>
      </div>
    </div>
  );
}
