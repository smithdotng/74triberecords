import type { SpaceSlug } from "@/lib/studio";

/**
 * Top-down floor-plan drawings of each set, in the studio's brass line style.
 * Used until real photos are added (set `image` on a space in lib/studio.ts).
 */
export function SetPlan({ slug, className = "" }: { slug: SpaceSlug; className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label={`Floor plan of the ${slug.replace(/-/g, " ")}`}>
      <defs>
        <pattern id={`grid-${slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill={`url(#grid-${slug})`} />
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {PLANS[slug]}
      </g>
    </svg>
  );
}

/** A camera glyph pointing along `angle` degrees */
const Cam = ({ x, y, angle }: { x: number; y: number; angle: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`} strokeOpacity="0.55">
    <rect x="-9" y="-6" width="14" height="12" rx="2" />
    <path d="M5 -4 L13 -8 V8 L5 4" />
  </g>
);
const Chair = ({ x, y, r = 0 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x="-15" y="-15" width="30" height="30" rx="7" />
    <path d="M-15 -8 H15" strokeOpacity="0.5" />
  </g>
);
const Mic = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r="3.5" fill="currentColor" stroke="none" />;
const Light = ({ x, y }: { x: number; y: number }) => (
  <g strokeOpacity="0.45">
    <circle cx={x} cy={y} r="7" />
    <path d={`M${x - 11} ${y}h4M${x + 7} ${y}h4M${x} ${y - 11}v4M${x} ${y + 7}v4`} />
  </g>
);

const PLANS: Record<SpaceSlug, React.ReactNode> = {
  "lounge-set": (
    <>
      <path d="M40 34 H360" strokeOpacity="0.5" />
      {/* L-shaped sofa + armchairs around a low table: five seats */}
      <path d="M95 60 H275 a8 8 0 0 1 8 8 V92 H103 V140 H79 V68 a8 8 0 0 1 8 -8 Z" />
      <path d="M103 68 V92 M140 68 V92 M190 68 V92 M240 68 V92" strokeOpacity="0.4" />
      <Chair x={318} y={110} r={-90} />
      <Chair x={300} y={170} r={-60} />
      <rect x="140" y="112" width="110" height="52" rx="26" />
      <Mic x={120} y={80} />
      <Mic x={165} y={80} />
      <Mic x={215} y={80} />
      <Mic x={300} y={110} />
      <Mic x={286} y={160} />
      <Cam x={110} y={225} angle={-70} />
      <Cam x={200} y={232} angle={-90} />
      <Cam x={290} y={225} angle={-110} />
      <Light x={46} y={70} />
      <Light x={354} y={70} />
    </>
  ),
  "coffee-table-set": (
    <>
      <path d="M40 34 H360" strokeOpacity="0.5" />
      <rect x="150" y="56" width="100" height="44" rx="4" strokeOpacity="0.45" />
      <Chair x={140} y={130} r={20} />
      <Chair x={260} y={130} r={-20} />
      <circle cx="200" cy="140" r="26" />
      <Mic x={152} y={124} />
      <Mic x={248} y={124} />
      <Cam x={120} y={222} angle={-55} />
      <Cam x={200} y={230} angle={-90} />
      <Cam x={280} y={222} angle={-125} />
      <Light x={60} y={80} />
      <Light x={340} y={80} />
    </>
  ),
  "news-set": (
    <>
      <rect x="60" y="30" width="280" height="40" rx="3" />
      <path d="M80 50 H320" strokeOpacity="0.35" />
      <path d="M110 92 H290 a14 14 0 0 1 14 14 V120 H96 V106 a14 14 0 0 1 14 -14 Z" />
      <Chair x={200} y={78} r={180} />
      <Mic x={200} y={104} />
      <Cam x={200} y={220} angle={-90} />
      <Cam x={110} y={212} angle={-60} />
      <path d="M250 200 h60 v32 h-60 Z" strokeOpacity="0.45" />
      <path d="M262 212 h36 M262 220 h24" strokeOpacity="0.35" />
      <Light x={60} y={150} />
      <Light x={340} y={150} />
    </>
  ),
  "full-set": (
    <>
      <rect x="24" y="22" width="352" height="216" rx="4" strokeOpacity="0.45" strokeDasharray="5 6" />
      {/* lounge corner */}
      <path d="M44 44 H140 V62 H62 V112 H44 Z" />
      <rect x="78" y="76" width="50" height="26" rx="13" />
      {/* coffee table pair */}
      <Chair x={200} y={70} r={20} />
      <Chair x={262} y={70} r={-20} />
      <circle cx="231" cy="82" r="14" />
      {/* news desk */}
      <path d="M290 160 H352 V196 H290 Z" />
      <Chair x={321} y={140} r={180} />
      <Cam x={110} y={200} angle={-80} />
      <Cam x={200} y={206} angle={-90} />
      <Cam x={260} y={180} angle={-40} />
      <Light x={170} y={130} />
      <Light x={360} y={60} />
    </>
  ),
  "recording-studio": (
    <>
      <rect x="30" y="30" width="200" height="200" rx="4" />
      <path d="M30 60 l14 -14 M30 100 l14 -14 M30 140 l14 -14 M30 180 l14 -14 M30 220 l14 -14" strokeOpacity="0.35" />
      <path d="M60 30 l-14 14 M100 30 l-14 14 M140 30 l-14 14 M180 30 l-14 14 M220 30 l-14 14" strokeOpacity="0.35" />
      <circle cx="130" cy="130" r="34" />
      <Mic x={130} y={96} />
      <Mic x={164} y={130} />
      <Mic x={130} y={164} />
      <Mic x={96} y={130} />
      {/* glass + control room */}
      <path d="M240 60 V200" strokeWidth="3" strokeOpacity="0.6" />
      <rect x="262" y="96" width="104" height="44" rx="4" />
      <path d="M272 110 h20 M300 110 h20 M328 110 h20 M272 124 h76" strokeOpacity="0.45" />
      <Chair x={314} y={172} r={180} />
      <rect x="258" y="30" width="112" height="200" rx="4" strokeOpacity="0.45" />
    </>
  ),
  "meeting-room": (
    <>
      <rect x="30" y="30" width="340" height="200" rx="4" strokeOpacity="0.45" />
      <rect x="110" y="96" width="180" height="68" rx="34" />
      <Chair x={150} y={72} r={180} />
      <Chair x={200} y={72} r={180} />
      <Chair x={250} y={72} r={180} />
      <Chair x={150} y={188} />
      <Chair x={200} y={188} />
      <Chair x={250} y={188} />
      <Chair x={80} y={130} r={90} />
      <rect x="336" y="90" width="12" height="80" rx="2" />
    </>
  ),
};
