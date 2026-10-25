import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, FilePick, PersonFields, Screen } from "../ui";
import { SERVICES, useDraft } from "../draft";
import { validatePerson } from "../validate";
import { getToken } from "../api";

export default function Details() {
  const navigate = useNavigate();
  const { draft, update, files, setPhoto, setLease } = useDraft();
  const [errors, setErrors] = useState({ applicant: {}, newTenant: {}, readings: {} });

  const meters = SERVICES.filter(s => s.meter && draft.services.includes(s.key));

  const next = () => {
    const e = {
      applicant: validatePerson(draft.applicant),
      newTenant: validatePerson(draft.newTenant, false),
      readings: {}
    };

    meters.forEach(m => {
      const r = draft.readings[m.key];
      if (r && !/^\d+([.,]\d+)?$/.test(r.trim())) e.readings[m.key] = "Только цифры";
    });

    setErrors(e);

    const ok = [e.applicant, e.newTenant, e.readings].every(x => Object.keys(x).length === 0);
    if (ok) navigate(getToken() ? "/submit" : "/auth");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Screen
      step={3}
      back="/services"
      title="Данные для заявок"
      footer={<button className="btn primary" onClick={next}>Дальше</button>}
    >
      <fieldset className="card">
        <legend>Ваши данные</legend>
        <PersonFields
          value={draft.applicant}
          onChange={applicant => update({ applicant })}
          errors={errors.applicant}
        />
      </fieldset>

      {meters.length > 0 && (
        <fieldset className="card">
          <legend>Счётчики на старой квартире</legend>
          <p className="note">Сфотографируйте счётчик в день переезда так, чтобы были видны цифры и номер.</p>
          {meters.map(m => (
            <div key={m.key} className="meter">
              <h3>{m.icon} {m.label}</h3>
              <Field label="Показания" error={errors.readings[m.key]}>
                <input
                  inputMode="decimal"
                  value={draft.readings[m.key] || ""}
                  onChange={e => update({ readings: { ...draft.readings, [m.key]: e.target.value } })}
                />
              </Field>
              <FilePick
                label="Фото счётчика"
                accept="image/*"
                capture="environment"
                file={files.photos[m.key]}
                onPick={f => setPhoto(m.key, f)}
              />
            </div>
          ))}
        </fieldset>
      )}

      <fieldset className="card">
        <legend>Новый жилец или хозяин старой квартиры</legend>
        <p className="note">Нужен, чтобы счета перевели на него. Можно пропустить, если не знаете.</p>
        <PersonFields
          value={draft.newTenant}
          onChange={newTenant => update({ newTenant })}
          errors={errors.newTenant}
        />
      </fieldset>

      <fieldset className="card">
        <legend>Договор аренды</legend>
        <FilePick
          label="Копия договора"
          accept="image/*,application/pdf"
          file={files.lease}
          onPick={setLease}
        />
      </fieldset>
    </Screen>
  );
}
