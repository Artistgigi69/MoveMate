import { Link, useNavigate } from "react-router-dom";
import { LANGS, useI18n } from "./i18n";

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

export function Screen({ step, title, back, children, footer, hideNav }) {
  const navigate = useNavigate();
  const { t, dir } = useI18n();

  return (
    <div className="screen">
      <header className="topbar">
        {back ? (
          <button className="icon-btn" onClick={() => navigate(back)} aria-label={t("common.back")}>
            {dir === "rtl" ? "→" : "←"}
          </button>
        ) : (
          <Link to="/" className="brand">MoveMate</Link>
        )}
        <span className="topbar-end">
          {!hideNav && <Link to="/status" className="topbar-link">{t("common.myRequests")}</Link>}
          <LanguageSwitch />
        </span>
      </header>

      {step && (
        <div className="progress">
          {STEPS.map((s, i) => (
            <div key={s} className={"progress-seg" + (i < step ? " done" : "")} />
          ))}
          <span className="progress-label">
            {t("step.of", { n: step, total: STEPS.length, name: t(STEPS[step - 1]) })}
          </span>
        </div>
      )}

      <main className="content">
        {title && <h1>{title}</h1>}
        {children}
      </main>

      {footer && <footer className="actions">{footer}</footer>}
    </div>
  );
}

// `error` is a dictionary key (from validate.js) or ready text.
export function Field({ label, error, hint, children }) {
  const { t } = useI18n();

  return (
    <label className={"field" + (error ? " has-error" : "")}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{t(error)}</span> : hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function PersonFields({ value, onChange, errors = {} }) {
  const { t } = useI18n();
  const set = key => e => onChange({ ...value, [key]: e.target.value });

  return (
    <>
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
    </>
  );
}

export function FilePick({ label, file, onPick, accept, capture }) {
  const { t } = useI18n();

  return (
    <label className={"filepick" + (file ? " picked" : "")}>
      <input
        type="file"
        accept={accept}
        capture={capture}
        onChange={e => e.target.files[0] && onPick(e.target.files[0])}
      />
      <span className="filepick-icon">{file ? "✓" : "＋"}</span>
      <span className="filepick-text">
        <strong>{label}</strong>
        <small>{file ? file.name : t("common.tapToChoose")}</small>
      </span>
    </label>
  );
}
