import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Bidi, FilePick, Screen, SignaturePad, Wait } from "../ui";
import { Icon } from "../icons";
import { useI18n } from "../i18n";
import { api, getToken, setToken } from "../api";
import { ELECTRICITY, gasProvider } from "../providers";
import AfterMove from "./AfterMove";

export function StatusList() {
  const { t, errText } = useI18n();
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!getToken()) return;
    api.isAdmin().then(setAdmin);
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
      {transfers === null && !error && <p className="note"><Wait label={t("common.loading")} /></p>}
      {transfers?.length === 0 && <p className="note">{t("st.empty")}</p>}

      <ul className="list">
        {transfers?.map(tr => {
          const done = tr.services.filter(s => s.status === "Completed").length;
          return (
            <li key={tr._id} className="card">
              <Link to={`/status/${tr._id}`} className="row-link">
                <span>
                  <strong>{tr.newAddress}</strong>
                  <small className="row-meta">
                    <bdi>{tr.moveDate}</bdi>
                    <span className="mini-icons">
                      {tr.services.map(s => <Icon key={s._id || s.name} name={s.name} size={14} />)}
                    </span>
                  </small>
                </span>
                <span className={"pill" + (done === tr.services.length ? " completed" : "")}>{done}/{tr.services.length}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <button className="btn ghost small with-icon" onClick={() => { setToken(null); window.location.href = "/"; }}>
        <Icon name="logout" size={18} className="flip-rtl" />{t("st.logout")}
      </button>
      {admin && <Link to="/admin" className="btn secondary small">{t("st.adminLink")}</Link>}
      <Link to="/account/delete" className="link-danger">{t("acc.link")}</Link>
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
        <button className="btn secondary small with-icon" onClick={copy}>
          <Icon name={copied ? "check" : "copy"} size={16} />{copied ? t("st.copied") : t("st.copy")}
        </button>
        <a
          className="btn secondary small with-icon"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="chat" size={16} />{t("st.whatsapp")}
        </a>
      </div>
    </div>
  );
}

export function StatusDetail() {
  const { id } = useParams();
  const { t, lang, errText, pick } = useI18n();
  const [transfer, setTransfer] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");
  // Index of the service whose "do it for me" consent box is open.
  const [askFor, setAskFor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [askError, setAskError] = useState("");
  // Power of attorney, asked once per transfer before the first hand-over.
  const [idFile, setIdFile] = useState(null);
  const [signature, setSignature] = useState(null);

  const openAsk = index => {
    setAskFor(index);
    setAskError("");
  };

  const handOver = async index => {
    setAskError("");
    const needAuth = !transfer.authorizedAt;
    if (needAuth && !idFile) return setAskError(t("poa.needId"));
    if (needAuth && !signature) return setAskError(t("poa.needSign"));

    setBusy(true);
    try {
      if (needAuth) {
        const png = await new Promise(resolve => signature.toBlob(resolve, "image/png"));
        setTransfer(await api.authorize(id, idFile, png));
      }
      setTransfer(await api.requestConcierge(id, index, lang));
      setAskFor(null);
    } catch (err) {
      setAskError(errText(err));
    } finally {
      setBusy(false);
    }
  };

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

  // One line on what to actually do with the links above.
  const howTo = s => {
    const date = transfer.moveDate;
    if (s.name === "arnona") return t("st.howArnona");
    if (s.name === "internet") return t("st.howInternet", { date });
    if (s.name === "gas" && !gasProvider(s.provider)?.url) return t("st.howGasCall", { date });
    return t("st.howTransfer", { date });
  };

  if (!getToken()) return <Navigate to="/auth" replace />;

  return (
    <Screen back="/status" title={t("st.detailTitle")}>
      {error && <p className="note error">{error}</p>}
      {!transfer && !error && <p className="note"><Wait label={t("common.loading")} /></p>}

      {transfer && (
        <>
          <div className="route card">
            <span className="route-point"><Icon name="home" size={18} /><bdi>{transfer.oldAddress}</bdi></span>
            <span className="route-point"><Icon name="pin" size={18} /><bdi>{transfer.newAddress}</bdi></span>
            <span className="route-point muted"><Icon name="calendar" size={18} /><bdi>{transfer.moveDate}</bdi></span>
          </div>

          {transfer.leaseFile && (
            <button
              className="btn secondary small with-icon"
              onClick={() => api.downloadLease(id).catch(err => setError(errText(err)))}
            >
              <Icon name="download" size={16} />{t("st.downloadLease")}{transfer.leaseFileName ? ` (${transfer.leaseFileName})` : ""}
            </button>
          )}

          <ul className="list">
            {transfer.services.map((s, i) => {
              const manualPending = s.sentVia === "manual" && !s.requestSentAt;
              // Staff couldn't do it: the user is back to doing it themselves.
              const handBack = s.sentVia === "concierge" && s.status === "Failed";
              const showSelf = manualPending || handBack;
              const canAskTenant = (s.meterReading || s.meterPhoto) && s.confirmToken && !s.confirmedByTenant;
              return (
                <li key={s._id} className="card status-item">
                  <div className="status-head">
                    <span className="status-name">
                      <span className={"choice-icon small svc-" + s.name}><Icon name={s.name} size={16} /></span>
                      {t(`service.${s.name}`)}
                    </span>
                    <span className={"pill " + s.status.toLowerCase()}>{t(`status.${s.status}`)}</span>
                  </div>
                  {s.sentVia && (
                    <small>
                      {s.sentVia === "manual" && s.requestSentAt ? t("st.markedSelf")
                        : s.sentVia === "concierge" && s.status === "Completed" ? t("con.done")
                        : handBack ? t("con.failed")
                        : t(`sentVia.${s.sentVia}`)}
                    </small>
                  )}
                  {s.conciergeNote && <small className="staff-note">{t("st.staffNote", { note: s.conciergeNote })}</small>}
                  {showSelf && selfServiceLinks(s).map(l => l.url ? (
                    <a key={l.text} className="form-link" href={l.url} target="_blank" rel="noreferrer">
                      {l.text} <Icon name="external" size={14} />
                    </a>
                  ) : (
                    <small key={l.text}>{l.text}</small>
                  ))}
                  {showSelf && <p className="how-hint"><Bidi text={howTo(s)} /></p>}
                  {manualPending && askFor !== i && (
                    <button className="btn secondary small" onClick={() => openAsk(i)}>{t("con.button")}</button>
                  )}
                  {manualPending && askFor === i && (
                    <div className="concierge-ask">
                      <p>{t("con.text", { service: t(`service.${s.name}`) })}</p>
                      {transfer.authorizedAt ? (
                        <small className="ok-line"><Icon name="check" size={14} strokeWidth={2.6} />{t("poa.done")}</small>
                      ) : (
                        <>
                          <p>{t("poa.needed")}</p>
                          <FilePick label={t("poa.idLabel")} accept="image/*,application/pdf" icon="file" file={idFile} onPick={setIdFile} />
                          <small>{t("poa.sign")}</small>
                          <SignaturePad onChange={setSignature} />
                          <small>{t("poa.text")}</small>
                        </>
                      )}
                      {askError && <p className="note error">{askError}</p>}
                      <div className="share-actions">
                        <button className="btn primary small" disabled={busy} onClick={() => handOver(i)}>
                          {busy ? <Wait /> : t("con.agree")}
                        </button>
                        <button className="btn ghost small" disabled={busy} onClick={() => setAskFor(null)}>{t("con.cancel")}</button>
                      </div>
                    </div>
                  )}
                  {showSelf && (
                    <button
                      className="btn ghost small"
                      onClick={() => api.markServiceSent(id, i).then(setTransfer).catch(err => setError(errText(err)))}
                    >
                      {t("st.iContacted")}
                    </button>
                  )}
                  {s.accountNumber && <small>{t("st.account", { value: s.accountNumber })}</small>}
                  {s.meterReading && <small>{t("st.reading", { value: s.meterReading })}</small>}
                  {s.confirmedByTenant && <small className="ok-line"><Icon name="check" size={14} strokeWidth={2.6} />{t("st.tenantConfirmed")}</small>}
                  {canAskTenant && <TenantShare transfer={transfer} service={s} />}
                </li>
              );
            })}
          </ul>

          <AfterMove transferId={id} />
        </>
      )}
    </Screen>
  );
}
