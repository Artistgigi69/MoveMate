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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.getTransfer(id).then(setTransfer).catch(err => setError(err.message));
  }, [id]);

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title="Статус заявки">
      {error && <p className="note error">{error}</p>}
      {!transfer && !error && <p className="note">Загружаем…</p>}

      {transfer && (
        <>
          <p className="note">{transfer.oldAddress} → {transfer.newAddress}, {transfer.moveDate}</p>

          <ul className="list">
            {transfer.services.map(s => {
              const info = service(s.name);
              return (
                <li key={s._id} className="card status-item">
                  <div className="status-head">
                    <span>{info.icon} {info.label}</span>
                    <span className={"pill " + s.status.toLowerCase()}>{STATUS_LABELS[s.status] || s.status}</span>
                  </div>
                  {s.sentVia && <small>{SENT_VIA_LABELS[s.sentVia] || s.sentVia}</small>}
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
