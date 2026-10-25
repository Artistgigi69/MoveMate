import { Link, useNavigate } from "react-router-dom";
import { LANGS, useI18n } from "./i18n";
import { Icon, Logo } from "./icons";

const STEPS = ["step.addresses", "step.services", "step.details", "step.auth", "step.submit"];

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
    <select
      className="lang-switch"
      value={lang}
      onChange={e => setLang(e.target.value)}
      aria-label={t("common.language")}
    >
      {LANGS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
    </select>
  );
}

function Stepper({ step }) {
  const { t } = useI18n();

  return (
    <div className="stepper-wrap">
      <ol className="stepper" aria-label={t("step.of", { n: step, total: STEPS.length, name: t(STEPS[step - 1]) })}>
        {STEPS.map((s, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={s} className={"stepper-item " + state} aria-current={state === "current" ? "step" : undefined}>
              <span className="stepper-dot">
                {state === "done" ? <Icon name="check" size={14} strokeWidth={2.6} /> : n}
              </span>
              <span className="stepper-label">{t(s)}</span>
            </li>
          );
        })}
      </ol>
      <p className="stepper-caption">
        {t("step.of", { n: step, total: STEPS.length, name: t(STEPS[step - 1]) })}
      </p>
    </div>
  );
}

// `wide` lets a page (the landing) use the full content width; wizard
// steps stay in a narrow, form-friendly column.
export function Screen({ step, title, lead, back, children, footer, hideNav, wide }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="screen">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-start">
            {back && (
              <button className="icon-btn" onClick={() => navigate(back)} aria-label={t("common.back")}>
                <Icon name="arrow" className="flip-rtl" />
              </button>
            )}
            <Link to="/" className="brand" aria-label="MoveMate"><Logo /></Link>
          </span>
          <span className="topbar-end">
            {!hideNav && (
              <Link to="/status" className="topbar-link">
                <Icon name="list" size={18} />
                <span>{t("common.myRequests")}</span>
              </Link>
            )}
            <LanguageSwitch />
          </span>
        </div>
      </header>

      <div className={"page" + (wide ? " wide" : "")}>
        {step && <Stepper step={step} />}

        <main className="content">
          {(title || lead) && (
            <div className="page-head">
              {title && <h1>{title}</h1>}
              {lead && <p className="lead">{lead}</p>}
            </div>
          )}
          {children}
        </main>

        {footer && <footer className="actions">{footer}</footer>}
      </div>
    </div>
  );
}

// A titled block of a form.
export function Section({ icon, title, note, children }) {
  return (
    <section className="card section">
      <header className="section-head">
        {icon && <span className="section-icon"><Icon name={icon} size={18} /></span>}
        <h2>{title}</h2>
      </header>
      {note && <p className="note">{note}</p>}
      {children}
    </section>
  );
}

// `error` is a dictionary key (from validate.js) or ready text.
export function Field({ label, error, hint, children }) {
  const { t } = useI18n();

  return (
    <label className={"field" + (error ? " has-error" : "")}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {error ? <span className="field-error">{t(error)}</span> : hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function PersonFields({ value, onChange, errors = {} }) {
  const { t } = useI18n();
  const set = key => e => onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid-2">
      <Field label={t("person.name")} error={errors.name}>
        <input value={value.name} onChange={set("name")} autoComplete="name" />
      </Field>
      <Field label={t("person.idNumber")} error={errors.idNumber} hint={t("person.idHint")}>
        <input value={value.idNumber} onChange={set("idNumber")} inputMode="numeric" maxLength={9} dir="ltr" />
      </Field>
      <Field label={t("person.phone")} error={errors.phone}>
        <input value={value.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="050-1234567" dir="ltr" />
      </Field>
      <Field label={t("person.email")} error={errors.email}>
        <input value={value.email} onChange={set("email")} type="email" autoComplete="email" dir="ltr" />
      </Field>
    </div>
  );
}

export function FilePick({ label, file, onPick, accept, capture, icon = "file" }) {
  const { t } = useI18n();

  return (
    <label className={"filepick" + (file ? " picked" : "")}>
      <input
        type="file"
        accept={accept}
        capture={capture}
        onChange={e => e.target.files[0] && onPick(e.target.files[0])}
      />
      <span className="filepick-icon">
        <Icon name={file ? "check" : icon} size={20} strokeWidth={file ? 2.4 : 1.8} />
      </span>
      <span className="filepick-text">
        <strong>{label}</strong>
        <small>{file ? file.name : t("common.tapToChoose")}</small>
      </span>
    </label>
  );
}
