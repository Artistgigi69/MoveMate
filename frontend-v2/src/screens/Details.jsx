import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, FilePick, PersonFields, Screen, Section } from "../ui";
import { Icon } from "../icons";
import { SERVICES, useDraft } from "../draft";
import { validatePerson } from "../validate";
import { getToken } from "../api";
import { GAS_PROVIDERS } from "../providers";
import { useI18n } from "../i18n";

export default function Details() {
  const navigate = useNavigate();
  const { draft, update, files, setPhoto, setLease } = useDraft();
  const { t } = useI18n();
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
      if (r && !/^\d+([.,]\d+)?$/.test(r.trim())) e.readings[m.key] = "err.digits";
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
      title={t("det.title")}
      footer={<button className="btn primary" onClick={next}>{t("common.next")}</button>}
    >
      <Section icon="user" title={t("det.you")}>
        <PersonFields
          value={draft.applicant}
          onChange={applicant => update({ applicant })}
          errors={errors.applicant}
        />
      </Section>

      {meters.length > 0 && (
        <Section icon="camera" title={t("det.meters")} note={t("det.metersNote")}>
          {meters.map(m => (
            <div key={m.key} className="meter">
              <h3 className="meter-title">
                <span className={"choice-icon small svc-" + m.key}><Icon name={m.key} size={16} /></span>
                {t(`service.${m.key}`)}
              </h3>
              {m.key === "gas" && (
                <Field label={t("det.gasCompany")} hint={t("det.gasHint")}>
                  <select value={draft.gasProvider} onChange={e => update({ gasProvider: e.target.value })}>
                    <option value="">{t("common.choose")}</option>
                    {GAS_PROVIDERS.map(p => <option key={p.key} value={p.key}>{t(`gas.${p.key}`)}</option>)}
                  </select>
                </Field>
              )}
              <Field label={t("det.reading")} error={errors.readings[m.key]}>
                <input
                  inputMode="decimal"
                  dir="ltr"
                  value={draft.readings[m.key] || ""}
                  onChange={e => update({ readings: { ...draft.readings, [m.key]: e.target.value } })}
                />
              </Field>
              <FilePick
                label={t("det.meterPhoto")}
                accept="image/*"
                capture="environment"
                icon="camera"
                file={files.photos[m.key]}
                onPick={f => setPhoto(m.key, f)}
              />
            </div>
          ))}
        </Section>
      )}

      <Section icon="users" title={t("det.tenant")} note={t("det.tenantNote")}>
        <PersonFields
          value={draft.newTenant}
          onChange={newTenant => update({ newTenant })}
          errors={errors.newTenant}
        />
      </Section>

      <Section icon="file" title={t("det.lease")}>
        <FilePick
          label={t("det.leaseCopy")}
          accept="image/*,application/pdf"
          file={files.lease}
          onPick={setLease}
        />
      </Section>
    </Screen>
  );
}
