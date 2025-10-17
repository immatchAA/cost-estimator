import { Link } from "react-router-dom";
import { useRef, useState } from "react";

// assets
import BackgroundHero from "./assets/main_bg6.jpg";
import FloorPlanImg from "./assets/fp.png";

/* ----------------------- Stats row (top of bottom part) ----------------------- */
function StatsRow() {
  const stat = (big, small) => (
    <div className="text-center">
      <div
        className="text-[28px] md:text-[30px] font-semibold text-[#176bb7]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {big}
      </div>
      <div
        className="mt-1 text-[#0f3d6a]/70 text-sm md:text-[15px]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {small}
      </div>
    </div>
  );

  return (
    <section className="bg-white/80">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-y-8">
        {stat("98%", "Accuracy on benchmarks")}
        {stat("250+", "Materials tracked")}
        {stat("12x", "Faster vs. manual takeoff")}
        {stat("24/7", "Available anytime")}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#b4d4ff] to-transparent opacity-70" />
    </section>
  );
}

/* --------------- “From plan to estimate—interactively” cards ------------------ */
function InteractiveFlow() {
  return (
    <section className="bg-[#eef5ff]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <h2
          className="text-center text-[28px] md:text-[32px] font-semibold text-[#176bb7]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          From plan to estimate—interactively
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FlowCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 16V4" strokeWidth="1.5" strokeLinecap="round" />
                <path
                  d="M8 8l4-4 4 4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Upload your drawing"
            body="Drag & drop PDFs, images, or CAD exports. We’ll handle page detection and scale."
          />
          <FlowCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="AI takeoff & pricing"
            body="We detect elements, compute quantities, and match them with live material prices."
          />
          <FlowCard
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 9h10M7 13h6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            title="Real-World Scenarios
"
            body="Practice on sample projects like canteens, health centers, and classrooms to gain experience with industry-relevant estimation tasks."
          />
        </div>
      </div>
    </section>
  );
}

function FlowCard({ icon, title, body }) {
  return (
    <div className="rounded-2xl bg-white border border-[#d9e8ff] shadow-sm p-6">
      <div className="h-10 w-10 rounded-xl bg-[#e6eeff] text-[#176bb7] flex items-center justify-center">
        {icon}
      </div>
      <h3
        className="mt-4 text-[#176bb7] font-semibold text-lg"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-[#0f3d6a]/70"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {body}
      </p>
      <div className="mt-6 h-[2px] w-full bg-gradient-to-r from-[#dfeaff] to-transparent" />
    </div>
  );
}

/* ---------------------------------- CTA ---------------------------------- */
function CTA() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 md:py-16 text-center">
        <h3
          className="text-[24px] md:text-[28px] font-semibold text-[#176bb7]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Ready to estimate with confidence?
        </h3>
        <p
          className="mt-2 text-[#0f3d6a]/70"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Start with a sample drawing or sign up and upload your own.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-[#176bb7] text-white hover:bg-[#0d5a9f] transition"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-white text-[#176bb7] border border-[#b4d4ff] hover:bg-[#eef5ff] transition"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Login
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- HERO ---------------------------------- */
function App() {
  const useImage = true;

  // interactive floor plan
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });

  const onMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const midX = r.width / 2;
    const midY = r.height / 2;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const rotMax = 8;
    const rx = ((y - midY) / midY) * -rotMax;
    const ry = ((x - midX) / midX) * rotMax;

    const transMax = 16;
    const tx = ((x - midX) / midX) * transMax;
    const ty = ((y - midY) / midY) * transMax;

    setTilt({ rx, ry, tx, ty });
  };

  const onLeave = () => setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });

  return (
    <>
      {/* Header (kept) */}
      <header className="sticky top-0 z-50 bg-white/60 dark:bg-black/30 backdrop-blur-md border-b border-white/30 dark:border-white/10">
        <div className="mx-auto h-20 px-6 pr-6 md:px-10 flex items-center justify-between ">
          <Link
            to="/"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[1.45rem] font-semibold tracking-tight
                       bg-gradient-to-r from-[#176bb7] via-[#2786e3] to-[#176bb7]
                       bg-clip-text text-transparent"
          >
            Interactive Web Platform for Smarter Cost Estimation Practice
          </Link>

          <nav className="flex items-center gap-8 pr-80 text-lg">
            <Link
              to="/"
              className="relative text-[#176bb7]/90   transition-colors duration-300 px-4 py-2 rounded-xl
                   after:content-[''] after:absolute after:left-0 after:bottom-0 
                   after:w-0 after:h-[2px] after:bg-[#176bb7] after:transition-all after:duration-300 
                   hover:after:w-full"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="relative text-[#176bb7]/90   transition-colors duration-300 px-4 py-2 rounded-xl
                   after:content-[''] after:absolute after:left-0 after:bottom-0 
                   after:w-0 after:h-[2px] after:bg-[#176bb7] after:transition-all after:duration-300 
                   hover:after:w-full"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="relative text-[#176bb7]/90   transition-colors duration-300 px-4 py-2 rounded-xl
                   after:content-[''] after:absolute after:left-0 after:bottom-0 
                   after:w-0 after:h-[2px] after:bg-[#176bb7] after:transition-all after:duration-300 
                   hover:after:w-full"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero (kept) */}
      <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        {useImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage: `url(${BackgroundHero})`,
                filter: "saturate(1.05)",
              }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-transparent dark:from-black/60 dark:via-black/40 dark:to-black/20" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 600px at 20% 30%, rgba(23,107,183,0.08), transparent 60%), linear-gradient(180deg, #ffffff, #f6f9ff)",
            }}
            aria-hidden="true"
          />
        )}

        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.25)]" />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,107,183,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(23,107,183,0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />

        <section className="relative mx-auto px-6 md:px-10 flex min-h-[calc(100vh-5rem)]">
          <div className="w-full pl-50 grid lg:grid-cols-2 gap-8 content-center">
            {/* Left: headline */}
            <div className="self-center">
              <span
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                className="block text-[#176bb7] drop-shadow-lg font-semibold leading-[0.95]
                           text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight"
              >
                <span className="bg-gradient-to-r from-[#176bb7] via-[#2a7fd0] to-[#64b5f6] bg-clip-text text-transparent">
                  ARCHIQUEST
                </span>
              </span>
              <p
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                className="mt-5 md:mt-6 text-[#176bb7] text-lg sm:text-xl md:text-2xl font-light max-w-2xl
                           bg-white/40 dark:bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3 inline-block"
              >
                Learn Construction Cost Estimation the Smart Way
              </p>
              <div className="mt-6 h-1.5 w-40 sm:w-56 rounded-full bg-gradient-to-r from-[#176bb7] via-[#2a7fd0] to-transparent" />{" "}
            </div>

            {/* Right: interactive floor plan */}
            <div className="relative">
              <div
                ref={cardRef}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                className="group relative mx-auto w-full max-w-[520px] aspect-[5/4]
                           rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm shadow-xl
                           overflow-hidden"
                style={{
                  transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${tilt.tx}px, ${tilt.ty}px, 0)`,
                  transition: "transform 140ms ease-out",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="absolute -inset-10 bg-gradient-to-tr from-[#64b5f6]/20 via-transparent to-transparent blur-2xl pointer-events-none" />
                <img
                  src={FloorPlanImg}
                  alt="Floor plan"
                  className="relative z-10 h-full w-full object-contain select-none"
                  draggable={false}
                  style={{
                    transform: `translate3d(${tilt.tx * 0.4}px, ${
                      tilt.ty * 0.4
                    }px, 30px)`,
                    transition: "transform 140ms ease-out",
                  }}
                />
              </div>
              <p
                className="mt-3 text-center text-sm text-[#0f3d6a]/70"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              ></p>
            </div>
          </div>
        </section>

        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#176bb7]/10 blur-2xl" />
        <div className="absolute bottom-10 -left-10 w-72 h-72 rounded-full bg-[#64b5f6]/10 blur-2xl" />
      </main>

      {/* ---------- Bottom part (as in your screenshot) ---------- */}
      <StatsRow />
      <InteractiveFlow />
      <CTA />
    </>
  );
}

export default App;
