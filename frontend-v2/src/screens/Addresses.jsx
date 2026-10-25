import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Screen } from "../ui";
import { useDraft } from "../draft";
import { api } from "../api";

export default function Addresses() {
  const navigate = useNavigate();
  const { draft, update } = useDraft();
  const [cities, setCities] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, []);

  const set = key => e => update({ [key]: e.target.value });

  const next = () => {
    const e = {};
    if (!draft.oldCity) e.oldCity = "Выберите город";
    if (draft.oldAddress.trim().length < 4) e.oldAddress = "Введите улицу, дом и квартиру";
    if (!draft.newCity) e.newCity = "Выберите город";
    if (draft.newAddress.trim().length < 4) e.newAddress = "Введите улицу, дом и квартиру";
    if (!draft.moveDate) e.moveDate = "Укажите дату";
    setErrors(e);
    if (Object.keys(e).length === 0) navigate("/services");
  };

  const citySelect = key => (
    <select
      value={draft[key]}
      onChange={e => update({
        [key]: e.target.value,
        [key + "Name"]: (cities || []).find(c => c.key === e.target.value)?.ru || ""
      })}
    >
      <option value="">— выберите —</option>
      {(cities || []).map(c => (
        <option key={c.key} value={c.key}>{c.ru} · {c.he}</option>
      ))}
    </select>
  );

  return (
    <Screen
      step={1}
      back="/"
      title="Откуда и куда переезжаете?"
      footer={<button className="btn primary" onClick={next}>Дальше</button>}
    >
      <fieldset className="card">
        <legend>Старая квартира</legend>
        <Field label="Город" error={errors.oldCity}>{citySelect("oldCity")}</Field>
        <Field label="Адрес" error={errors.oldAddress}>
          <input value={draft.oldAddress} onChange={set("oldAddress")} placeholder="Улица, дом, квартира" autoComplete="street-address" />
        </Field>
      </fieldset>

      <fieldset className="card">
        <legend>Новая квартира</legend>
        <Field label="Город" error={errors.newCity}>{citySelect("newCity")}</Field>
        <Field label="Адрес" error={errors.newAddress}>
          <input value={draft.newAddress} onChange={set("newAddress")} placeholder="Улица, дом, квартира" />
        </Field>
      </fieldset>

      <Field label="Дата переезда" error={errors.moveDate}>
        <input type="date" value={draft.moveDate} onChange={set("moveDate")} />
      </Field>

      {cities?.length === 0 && (
        <p className="note warn">Не удалось загрузить список городов — проверьте, что сервер запущен.</p>
      )}
    </Screen>
  );
}
