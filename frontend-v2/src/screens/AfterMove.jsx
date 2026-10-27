import { useState } from "react";
import { Bidi, Section } from "../ui";
import { Icon } from "../icons";
import { useI18n } from "../i18n";
import { AFTER_MOVE, MOVING_GUIDE } from "../afterMove";

// Bottom of the request page: everything outside utilities that still needs
// the new address. Ticks are a per-device convenience, kept in localStorage.
export default function AfterMove({ transferId }) {
  const { t, lang } = useI18n();
  const storageKey = `mm2_after_${transferId}`;

  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch {
      return {};
    }
  });

  const toggle = key => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Not saved — the ticks just won't survive a reload.
    }
  };

  return (
    <Section icon="check" title={t("after.title")} note={t("after.note")}>
      <ul className="after-list">
        {AFTER_MOVE.map(item => (
          <li key={item.key} className={done[item.key] ? "done" : ""}>
            <label className="after-check">
              <input type="checkbox" checked={Boolean(done[item.key])} onChange={() => toggle(item.key)} />
              <span>
                <strong><Bidi text={t(`after.${item.key}`)} /></strong>
                <small><Bidi text={t(`after.${item.key}Hint`)} /></small>
              </span>
            </label>
            {item.url && (
              <a className="form-link" href={item.url} target="_blank" rel="noreferrer">
                {new URL(item.url).hostname.replace(/^www\./, "")} <Icon name="external" size={14} />
              </a>
            )}
          </li>
        ))}
      </ul>
      <a className="form-link" href={MOVING_GUIDE[lang] || MOVING_GUIDE.he} target="_blank" rel="noreferrer">
        {t("after.guide")} <Icon name="external" size={14} />
      </a>
    </Section>
  );
}
