import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api, getToken } from "../api";
import { BUSINESS } from "../business";

const OSEK = ["עוסק פטור", BUSINESS.osekNumber].filter(Boolean).join(" ");

// /admin/poa/:id — the user's power of attorney as a printable Hebrew page
// (providers are Israeli), with the signature they drew. Staff print it to
// PDF and attach it to the provider's form. Draft wording: have a lawyer
// review it before relying on it.
export default function Poa() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [cities, setCities] = useState([]);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    api.adminTransfer(id)
      .then(data => {
        setT(data);
        if (data.hasSignature) {
          api.adminImageUrl(`/admin/transfers/${id}/signature`).then(setSignature).catch(() => {});
        }
      })
      .catch(err => setError(err.message));
    api.municipalities().then(setCities).catch(() => setCities([]));
  }, [id]);

  if (!getToken()) return <Navigate to="/auth" replace />;
  if (error) return <p className="note error poa-page">{error}</p>;
  if (!t) return <p className="note poa-page">טוען…</p>;

  const city = key => cities.find(c => c.key === key)?.names.he || key;
  const p = t.applicant || {};
  const signed = t.authorizedAt ? new Date(t.authorizedAt).toLocaleDateString("he-IL") : "—";

  return (
    <article className="poa-page" dir="rtl" lang="he">
      <button className="btn secondary small no-print" onClick={() => window.print()}>הדפסה / שמירה כ-PDF</button>

      <h1>ייפוי כוח</h1>

      <p>
        אני הח"מ, <strong>{p.name}</strong>, ת"ז <strong><bdi>{p.idNumber}</bdi></strong>, טלפון <bdi>{p.phone}</bdi>,
        מייפה בזאת את כוחם של MoveMate ({OSEK}) ונציגיה לפנות בשמי לחברת החשמל לישראל, לתאגידי המים והביוב,
        לחברות הגז, לספקי האינטרנט ולרשויות המקומיות, ולבצע את הפעולות הנדרשות להעברת החשבונות
        והחלפת המחזיקים בעקבות מעבר הדירה:
      </p>

      <ul>
        <li>מהנכס: <bdi>{t.oldAddress}</bdi>, {city(t.oldCity)}</li>
        <li>לנכס: <bdi>{t.newAddress}</bdi>, {city(t.newCity)}</li>
        <li>תאריך המעבר: <bdi>{t.moveDate}</bdi></li>
      </ul>

      <p>
        ייפוי כוח זה מוגבל לפעולות הנדרשות להעברת החשבונות בעקבות המעבר האמור בלבד,
        ואינו מתיר ביצוע תשלומים או כל פעולה כספית אחרת בשמי.
      </p>

      <p>נחתם באופן אלקטרוני באתר MoveMate בתאריך <bdi>{signed}</bdi>.</p>

      <div className="poa-sign">
        {signature ? <img src={signature} alt="חתימה" /> : <span>אין חתימה</span>}
        <span>{p.name}</span>
      </div>
    </article>
  );
}
