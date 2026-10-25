import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Screen, SENT_VIA_LABELS } from "../ui";
import { SERVICES, useDraft } from "../draft";
import { api, getToken } from "../api";

const label = key => SERVICES.find(s => s.key === key)?.label || key;

export default function Submit() {
  const navigate = useNavigate();
  const { draft, files, reset } = useDraft();
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [transferId, setTransferId] = useState(null);

  if (!getToken()) return <Navigate to="/auth" replace />;
  if (draft.services.length === 0 && !transferId) return <Navigate to="/services" replace />;

  const hasTenant = Object.values(draft.newTenant).some(Boolean);

  // Idempotent per step: if uploads fail after the transfer was created, a
  // retry reuses it instead of creating a duplicate.
  const send = async () => {
    setError("");

    try {
      let id = transferId;

      if (!id) {
        setStage("Создаём заявку…");
        const created = await api.createTransfer({
          oldAddress: draft.oldAddress,
          newAddress: draft.newAddress,
          oldCity: draft.oldCity,
          newCity: draft.newCity,
          moveDate: draft.moveDate,
          applicant: draft.applicant,
          newTenant: hasTenant ? draft.newTenant : undefined,
          services: draft.services.map(name => ({ name, meterReading: draft.readings[name] || "" }))
        });
        id = created._id;
        setTransferId(id);
      }

      for (const [i, name] of draft.services.entries()) {
        const photo = files.photos[name];
        if (photo) {
          setStage(`Загружаем фото: ${label(name)}…`);
          await api.uploadMeterPhoto(id, i, photo, draft.readings[name]);
        }
      }

      if (files.lease) {
        setStage("Загружаем договор…");
        await api.uploadLease(id, files.lease);
      }

      setStage("Отправляем заявки…");
      await api.submitTransfer(id);

      reset();
      navigate(`/status/${id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setStage("");
    }
  };

  return (
    <Screen
      step={5}
      back="/details"
      title="Проверьте и отправьте"
      footer={
        <button className="btn primary" onClick={send} disabled={Boolean(stage)}>
          {stage || (transferId ? "Повторить отправку" : "Отправить заявки")}
        </button>
      }
    >
      <dl className="summary card">
        <dt>Откуда</dt><dd>{draft.oldAddress}, {draft.oldCityName || draft.oldCity}</dd>
        <dt>Куда</dt><dd>{draft.newAddress}, {draft.newCityName || draft.newCity}</dd>
        <dt>Дата</dt><dd>{draft.moveDate}</dd>
        <dt>Заявитель</dt><dd>{draft.applicant.name} · {draft.applicant.idNumber}</dd>
        {hasTenant && <><dt>Новый жилец</dt><dd>{draft.newTenant.name}</dd></>}
        <dt>Договор</dt><dd>{files.lease ? files.lease.name : "не приложен"}</dd>
      </dl>

      <ul className="list card">
        {draft.services.map(name => (
          <li key={name}>
            <span>{label(name)}</span>
            <small>
              {draft.readings[name] ? `показания ${draft.readings[name]}` : ""}
              {files.photos[name] ? " · фото ✓" : ""}
            </small>
          </li>
        ))}
      </ul>

      <p className="note">
        Арнону отправим письмом в муниципалитет, если для вашего города есть адрес.
        Остальное пока отметим как «{SENT_VIA_LABELS.manual.toLowerCase()}» — статус будет виден на следующем экране.
      </p>

      {error && <p className="note error">{error}</p>}
    </Screen>
  );
}
