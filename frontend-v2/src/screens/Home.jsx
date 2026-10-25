import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Screen } from "../ui";
import { SERVICES, useDraft } from "../draft";
import { useI18n } from "../i18n";
import { Icon } from "../icons";

// Isometric house + moving box, drawn by hand so the hero stays a few KB.
function HouseScene() {
  return (
    <svg className="scene-house" viewBox="0 0 320 320" aria-hidden="true">
      <defs>
        <linearGradient id="roofR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--roof-1)" />
          <stop offset="1" stopColor="var(--roof-2)" />
        </linearGradient>
        <linearGradient id="wallR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--wall-r1)" />
          <stop offset="1" stopColor="var(--wall-r2)" />
        </linearGradient>
        <linearGradient id="wallL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--wall-l1)" />
          <stop offset="1" stopColor="var(--wall-l2)" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="165" cy="262" rx="140" ry="44" fill="url(#glow)" />
      <ellipse cx="160" cy="266" rx="98" ry="22" fill="var(--shadow-ink)" opacity=".16" />

      {/* back roof slope */}
      <polygon points="60,140 110,105 210,55 160,90" fill="var(--roof-3)" />
      {/* left (gable) wall */}
      <polygon points="60,140 160,190 160,270 60,220" fill="url(#wallL)" />
      <polygon points="60,140 160,190 110,105" fill="url(#wallL)" />
      {/* right wall */}
      <polygon points="160,190 260,140 260,220 160,270" fill="url(#wallR)" />
      {/* front roof slope */}
      <polygon points="110,105 210,55 266,144 166,194" fill="url(#roofR)" />
      <polygon points="110,105 166,194 160,198 104,109" fill="var(--roof-edge)" />

      {/* door */}
      <polygon points="100,240 122,251 122,215 100,204" fill="var(--door)" />
      <circle cx="117" cy="234" r="1.8" fill="#fff" opacity=".8" />
      {/* windows */}
      <polygon points="70,175 88,184 88,204 70,195" fill="var(--glass-win)" />
      <polygon points="184,197 214,182 214,208 184,223" fill="var(--glass-win)" />
      <polygon points="226,176 248,165 248,191 226,202" fill="var(--glass-win)" />
      <polygon points="184,197 214,182 214,188 184,203" fill="#fff" opacity=".35" />

      {/* moving box */}
      <g transform="translate(232 222)">
        <polygon points="0,14 26,27 26,52 0,39" fill="var(--box-l)" />
        <polygon points="26,27 52,14 52,39 26,52" fill="var(--box-r)" />
        <polygon points="0,14 26,1 52,14 26,27" fill="var(--box-t)" />
        <polygon points="11,8.5 15,6.5 41,19.5 37,21.5" fill="var(--box-tape)" />
      </g>
      <g transform="translate(18 228) scale(.78)">
        <polygon points="0,14 26,27 26,52 0,39" fill="var(--box-l)" />
        <polygon points="26,27 52,14 52,39 26,52" fill="var(--box-r)" />
        <polygon points="0,14 26,1 52,14 26,27" fill="var(--box-t)" />
        <polygon points="11,8.5 15,6.5 41,19.5 37,21.5" fill="var(--box-tape)" />
      </g>
    </svg>
  );
}

// Tilts the scene toward the pointer — subtle depth on desktop.
function useTilt() {
  const ref = useRef(null);

  const onMove = e => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}

export default function Home() {
  const navigate = useNavigate();
  const { draft, reset } = useDraft();
  const { t } = useI18n();
  const tilt = useTilt();
  const hasDraft = Boolean(draft.oldAddress || draft.services.length);

  const steps = [
    { icon: "pin", text: t("home.how1") },
    { icon: "list", text: t("home.how2") },
    { icon: "camera", text: t("home.how3") },
    { icon: "send", text: t("home.how4") }
  ];

  return (
    <Screen wide>
      <section className="hero">
        <div className="hero-copy">
          <span className="badge"><span className="badge-dot" />{t("home.badge")}</span>
          <h1>{t("home.title")}</h1>
          <p className="lead">{t("home.lead")}</p>

          <div className="hero-cta">
            <button className="btn primary lg with-icon" onClick={() => navigate("/addresses")}>
              {hasDraft ? t("home.continue") : t("home.start")}
              <Icon name="arrow" size={18} className="flip-ltr" />
            </button>
            {hasDraft && (
              <button className="btn ghost" onClick={() => { reset(); navigate("/addresses"); }}>
                {t("home.restart")}
              </button>
            )}
          </div>

          <ul className="trust">
            <li><Icon name="clock" size={18} />{t("home.trust1")}</li>
            <li><Icon name="shield" size={18} />{t("home.trust2")}</li>
            <li><Icon name="pin" size={18} />{t("home.trust3")}</li>
          </ul>
        </div>

        <div className="scene" {...tilt}>
          <div className="scene-inner">
            <div className="scene-orb" />
            <HouseScene />
            {SERVICES.map((s, i) => (
              <span key={s.key} className={`float-tile tile-${i} svc-${s.key}`} title={t(`service.${s.key}`)}>
                <Icon name={s.key} size={22} />
              </span>
            ))}
            <span className="float-chip">
              <span className="float-chip-check"><Icon name="check" size={14} strokeWidth={3} /></span>
              {t("service.electricity")} · {t("status.Completed")}
            </span>
          </div>
        </div>
      </section>

      <section className="how-block">
        <h2>{t("home.stepsTitle")}</h2>
        <ol className="how-grid">
          {steps.map((s, i) => (
            <li key={i} className="how-card">
              <span className="how-num">{i + 1}</span>
              <span className="how-icon"><Icon name={s.icon} size={22} /></span>
              <span className="how-text">{s.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="svc-strip" aria-label={t("step.services")}>
        {SERVICES.map(s => (
          <span key={s.key} className="svc-chip">
            <span className={"choice-icon small svc-" + s.key}><Icon name={s.key} size={16} /></span>
            {t(`service.${s.key}`)}
          </span>
        ))}
      </section>
    </Screen>
  );
}
