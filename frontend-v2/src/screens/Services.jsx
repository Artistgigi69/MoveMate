import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Screen } from "../ui";
import { SERVICES, useDraft } from "../draft";

export default function Services() {
  const navigate = useNavigate();
  const { draft, update } = useDraft();
  const [error, setError] = useState("");

  const toggle = key => {
    setError("");
    update({
      services: draft.services.includes(key)
        ? draft.services.filter(s => s !== key)
        : [...draft.services, key]
    });
  };

  const next = () => {
    if (draft.services.length === 0) {
      setError("Выберите хотя бы одну услугу");
      return;
    }
    navigate("/details");
  };

  return (
    <Screen
      step={2}
      back="/addresses"
      title="Что переоформить?"
      footer={<button className="btn primary" onClick={next}>Дальше</button>}
    >
      <div className="choices">
        {SERVICES.map(s => {
          const on = draft.services.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              className={"choice" + (on ? " on" : "")}
              aria-pressed={on}
              onClick={() => toggle(s.key)}
            >
              <span className="choice-icon">{s.icon}</span>
              <span className="choice-label">{s.label}</span>
              <span className="choice-check">{on ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn ghost small"
        onClick={() => update({ services: SERVICES.map(s => s.key) })}
      >
        Выбрать всё
      </button>

      {error && <p className="note error">{error}</p>}
    </Screen>
  );
}
