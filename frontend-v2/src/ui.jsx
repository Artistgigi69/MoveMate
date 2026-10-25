import { Link, useNavigate } from "react-router-dom";

const STEPS = ["Адреса", "Услуги", "Данные", "Вход", "Отправка"];

export function Screen({ step, title, back, children, footer }) {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <header className="topbar">
        {back ? (
          <button className="icon-btn" onClick={() => navigate(back)} aria-label="Назад">←</button>
        ) : (
          <Link to="/" className="brand">MoveMate</Link>
        )}
        <Link to="/status" className="topbar-link">Мои заявки</Link>
      </header>

      {step && (
        <div className="progress" aria-label={`Шаг ${step} из ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className={"progress-seg" + (i < step ? " done" : "")} />
          ))}
          <span className="progress-label">Шаг {step} из {STEPS.length} · {STEPS[step - 1]}</span>
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

export function Field({ label, error, hint, children }) {
  return (
    <label className={"field" + (error ? " has-error" : "")}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function PersonFields({ value, onChange, errors = {} }) {
  const set = key => e => onChange({ ...value, [key]: e.target.value });

  return (
    <>
      <Field label="Имя и фамилия" error={errors.name}>
        <input value={value.name} onChange={set("name")} autoComplete="name" />
      </Field>
      <Field label="Теудат зеут" error={errors.idNumber} hint="9 цифр, включая контрольную">
        <input value={value.idNumber} onChange={set("idNumber")} inputMode="numeric" maxLength={9} />
      </Field>
      <Field label="Телефон" error={errors.phone}>
        <input value={value.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="050-1234567" />
      </Field>
      <Field label="Email" error={errors.email}>
        <input value={value.email} onChange={set("email")} type="email" autoComplete="email" />
      </Field>
    </>
  );
}

export function FilePick({ label, file, onPick, accept, capture }) {
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
        <small>{file ? file.name : "Нажмите, чтобы выбрать"}</small>
      </span>
    </label>
  );
}

export const STATUS_LABELS = {
  Pending: "Ожидает",
  Processing: "В обработке",
  Completed: "Готово"
};

export const SENT_VIA_LABELS = {
  email: "Отправлено письмом",
  auto: "Отправлено через онлайн-форму",
  manual: "Нужно связаться самостоятельно"
};
