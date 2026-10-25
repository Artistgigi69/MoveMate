import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Screen } from "../ui";
import { serviceIcon } from "../draft";
import { useI18n } from "../i18n";
import { api, getToken, setToken } from "../api";
import { ELECTRICITY, gasProvider } from "../providers";

export function StatusList() {
  const { t, errText } = useI18n();
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.listTransfers()
      .then(list => setTransfers([...list].reverse()))
      .catch(err => setError(errText(err)));
  }, []);

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen
      title={t("st.listTitle")}
      footer={<Link className="btn primary" to="/addresses">{t("st.newMove")}</Link>}
    >
      {error && <p className="note error">{error}</p>}
      {transfers === null && !error && <p className="note">{t("common.loading")}</p>}
      {transfers?.length === 0 && <p className="note">{t("st.empty")}</p>}

      <ul className="list">
        {transfers?.map(tr => {
          const done = tr.services.filter(s => s.status === "Completed").length;
          return (
            <li key={tr._id} className="card">
              <Link to={`/status/${tr._id}`} className="row-link">
                <span>
                  <strong>{tr.newAddress}</strong>
                  <small>{tr.moveDate} · {tr.services.map(s => serviceIcon(s.name)).join(" ")}</small>
                </span>
                <span className="pill">{done}/{tr.services.length}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button className="btn ghost small" onClick={() => { setToken(null); window.location.href = "/"; }}>
        {t("st.logout")}
      </button>
    </Screen>
  );
}

// 050-1234567 → 972501234567 for wa.me links.
function waPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return "972" + digits.slice(1);
  return digits;
}

function TenantShare({ transfer, service }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/confirm/${service.confirmToken}`;
  const text = t("st.shareText", { service: t(`service.${service.name}`), url });
  const phone = waPhone(transfer.newTenant?.phone);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt(t("st.copy"), url);
    }
  };

  return (
    <div className="share">
      <small>{t("st.tenantLink")}</small>
      <div className="share-actions">
        <button className="btn ghost small" onClick={copy}>{copied ? t("st.copied") : t("st.copy")}</button>
        <a
          className="btn ghost small"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
        >
          {t("st.whatsapp")}
        </a>
      </div>
    </div>
  );
}

export function StatusDetail() {
  const { id } = useParams();
  const { t, errText, pick } = useI18n();
  const [transfer, setTransfer] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.getTransfer(id).then(setTransfer).catch(err => setError(errText(err)));
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, [id]);

  // For anything we couldn't send: where the user does it themselves.
  // Returns [{ text, url? }] — an entry without url is a hint, not a link.
  const selfServiceLinks = s => {
    const ends = [
      { city: cities.find(c => c.key === transfer.oldCity), end: t("st.oldFlat") },
      { city: cities.find(c => c.key === transfer.newCity), end: t("st.newFlat") }
    ];

    if (s.name === "arnona") {
      return ends
        .filter(e => e.city?.formUrl)
        .map(e => ({ text: t("st.arnonaForm", { city: pick(e.city.names), end: e.end }), url: e.city.formUrl }));
    }

    if (s.name === "electricity") {
      return [{ text: t("st.changeCustomer", { name: t(ELECTRICITY.nameKey) }), url: ELECTRICITY.url }];
    }

    if (s.name === "gas") {
      const p = gasProvider(s.provider);
      if (p?.url) return [{ text: t("st.changeCustomer", { name: t(`gas.${p.key}`) }), url: p.url }];
      return [{ text: t("st.gasCall") }];
    }

    if (s.name === "water") {
      const known = ends.filter(e => e.city?.water);
      if (known.length === 0) return [{ text: t("st.waterHint") }];
      return known.map(e => ({ text: t("st.waterCompany", { name: pick(e.city.water.names), end: e.end }), url: e.city.water.url }));
    }

    return [];
  };

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title={t("st.detailTitle")}>
      {error && <p className="note error">{error}</p>}
      {!transfer && !error && <p className="note">{t("common.loading")}</p>}

      {transfer && (
        <>
          <p className="note">
            <bdi>{transfer.oldAddress}</bdi> → <bdi>{transfer.newAddress}</bdi>, <bdi>{transfer.moveDate}</bdi>
          </p>

          {transfer.leaseFile && (
            <button
              className="btn ghost small"
              onClick={() => api.downloadLease(id).catch(err => setError(errText(err)))}
            >
              {t("st.downloadLease")}{transfer.leaseFileName ? ` (${transfer.leaseFileName})` : ""}
            </button>
          )}

          <ul className="list">
            {transfer.services.map((s, i) => {
              const manualPending = s.sentVia === "manual" && !s.requestSentAt;
              const canAskTenant = (s.meterReading || s.meterPhoto) && s.confirmToken && !s.confirmedByTenant;
              return (
                <li key={s._id} className="card status-item">
                  <div className="status-head">
                    <span>{serviceIcon(s.name)} {t(`service.${s.name}`)}</span>
                    <span className={"pill " + s.status.toLowerCase()}>{t(`status.${s.status}`)}</span>
                  </div>
                  {s.sentVia && (
                    <small>
                      {s.sentVia === "manual" && s.requestSentAt ? t("st.markedSelf") : t(`sentVia.${s.sentVia}`)}
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
                      onClick={() => api.markServiceSent(id, i).then(setTransfer).catch(err => setError(errText(err)))}
                    >
                      {t("st.iContacted")}
                    </button>
                  )}
                  {s.meterReading && <small>{t("st.reading", { value: s.meterReading })}</small>}
                  {s.confirmedByTenant && <small>✓ {t("st.tenantConfirmed")}</small>}
                  {canAskTenant && <TenantShare transfer={transfer} service={s} />}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Screen>
  );
}
