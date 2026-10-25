import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Screen, Section } from "../ui";
import { useDraft } from "../draft";
import { useI18n } from "../i18n";
import { api } from "../api";

export default function Addresses() {
  const navigate = useNavigate();
  const { draft, update } = useDraft();
  const { t, pick } = useI18n();
  const [cities, setCities] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, []);

  const set = key => e => update({ [key]: e.target.value });

  const next = () => {
    const e = {};
    if (!draft.oldCity) e.oldCity = "err.city";
    if (draft.oldAddress.trim().length < 4) e.oldAddress = "err.address";
    if (!draft.newCity) e.newCity = "err.city";
    if (draft.newAddress.trim().length < 4) e.newAddress = "err.address";
    if (!draft.moveDate) e.moveDate = "err.date";
    setErrors(e);
    if (Object.keys(e).length === 0) navigate("/services");
  };

  // Hebrew is shown next to the chosen language so the name matches
  // what's on the user's bills.
  const cityLabel = c => {
    const own = pick(c.names);
    return own === c.names.he ? own : `${own} · ${c.names.he}`;
  };

  const citySelect = key => (
    <select value={draft[key]} onChange={set(key)}>
      <option value="">{t("common.choose")}</option>
      {(cities || []).map(c => (
        <option key={c.key} value={c.key}>{cityLabel(c)}</option>
      ))}
    </select>
  );

  return (
    <Screen
      step={1}
      back="/"
      title={t("addr.title")}
      footer={<button className="btn primary" onClick={next}>{t("common.next")}</button>}
    >
      <Section icon="home" title={t("addr.old")}>
        <Field label={t("addr.city")} error={errors.oldCity}>{citySelect("oldCity")}</Field>
        <Field label={t("addr.address")} error={errors.oldAddress}>
          <input value={draft.oldAddress} onChange={set("oldAddress")} placeholder={t("addr.addressPh")} autoComplete="street-address" />
        </Field>
      </Section>

      <Section icon="pin" title={t("addr.new")}>
        <Field label={t("addr.city")} error={errors.newCity}>{citySelect("newCity")}</Field>
        <Field label={t("addr.address")} error={errors.newAddress}>
          <input value={draft.newAddress} onChange={set("newAddress")} placeholder={t("addr.addressPh")} />
        </Field>
      </Section>

      <Section icon="calendar" title={t("addr.date")}>
        <Field error={errors.moveDate}>
          <input type="date" value={draft.moveDate} onChange={set("moveDate")} />
        </Field>
      </Section>

      {cities?.length === 0 && <p className="note warn">{t("addr.citiesFailed")}</p>}
    </Screen>
  );
}
