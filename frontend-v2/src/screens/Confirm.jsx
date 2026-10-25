import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Screen } from "../ui";
import { Icon } from "../icons";
import { useI18n } from "../i18n";
import { api, uploadUrl } from "../api";

// Public page for the new tenant (no account): they open the link the
// mover sent and confirm the meter reading at handover.
export default function Confirm() {
  const { token } = useParams();
  const { t, tx, errText } = useI18n();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.confirmInfo(token).then(setInfo).catch(() => setError(t("confirm.notFound")));
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.confirmReading(token);
      setInfo({ ...info, confirmedByTenant: true, confirmedAt: res.confirmedAt });
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const service = info ? t(`service.${info.serviceName}`) : "";

  return (
    <Screen
      hideNav
      title={t("confirm.title")}
      footer={info && !info.confirmedByTenant && (
        <button className="btn primary" onClick={confirm} disabled={busy}>
          {busy ? t("auth.wait") : t("confirm.button")}
        </button>
      )}
    >
      {!info && !error && <p className="note">{t("common.loading")}</p>}
      {error && <p className="note error">{error}</p>}

      {info && (
        <>
          <p>
            {info.applicantName
              ? tx("confirm.lead", { name: info.applicantName, address: info.address, service })
              : tx("confirm.leadNoName", { address: info.address, service })}
          </p>

          <div className="card status-item">
            <div className="status-head">
              <span className="status-name">
                <span className={"choice-icon small svc-" + info.serviceName}><Icon name={info.serviceName} size={16} /></span>
                {service}
              </span>
            </div>
            {info.meterReading && (
              <p className="reading">
                <small>{t("confirm.reading")}</small>
                <strong dir="ltr">{info.meterReading}</strong>
              </p>
            )}
            {info.meterPhoto && (
              <img className="meter-photo" src={uploadUrl(info.meterPhoto)} alt={t("confirm.photo")} />
            )}
          </div>

          {info.confirmedByTenant
            ? <p className="note success ok-line"><Icon name="check" size={16} strokeWidth={2.6} />{t("confirm.done")}</p>
            : <p className="note">{t("confirm.check")}</p>}
        </>
      )}
    </Screen>
  );
}
