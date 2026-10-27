import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Field, Screen, Wait } from "../ui";
import { api, getToken, setToken } from "../api";
import { useI18n } from "../i18n";
import { Icon } from "../icons";

// /account/delete — the privacy policy promises deletion on request.
export function DeleteAccount() {
  const { t, errText } = useI18n();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!done && !getToken()) return <Navigate to="/auth" replace />;

  const submit = async e => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.deleteAccount(password);
      setToken(null);
      try {
        localStorage.removeItem("mm2_draft");
      } catch {
        // Storage unavailable — nothing was saved there anyway.
      }
      setDone(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Screen hideNav title={t("acc.title")}>
        <div className="card notice">
          <span className="notice-icon"><Icon name="check" size={22} strokeWidth={2.4} /></span>
          <p>{t("acc.done")}</p>
        </div>
        <a href="/" className="btn primary">{t("acc.home")}</a>
      </Screen>
    );
  }

  return (
    <Screen back="/status" title={t("acc.title")} lead={t("acc.warning")}>
      <form onSubmit={submit} className="card stack">
        <Field label={t("acc.password")}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required autoFocus />
        </Field>
        {error && <p className="note error">{error}</p>}
        <button className="btn danger" disabled={busy}>
          {busy ? <Wait /> : t("acc.confirm")}
        </button>
      </form>
      <Link to="/status" className="btn ghost">{t("common.back")}</Link>
    </Screen>
  );
}
