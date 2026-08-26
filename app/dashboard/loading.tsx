export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="sticky top-0 z-40 h-16 border-b border-line bg-canvas/85 backdrop-blur-md" />
      <main className="mx-auto w-full max-w-content px-5 py-10 sm:px-8 sm:py-14">
        <div className="h-3 w-24 animate-pulse rounded bg-line" />
        <div className="mt-4 h-9 w-80 max-w-full animate-pulse rounded bg-line" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-line" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="h-[190px] animate-pulse border-b border-line bg-[#F4F2EC]" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-line" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-line" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
