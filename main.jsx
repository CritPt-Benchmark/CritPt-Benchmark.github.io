const { useEffect, useRef, useState } = React;
const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } = Recharts;

// =========================
// Utilities + Simple Tests
// =========================

function parsePercent(p) {
  return Number(String(p).replace(/[^0-9.\-]+/g, ""));
}

function buildChartData(rows, palette) {
  return rows.map((r, i) => ({
    model: r.model,
    accuracy: parsePercent(r.accuracy),
    fill: palette[i % palette.length],
  }));
}

(function runSmokeTests(){
  const t1 = parsePercent("8%") === 8;
  const t2 = parsePercent(" 3.5 % ") === 3.5;
  const t3 = buildChartData([{ model: "m", accuracy: "10%" }], ["#000"]).length === 1;
  const t4 = parsePercent("0%") === 0;
  const t5 = parsePercent("12") === 12;
  const cd = buildChartData([{ model: "a", accuracy: "8%" }, { model: "b", accuracy: "4%" }], ["#111", "#222"]);
  const t6 = cd.length === 2 && cd[0].fill === "#111" && cd[1].fill === "#222";
  const t7 = cd.every(x => typeof x.model === "string" && typeof x.accuracy === "number");
  // Extra case from screenshot values
  const t8 = parsePercent("6.3%") === 6.3;
  console.assert(t1, "parsePercent should strip %");
  console.assert(t2, "parsePercent should handle decimals");
  console.assert(t3, "buildChartData returns one");
  console.assert(t4, "parsePercent handles zero");
  console.assert(t5, "parsePercent parses plain numbers");
  console.assert(t6, "buildChartData rotates palette");
  console.assert(t7, "buildChartData item types");
  console.assert(t8, "parsePercent should parse 6.3% accurately");
})();

// =========================
// Icons
// =========================
const ArrowDown = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
    <path d="M12 4v16m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BoltLogo = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
    <path d="M13 2L3 14h7l-1 8 11-14h-7l0-6Z" fill="currentColor"/>
  </svg>
);

// =========================
// Data (updated from screenshot)
// =========================
const TOTAL = 65;
const fmtCorrect = (pct) => `${Math.round(parsePercent(pct) / 100 * TOTAL)} / ${TOTAL}`;

const rows = [
  { model: "GPT5 (high)",       accuracy: "6.3%", correct: fmtCorrect("6.3%"), cost: "TBD", access: "TBD", icon: "o" },
  { model: "Gemini-2.5 Pro",    accuracy: "4.8%", correct: fmtCorrect("4.8%"), cost: "TBD", access: "TBD", icon: "g" },
  { model: "Deepseek R1",       accuracy: "2.2%", correct: fmtCorrect("2.2%"), cost: "TBD", access: "TBD", icon: "ds" },
  { model: "o3 (high)",         accuracy: "1.5%", correct: fmtCorrect("1.5%"), cost: "TBD", access: "TBD", icon: "o" },
  { model: "Claude Opus 4",     accuracy: "1.3%", correct: fmtCorrect("1.3%"), cost: "TBD", access: "TBD", icon: "c" },
  { model: "Gemini-2.5 Flash",  accuracy: "1.3%", correct: fmtCorrect("1.3%"), cost: "TBD", access: "TBD", icon: "g" },
  { model: "o4-mini (high)",    accuracy: "1.1%", correct: fmtCorrect("1.1%"), cost: "TBD", access: "TBD", icon: "o" },
  { model: "GPT5 (minimal)",    accuracy: "0.6%", correct: fmtCorrect("0.6%"), cost: "TBD", access: "TBD", icon: "o" },
  { model: "Llama4 Maverick",   accuracy: "0.6%", correct: fmtCorrect("0.6%"), cost: "TBD", access: "TBD", icon: "llama" },
  { model: "GPT-4o",            accuracy: "0.0%", correct: fmtCorrect("0.0%"), cost: "TBD", access: "TBD", icon: "o" },
];

// Custom palette matching the screenshot (color-blind friendly)
const colors = [
  "#0072B2", // blue
  "#009E73", // green
  "#332288", // dark purple
  "#56B4E9", // light blue
  "#CC6677", // reddish pink
  "#DDCC77", // sand yellow
  "#117733", // teal green
  "#882255", // burgundy
  "#E69F00", // orange-yellow
  "#88CCEE"  // pale blue
];

const chartData = buildChartData(rows.map(r => ({ model: r.model, accuracy: r.accuracy })), colors);

// =========================
// UI bits
// =========================
function Pill({ children, onClick, active=false }){
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition hover:bg-white/10 ${active ? 'bg-white/15 text-white' : 'text-white/90'}`}
    >
      {children}
    </button>
  );
}

function BrandMark(){
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
        <BoltLogo className="h-5 w-5" />
      </span>
      <span className="text-white font-semibold text-xl tracking-tight">CritPt</span>
    </div>
  );
}

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

// =========================
// App
// =========================
function App(){
  const scrollToLeaderboard = () => {
    const el = document.getElementById('leaderboard');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-zinc-900 scroll-smooth">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-[#0B4C8C]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <BrandMark />
            <nav className="hidden md:flex items-center gap-2">
              <Pill active onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Overview</Pill>
              <Pill onClick={scrollToAbout}>About</Pill>
              <Pill onClick={scrollToLeaderboard}>Leaderboard</Pill>
              <Pill onClick={() => window.location.href = 'example.html'}>Example</Pill>
            </nav>
          </div>
        </div>
      </header>

      <main className="snap-y snap-mandatory">
        {/* HERO */}
        <section className="relative min-h-[90vh] md:min-h-screen snap-start overflow-hidden">
          <div className="absolute inset-0 from-[#fff1b8] via-[#fdf6e3] to-transparent bg-gradient-to-b" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-7xl font-semibold tracking-tight leading-tight">
              Probing the Critical Point
            </h1>
            <p className="mt-4 text-2xl md:text-3xl text-zinc-800">
              Can AI reason through frontier physics research?
            </p>
            <div className="mt-14 flex items-center gap-3">
              <button onClick={scrollToAbout} className="rounded-full border border-black/10 bg-white/80 px-5 py-3 text-base font-medium shadow-sm backdrop-blur hover:bg-white">What is CritPt?</button>
              <button onClick={scrollToLeaderboard} className="group inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/70 px-5 py-3 text-base font-medium shadow-sm backdrop-blur hover:bg-white">See the leaderboard<ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" /></button>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="relative snap-start">
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff7d6] via-[#fffbea] to-[#fdf6e3]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="grid grid-cols-1 gap-8 items-start">
              <div className="md:col-span-12">
                <h2 className="text-3xl md:text-5xl font-semibold leading-tight">About CritPt</h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-800">
                  <span className="font-semibold">CritPt</span>
                  <span className="text-zinc-700"> (Complex Research using Integrated Thinking – Physics Test; reads as “critical point”)</span>
                  {' '}is a LLM benchmark specifically designed to evaluate <span className="font-medium">bottom-up reasoning</span> across a range of physics research topics. It includes <span className="font-medium">90+ challenges</span> and <span className="font-medium">200+ checkpoints</span>, crafted by active frontier researchers.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-amber-200 bg-white/70 p-5 shadow-sm backdrop-blur"><div className="text-4xl font-semibold text-amber-900">90+</div><div className="mt-1 text-sm text-amber-900/80">research challenges</div></div>
                  <div className="rounded-xl border border-amber-200 bg-white/70 p-5 shadow-sm backdrop-blur"><div className="text-4xl font-semibold text-amber-900">200+</div><div className="mt-1 text-sm text-amber-900/80">checkpoints</div></div>
                  <div className="rounded-xl border border-amber-200 bg-white/70 p-5 shadow-sm backdrop-blur"><div className="text-4xl font-semibold text-amber-900">Physics</div><div className="mt-1 text-sm text-amber-900/80">bottom-up reasoning</div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="min-h-screen snap-start flex items-start md:items-center">
          <div className="mx-auto max-w-6xl w-full px-4 py-14 md:py-24">
            <div className="prose prose-zinc max-w-none"><h2 className="text-3xl md:text-5xl font-semibold">Leaderboard</h2></div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-[#fff7d6] p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Accuracy overview</h3><span className="text-xs text-zinc-500">% correct (higher is better)</span></div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
                    <XAxis dataKey="model" height={50} tick={{ fontSize: 11 }} tickFormatter={(v) => v.length > 14 ? v.slice(0, 14) + '…' : v} interval={0} angle={-20} dy={10} />
                    <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 2']} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} cursor={{ fill: '#00000005' }} />
                    <Bar dataKey="accuracy" name="Accuracy (%)" radius={[4,4,0,0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-zinc-600">Colors chosen from a color‑blind friendly palette, matched to the provided chart.</p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-[#fffbea] shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#fffdf0] text-zinc-600 text-sm"><tr><th className="px-6 py-3 font-medium">Model</th><th className="px-6 py-3 font-medium">Accuracy</th><th className="px-6 py-3 font-medium">Correct</th><th className="px-6 py-3 font-medium">Cost (USD)</th><th className="px-6 py-3 font-medium">Access Time</th></tr></thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#fff7d6]">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-100 text-zinc-700 text-xs font-semibold">{r.icon === 'g' ? 'G' : r.icon === 'ds' ? 'D' : r.icon === 'llama' ? 'L' : 'O'}</span><span className="font-medium text-zinc-900">{r.model}</span></div></td>
                      <td className="px-6 py-4 font-semibold text-yellow-900">{r.accuracy}</td>
                      <td className="px-6 py-4">{r.correct}</td>
                      <td className="px-6 py-4 text-zinc-500">{r.cost}</td>
                      <td className="px-6 py-4 text-zinc-500">{r.access}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-sm text-zinc-500">*This replica omits the top-right repo/status bar as requested.</p>
          </div>
        </section>
      </main>

      <footer className="py-10" />
    </div>
  );
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
