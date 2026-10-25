import { useNavigate } from "react-router-dom";
import { Screen } from "../ui";
import { SERVICES, useDraft } from "../draft";
import { useI18n } from "../i18n";

export default function Home() {
  const navigate = useNavigate();
  const { draft, reset } = useDraft();
  const { t } = useI18n();
  const hasDraft = Boolean(draft.oldAddress || draft.services.length);

  return (
    <Screen
      footer={
        <>
          <button className="btn primary" onClick={() => navigate("/addresses")}>
            {hasDraft ? t("home.continue") : t("home.start")}
          </button>
          {hasDraft && (
            <button className="btn ghost" onClick={() => { reset(); navigate("/addresses"); }}>
              {t("home.restart")}
            </button>
          )}
        </>
      }
    >
      <section className="hero">
        <h1>{t("home.title")}</h1>
        <p>{t("home.lead")}</p>
      </section>

      <ul className="service-row">
        {SERVICES.map(s => (
          <li key={s.key}><span>{s.icon}</span>{t(`service.${s.key}`)}</li>
        ))}
      </ul>

      <ol className="how">
        <li>{t("home.how1")}</li>
        <li>{t("home.how2")}</li>
        <li>{t("home.how3")}</li>
        <li>{t("home.how4")}</li>
      </ol>
    </Screen>
  );
}
