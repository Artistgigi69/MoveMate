import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Screen, SENT_VIA_LABELS, STATUS_LABELS } from "../ui";
import { SERVICES } from "../draft";
import { api, getToken, setToken } from "../api";
import { ELECTRICITY, gasProvider } from "../providers";

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

  // For anything we couldn't send: where the user does it themselves.
  // Returns [{ text, url? }] — an entry without url is a hint, not a link.
  const selfServiceLinks = s => {
    const oldCity = cities.find(c => c.key === transfer.oldCity);
    const newCity = cities.find(c => c.key === transfer.newCity);
    const ends = [
      { city: oldCity, label: "старая квартира" },
      { city: newCity, label: "новая квартира" }
    ];

    if (s.name === "arnona") {
      return ends
        .filter(e => e.city?.formUrl)
        .map(e => ({ text: `Форма арноны ${e.city.ru} (${e.label})`, url: e.city.formUrl }));
    }

    if (s.name === "electricity") {
      return [{ text: `Смена клиента в ${ELECTRICITY.name}`, url: ELECTRICITY.url }];
    }

    if (s.name === "gas") {
      const p = gasProvider(s.provider);
      if (p?.url) return [{ text: `Смена клиента в ${p.name}`, url: p.url }];
      return [{ text: "Позвоните в газовую компанию, указанную на баллоне или в счёте" }];
    }

    if (s.name === "water") {
      const known = ends.filter(e => e.city?.water);
      if (known.length === 0) {
        return [{ text: "Водная компания указана в вашем счёте за воду" }];
      }
      return known.map(e => ({ text: `${e.city.water.name} (${e.label})`, url: e.city.water.url }));
    }

    return [];
  };

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title="Статус заявки">
      {error && <p className="note error">{error}</p>}
      {!transfer && !error && <p className="note">Загружаем…</p>}

      {transfer && (
        <>
          <p className="note">{transfer.oldAddress} → {transfer.newAddress}, {transfer.moveDate}</p>

          {transfer.leaseFile && (
            <button
              className="btn ghost small"
              onClick={() => api.downloadLease(id).catch(err => setError(err.message))}
            >
              Скачать договор{transfer.leaseFileName ? ` (${transfer.leaseFileName})` : ""}
            </button>
          )}

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
                  {manualPending && selfServiceLinks(s).map(l => l.url ? (
                    <a key={l.text} className="form-link" href={l.url} target="_blank" rel="noreferrer">
                      {l.text} ↗
                    </a>
                  ) : (
                    <small key={l.text}>{l.text}</small>
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
