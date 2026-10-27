import { Screen } from "../ui";
import { useI18n } from "../i18n";
import { LEGAL, UPDATED } from "../legal";

// Emails are left-to-right inside Hebrew/Arabic text; without isolation the
// sentence's final period jumps to the front of the address.
function withLtrEmails(text) {
  return text.split(/(\S+@\S+?\.[a-z]+)/i).map((part, i) =>
    i % 2 ? <bdi key={i} dir="ltr">{part}</bdi> : part
  );
}

// /privacy and /terms — `doc` is "privacy" or "terms".
export default function Legal({ doc }) {
  const { t, lang } = useI18n();
  const sections = LEGAL[doc][lang] || LEGAL[doc].en;

  return (
    <Screen back="/" title={t(doc === "privacy" ? "legal.privacy" : "legal.terms")}>
      <p className="note">{t("legal.updated", { date: UPDATED })}</p>
      <article className="card legal">
        {sections.map(([heading, paragraphs]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            {paragraphs.map(p => <p key={p.slice(0, 40)}>{withLtrEmails(p)}</p>)}
          </section>
        ))}
      </article>
    </Screen>
  );
}
