export default function HomePage() {
  return (
    <main className="min-h-dvh bg-mflix-bg text-white">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">M</span>
          <span className="text-mflix-red">FLIX</span>
        </div>
        <p className="mt-3 text-sm text-white/70">
          Next.js 14 foundation is set up. Next step is to port the tab/swipe
          catalog UI and hook Firebase data from <code className="font-mono">movies_by_id</code>.
        </p>
      </div>
    </main>
  );
}

