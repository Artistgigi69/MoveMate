import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field, Screen } from "../ui";
import { useDraft } from "../draft";
import { api, setToken } from "../api";
import { useI18n } from "../i18n";

export default function Auth() {
  const navigate = useNavigate();
  const { draft } = useDraft();
  const { t, errText } = useI18n();
  const { state } = useLocation();

  const [mode, setMode] = useState(state?.mode === "login" ? "login" : "register");
  const [name, setName] = useState(draft.applicant.name);
  const [email, setEmail] = useState(draft.applicant.email);
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const done = token => {
    setToken(token);
    navigate("/submit");
  };

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (tempToken) {
        const res = await api.verify2fa(tempToken, code);
        return done(res.token);
      }

      if (mode === "register") {
        await api.register(name, email, password);
      }

      const res = await api.login(email, password);

      if (res.requires2FA) {
        setTempToken(res.tempToken);
        return;
      }

      done(res.token);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen step={4} back="/details" title={mode === "register" ? t("auth.titleRegister") : t("auth.titleLogin")}>
      <p className="note">{t("auth.note")}</p>

      <form onSubmit={submit} className="stack">
        {tempToken ? (
          <Field label={t("auth.code")}>
            <input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" autoFocus />
          </Field>
        ) : (
          <>
            {mode === "register" && (
              <Field label={t("auth.name")}>
                <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </Field>
            )}
            <Field label={t("person.email")}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
            </Field>
            <Field label={t("auth.password")} hint={mode === "register" ? t("auth.passwordHint") : ""}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </Field>
          </>
        )}

        {mode === "login" && !tempToken && (
          <Link to="/forgot" state={{ email }} className="forgot-link">{t("auth.forgot")}</Link>
        )}

        {error && <p className="note error">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? t("auth.wait") : tempToken ? t("auth.confirm") : mode === "register" ? t("auth.createContinue") : t("auth.loginContinue")}
        </button>
      </form>

      {!tempToken && (
        <button
          type="button"
          className="btn ghost"
          onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
        >
          {mode === "register" ? t("auth.haveAccount") : t("auth.noAccount")}
        </button>
      )}
    </Screen>
  );
}
