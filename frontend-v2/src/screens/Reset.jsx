import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Field, Screen } from "../ui";
import { api } from "../api";
import { useI18n } from "../i18n";
import { Icon } from "../icons";

// Step 1: ask for the email; the backend mails a one-hour link.
export function Forgot() {
  const { state } = useLocation();
  const { t, lang, errText } = useI18n();
  const [email, setEmail] = useState(state?.email || "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.forgotPassword(email.trim(), lang);
      setSent(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen back="/auth" title={t("forgot.title")} lead={sent ? "" : t("forgot.note")}>
      {sent ? (
        <div className="card notice">
          <span className="notice-icon"><Icon name="send" size={22} /></span>
          <p>{t("forgot.sent")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="card stack">
          <Field label={t("person.email")}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" dir="ltr" required autoFocus />
          </Field>
          {error && <p className="note error">{error}</p>}
          <button className="btn primary" disabled={busy}>
            {busy ? t("auth.wait") : t("forgot.send")}
          </button>
        </form>
      )}

      <Link to="/auth" state={{ mode: "login" }} className="btn ghost">{t("forgot.back")}</Link>
    </Screen>
  );
}

// Step 2: the link from the email lands here.
export function Reset() {
  const { token } = useParams();
  const { t, errText } = useI18n();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError("");
    if (password !== repeat) {
      setError(t("reset.mismatch"));
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen hideNav title={t("reset.title")}>
      {done ? (
        <>
          <div className="card notice">
            <span className="notice-icon"><Icon name="check" size={22} strokeWidth={2.4} /></span>
            <p>{t("reset.done")}</p>
          </div>
          <Link to="/auth" state={{ mode: "login" }} className="btn primary">{t("reset.login")}</Link>
        </>
      ) : (
        <form onSubmit={submit} className="card stack">
          <Field label={t("reset.password")} hint={t("auth.passwordHint")}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={6} required autoFocus />
          </Field>
          <Field label={t("reset.repeat")}>
            <input type="password" value={repeat} onChange={e => setRepeat(e.target.value)} autoComplete="new-password" minLength={6} required />
          </Field>
          {error && <p className="note error">{error}</p>}
          <button className="btn primary" disabled={busy}>
            {busy ? t("auth.wait") : t("reset.save")}
          </button>
          {error === t("srv.resetInvalid") && (
            <Link to="/forgot" className="btn ghost">{t("forgot.send")}</Link>
          )}
        </form>
      )}
    </Screen>
  );
}
