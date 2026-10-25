import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Screen } from "../ui";
import { useDraft } from "../draft";
import { api, setToken } from "../api";

export default function Auth() {
  const navigate = useNavigate();
  const { draft } = useDraft();

  const [mode, setMode] = useState("register");
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
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen step={4} back="/details" title={mode === "register" ? "Создайте аккаунт" : "Вход"}>
      <p className="note">Аккаунт нужен, чтобы сохранить заявки и показывать их статус.</p>

      <form onSubmit={submit} className="stack">
        {tempToken ? (
          <Field label="Код из приложения-аутентификатора">
            <input value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" autoFocus />
          </Field>
        ) : (
          <>
            {mode === "register" && (
              <Field label="Имя">
                <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            </Field>
            <Field label="Пароль" hint={mode === "register" ? "Минимум 6 символов" : ""}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </Field>
          </>
        )}

        {error && <p className="note error">{error}</p>}

        <button className="btn primary" disabled={busy}>
          {busy ? "Подождите…" : tempToken ? "Подтвердить" : mode === "register" ? "Создать и продолжить" : "Войти и продолжить"}
        </button>
      </form>

      {!tempToken && (
        <button
          type="button"
          className="btn ghost"
          onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
        >
          {mode === "register" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
        </button>
      )}
    </Screen>
  );
}
