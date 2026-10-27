import { Screen } from "../ui";
import { useI18n } from "../i18n";
import { LEGAL, UPDATED } from "../legal";

// Emails and phone numbers are left-to-right inside Hebrew/Arabic text;
// without isolation the final period jumps to the front of the address and
// 050-642-5151 reads backwards.
// On non-Hebrew pages Hebrew words (עוסק פטור) are isolated too; the last
// alternative is the Hebrew block, U+0590 to U+05FF.
const LTR = /(\S+@\S+?\.[a-z]+|\d{2,3}-\d{3}-\d{4})/i;
const LTR_OR_HEBREW = /(\S+@\S+?\.[a-z]+|\d{2,3}-\d{3}-\d{4}|[֐-׿][֐-׿\s"'-]*[֐-׿])/i;

function isolate(text, lang) {
  return text.split(lang === "he" ? LTR : LTR_OR_HEBREW).map((part, i) =>
    i % 2 ? <bdi key={i} dir={LTR.test(part) ? "ltr" : undefined}>{part}</bdi> : part
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
            {paragraphs.map(p => <p key={p.slice(0, 40)}>{isolate(p, lang)}</p>)}
          </section>
        ))}
      </article>
    </Screen>
  );
}
