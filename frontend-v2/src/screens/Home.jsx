import { useNavigate } from "react-router-dom";
import { Screen } from "../ui";
import { SERVICES, useDraft } from "../draft";

export default function Home() {
  const navigate = useNavigate();
  const { draft, reset } = useDraft();
  const hasDraft = Boolean(draft.oldAddress || draft.services.length);

  return (
    <Screen
      footer={
        <>
          <button className="btn primary" onClick={() => navigate("/addresses")}>
            {hasDraft ? "Продолжить" : "Начать"}
          </button>
          {hasDraft && (
            <button className="btn ghost" onClick={() => { reset(); navigate("/addresses"); }}>
              Начать заново
            </button>
          )}
        </>
      }
    >
      <section className="hero">
        <h1>Переезжаете? Переоформим коммуналку за вас</h1>
        <p>Один раз заполните адреса и данные — мы подготовим и отправим заявки. Регистрация понадобится только в конце.</p>
      </section>

      <ul className="service-row">
        {SERVICES.map(s => (
          <li key={s.key}><span>{s.icon}</span>{s.label}</li>
        ))}
      </ul>

      <ol className="how">
        <li>Старый и новый адрес, дата переезда</li>
        <li>Какие услуги переоформить</li>
        <li>Ваши данные, фото счётчиков, договор</li>
        <li>Отправка и отслеживание статуса</li>
      </ol>
    </Screen>
  );
}
