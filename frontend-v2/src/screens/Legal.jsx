import { Screen } from "../ui";
import { useI18n } from "../i18n";
import { LEGAL, UPDATED } from "../legal";

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
            {paragraphs.map(p => <p key={p.slice(0, 40)}>{p}</p>)}
          </section>
        ))}
      </article>
    </Screen>
  );
}
