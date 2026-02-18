export default function HomePage() {
  return (
    <main className="min-h-dvh bg-mflix-bg text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-white">M</span>
          <span className="text-mflix-red">FLIX</span>
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Next.js 14 App Router scaffold is ready. Next step: port the tabbed/swipe catalog UI and the /watch/[id]
          player.
        </p>
      </div>
    </main>
  );
}

