import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Screen } from "../ui";
import { useDraft } from "../draft";
import { useI18n } from "../i18n";
import { api, getToken } from "../api";

export default function Submit() {
  const navigate = useNavigate();
  const { draft, files, reset } = useDraft();
  const { t, errText, pick } = useI18n();
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [transferId, setTransferId] = useState(null);
  const [cities, setCities] = useState([]);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, []);

  if (!getToken()) return <Navigate to="/auth" replace />;
  if (draft.services.length === 0 && !transferId) return <Navigate to="/services" replace />;

  const hasTenant = Object.values(draft.newTenant).some(Boolean);
  const cityName = key => pick(cities.find(c => c.key === key)?.names) || key;
  const service = name => t(`service.${name}`);

  // Idempotent per step: if uploads fail after the transfer was created, a
  // retry reuses it instead of creating a duplicate.
  const send = async () => {
    setError("");

    if (!consent && !transferId) {
      setError(t("sub.consentRequired"));
      return;
    }

    try {
      let id = transferId;

      if (!id) {
        setStage(t("sub.creating"));
        const created = await api.createTransfer({
          oldAddress: draft.oldAddress,
          newAddress: draft.newAddress,
          oldCity: draft.oldCity,
          newCity: draft.newCity,
          moveDate: draft.moveDate,
          applicant: draft.applicant,
          consent: true,
          newTenant: hasTenant ? draft.newTenant : undefined,
          services: draft.services.map(name => ({
            name,
            meterReading: draft.readings[name] || "",
            provider: name === "gas" ? draft.gasProvider : ""
          }))
        });
        id = created._id;
        setTransferId(id);
      }

      for (const [i, name] of draft.services.entries()) {
        const photo = files.photos[name];
        if (photo) {
          setStage(t("sub.uploadingPhoto", { service: service(name) }));
          await api.uploadMeterPhoto(id, i, photo, draft.readings[name]);
        }
      }

      if (files.lease) {
        setStage(t("sub.uploadingLease"));
        await api.uploadLease(id, files.lease);
      }

      setStage(t("sub.sending"));
      await api.submitTransfer(id);

      reset();
      navigate(`/status/${id}`, { replace: true });
    } catch (err) {
      setError(errText(err));
      setStage("");
    }
  };

  return (
    <Screen
      step={5}
      back="/details"
      title={t("sub.title")}
      footer={
        <button className="btn primary" onClick={send} disabled={Boolean(stage)}>
          {stage || (transferId ? t("sub.retry") : t("sub.send"))}
        </button>
      }
    >
      <dl className="summary card">
        <dt>{t("sub.from")}</dt><dd>{draft.oldAddress}, {cityName(draft.oldCity)}</dd>
        <dt>{t("sub.to")}</dt><dd>{draft.newAddress}, {cityName(draft.newCity)}</dd>
        <dt>{t("sub.date")}</dt><dd>{draft.moveDate}</dd>
        <dt>{t("sub.applicant")}</dt><dd>{draft.applicant.name} · <bdi>{draft.applicant.idNumber}</bdi></dd>
        {hasTenant && <><dt>{t("sub.tenant")}</dt><dd>{draft.newTenant.name}</dd></>}
        <dt>{t("sub.lease")}</dt><dd>{files.lease ? files.lease.name : t("sub.leaseNone")}</dd>
      </dl>

      <ul className="list card">
        {draft.services.map(name => (
          <li key={name}>
            <span>{service(name)}</span>
            <small>
              {draft.readings[name] ? t("sub.reading", { value: draft.readings[name] }) : ""}
              {files.photos[name] ? ` · ${t("sub.photo")}` : ""}
            </small>
          </li>
        ))}
      </ul>

      <p className="note">{t("sub.note")}</p>

      <label className={"consent card" + (error && !consent ? " has-error" : "")}>
        <input type="checkbox" checked={consent || Boolean(transferId)} disabled={Boolean(transferId)} onChange={e => setConsent(e.target.checked)} />
        <span>
          {t("sub.consent")}
          <span className="consent-links">
            <Link to="/terms" target="_blank">{t("legal.terms")}</Link>
            <Link to="/privacy" target="_blank">{t("legal.privacy")}</Link>
          </span>
        </span>
      </label>

      {error && <p className="note error">{error}</p>}
    </Screen>
  );
}
