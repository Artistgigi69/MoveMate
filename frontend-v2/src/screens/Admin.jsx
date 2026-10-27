import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Screen, Wait } from "../ui";
import { Icon } from "../icons";
import { useI18n } from "../i18n";
import { api, getToken, uploadUrl } from "../api";
import { ELECTRICITY, gasProvider } from "../providers";

// /admin — staff queue for "do it for me" requests. Internal tool for the
// MoveMate team, so it's Russian only (not in i18n.jsx). The server decides
// who is staff (ADMIN_EMAILS); everyone else gets "no access".

const SERVICE = { electricity: "Электричество", water: "Вода", gas: "Газ", arnona: "Арнона", internet: "Интернет" };
const STATUS = { Processing: "В работе", Completed: "Готово", Failed: "Не получилось" };

function Copy({ value }) {
  const [done, setDone] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      className="icon-btn small"
      title="Скопировать"
      onClick={() => navigator.clipboard.writeText(value).then(() => setDone(true), () => {})}
    >
      <Icon name={done ? "check" : "copy"} size={14} />
    </button>
  );
}

function Row({ label, value, copy }) {
  if (!value) return null;
  return (
    <div className="admin-row">
      <span className="admin-label">{label}</span>
      <bdi>{value}</bdi>
      {copy && <Copy value={value} />}
    </div>
  );
}

function Person({ title, p }) {
  if (!p || !(p.name || p.idNumber || p.phone || p.email)) return null;
  return (
    <div className="admin-block">
      <strong>{title}</strong>
      <Row label="Имя" value={p.name} copy />
      <Row label="Теудат зеут" value={p.idNumber} copy />
      <Row label="Телефон" value={p.phone} copy />
      <Row label="Email" value={p.email} copy />
    </div>
  );
}

function Request({ item, cities, onSaved }) {
  const { pick } = useI18n();
  const s = item.service;
  const [note, setNote] = useState(s.conciergeNote || "");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  const city = key => cities.find(c => c.key === key);
  const cityName = key => (city(key) ? pick(city(key).names) : key || "?");

  // Where staff submit it — the same places the user would go.
  const links = [];
  if (s.name === "electricity") links.push(["Форма IEC: смена клиента", ELECTRICITY.url]);
  if (s.name === "gas" && gasProvider(s.provider)?.url) links.push([`Газ: ${s.provider}`, gasProvider(s.provider).url]);
  for (const [key, end] of [[item.oldCity, "старая"], [item.newCity, "новая"]]) {
    const c = city(key);
    if (!c) continue;
    if (s.name === "water" && c.water?.url) links.push([`Вода: ${pick(c.water.names)} (${end})`, c.water.url]);
    if (s.name === "arnona" && c.formUrl) links.push([`Арнона: форма ${pick(c.names)} (${end})`, c.formUrl]);
  }

  const save = async status => {
    setBusy(status);
    setMsg("");
    try {
      const r = await api.adminUpdate(item.transferId, item.index, status, note);
      const label = `${SERVICE[s.name] || s.name}: ${STATUS[status]}`;
      onSaved(status === "Processing" ? `${label}. Сохранено.` : r.emailed ? `${label}. Клиенту отправлено письмо.` : `${label}. Письмо клиенту не ушло — сообщите ему сами.`);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <li className="card status-item">
      <div className="status-head">
        <span className="status-name">
          <span className={"choice-icon small svc-" + s.name}><Icon name={s.name} size={16} /></span>
          {SERVICE[s.name] || s.name}
        </span>
        <span className={"pill " + s.status.toLowerCase()}>{STATUS[s.status] || s.status}</span>
      </div>
      <small>Запрошено: {new Date(s.conciergeRequestedAt).toLocaleString("ru-RU")}{item.account ? ` · аккаунт ${item.account.email}` : ""}</small>

      <div className="admin-block">
        <strong>Переезд</strong>
        <Row label="Откуда" value={`${item.oldAddress}, ${cityName(item.oldCity)}`} copy />
        <Row label="Куда" value={`${item.newAddress}, ${cityName(item.newCity)}`} copy />
        <Row label="Дата" value={item.moveDate} copy />
        <Row label="Показания" value={s.meterReading} copy />
        <Row label="Газовая компания" value={s.provider} />
        {s.confirmedByTenant && <small className="ok-line"><Icon name="check" size={14} />Жилец подтвердил показания</small>}
        {s.meterPhoto && <a className="form-link" href={uploadUrl(s.meterPhoto)} target="_blank" rel="noreferrer">Фото счётчика <Icon name="external" size={14} /></a>}
        {item.leaseFileName && (
          <button className="btn secondary small with-icon" onClick={() => api.adminLease(item.transferId).catch(e => setMsg(e.message))}>
            <Icon name="download" size={16} />Договор ({item.leaseFileName})
          </button>
        )}
      </div>

      <Person title="Заявитель" p={item.applicant} />
      <Person title="Новый жилец" p={item.newTenant} />

      {links.length > 0 && (
        <div className="admin-block">
          <strong>Где подавать</strong>
          {links.map(([text, url]) => (
            <a key={url + text} className="form-link" href={url} target="_blank" rel="noreferrer">{text} <Icon name="external" size={14} /></a>
          ))}
        </div>
      )}

      <label className="field">
        <span className="field-label">Комментарий для клиента (номер заявки или почему не получилось)</span>
        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} />
      </label>
      <div className="share-actions">
        <button className="btn secondary small" disabled={Boolean(busy)} onClick={() => save("Processing")}>{busy === "Processing" ? <Wait /> : "В работе"}</button>
        <button className="btn primary small" disabled={Boolean(busy)} onClick={() => save("Completed")}>{busy === "Completed" ? <Wait /> : "Готово"}</button>
        <button className="btn danger small" disabled={Boolean(busy)} onClick={() => save("Failed")}>{busy === "Failed" ? <Wait /> : "Не получилось"}</button>
      </div>
      {msg && <small>{msg}</small>}
    </li>
  );
}

export default function Admin() {
  const [done, setDone] = useState(false);
  const [items, setItems] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const load = () => {
    setError("");
    api.adminRequests(done).then(setItems).catch(err => {
      setItems([]);
      setError(err.message === "Admins only" ? "Нет доступа: этот аккаунт не в списке сотрудников." : err.message);
    });
  };

  useEffect(() => {
    if (!getToken()) return;
    setItems(null);
    load();
  }, [done]);

  useEffect(() => {
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, []);

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title="Заявки «сделайте за меня»" wide>
      <div className="share-actions">
        <button className={"btn small " + (done ? "ghost" : "secondary")} onClick={() => setDone(false)}>Открытые</button>
        <button className={"btn small " + (done ? "secondary" : "ghost")} onClick={() => setDone(true)}>Завершённые</button>
      </div>
      {error && <p className="note error">{error}</p>}
      {flash && <p className="note success">{flash}</p>}
      {items === null && <p className="note"><Wait label="Загружаем…" /></p>}
      {items?.length === 0 && !error && <p className="note">{done ? "Завершённых пока нет." : "Новых заявок нет."}</p>}
      <ul className="list">
        {items?.map(item => (
          <Request key={`${item.transferId}-${item.index}`} item={item} cities={cities} onSaved={m => { setFlash(m); load(); }} />
        ))}
      </ul>
    </Screen>
  );
}
