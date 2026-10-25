import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Screen, SENT_VIA_LABELS, STATUS_LABELS } from "../ui";
import { SERVICES } from "../draft";
import { api, getToken, setToken } from "../api";

const service = key => SERVICES.find(s => s.key === key) || { label: key, icon: "•" };

export function StatusList() {
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.listTransfers()
      .then(list => setTransfers([...list].reverse()))
      .catch(err => setError(err.message));
  }, []);

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen
      title="Мои заявки"
      footer={<Link className="btn primary" to="/addresses">Новый переезд</Link>}
    >
      {error && <p className="note error">{error}</p>}
      {transfers === null && !error && <p className="note">Загружаем…</p>}
      {transfers?.length === 0 && <p className="note">Заявок пока нет.</p>}

      <ul className="list">
        {transfers?.map(t => {
          const done = t.services.filter(s => s.status === "Completed").length;
          return (
            <li key={t._id} className="card">
              <Link to={`/status/${t._id}`} className="row-link">
                <span>
                  <strong>{t.newAddress}</strong>
                  <small>{t.moveDate} · {t.services.map(s => service(s.name).icon).join(" ")}</small>
                </span>
                <span className="pill">{done}/{t.services.length}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button className="btn ghost small" onClick={() => { setToken(null); window.location.href = "/"; }}>
        Выйти
      </button>
    </Screen>
  );
}

export function StatusDetail() {
  const { id } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.getTransfer(id).then(setTransfer).catch(err => setError(err.message));
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, [id]);

  // Arnona that couldn't be emailed: point the user at each city's own form.
  const arnonaForms = transfer
    ? [
        { city: cities.find(c => c.key === transfer.oldCity), label: "закрыть на старой квартире" },
        { city: cities.find(c => c.key === transfer.newCity), label: "открыть на новой квартире" }
      ].filter(f => f.city?.formUrl)
    : [];

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title="Статус заявки">
      {error && <p className="note error">{error}</p>}
      {!transfer && !error && <p className="note">Загружаем…</p>}

      {transfer && (
        <>
          <p className="note">{transfer.oldAddress} → {transfer.newAddress}, {transfer.moveDate}</p>

          <ul className="list">
            {transfer.services.map((s, i) => {
              const info = service(s.name);
              const manualPending = s.sentVia === "manual" && !s.requestSentAt;
              return (
                <li key={s._id} className="card status-item">
                  <div className="status-head">
                    <span>{info.icon} {info.label}</span>
                    <span className={"pill " + s.status.toLowerCase()}>{STATUS_LABELS[s.status] || s.status}</span>
                  </div>
                  {s.sentVia && (
                    <small>
                      {s.sentVia === "manual" && s.requestSentAt
                        ? "Вы отметили, что связались сами"
                        : SENT_VIA_LABELS[s.sentVia] || s.sentVia}
                    </small>
                  )}
                  {manualPending && s.name === "arnona" && arnonaForms.map(f => (
                    <a key={f.label} className="form-link" href={f.city.formUrl} target="_blank" rel="noreferrer">
                      Форма {f.city.ru}: {f.label} ↗
                    </a>
                  ))}
                  {manualPending && (
                    <button
                      className="btn ghost small"
                      onClick={() => api.markServiceSent(id, i).then(setTransfer).catch(err => setError(err.message))}
                    >
                      Я уже связался
                    </button>
                  )}
                  {s.meterReading && <small>Показания: {s.meterReading}</small>}
                  {s.confirmedByTenant && <small>Новый жилец подтвердил показания</small>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Screen>
  );
}
