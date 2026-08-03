import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdEventAvailable, MdClose } from "react-icons/md";
import "./MoveReminderBanner.css";

const WINDOW_DAYS = 7;

function MoveReminderBanner() {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [reminder, setReminder] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {

    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/transfers`, {
          headers: { Authorization: token }
        });

        const transfers = await res.json();

        const now = new Date();

        const upcoming = (transfers || [])
          .map(t => ({ ...t, daysUntil: Math.ceil((new Date(t.moveDate) - now) / 86400000) }))
          .filter(t => !Number.isNaN(t.daysUntil) && t.daysUntil >= 0 && t.daysUntil <= WINDOW_DAYS)
          .sort((a, b) => a.daysUntil - b.daysUntil)[0];

        if (upcoming) {
          const dismissKey = `reminder-dismissed-${upcoming._id}-${new Date().toDateString()}`;
          if (!localStorage.getItem(dismissKey)) {
            setReminder(upcoming);
          }
        }

      } catch (error) {
        console.log(error);
      }
    };

    load();

  }, []);

  if (!reminder || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(`reminder-dismissed-${reminder._id}-${new Date().toDateString()}`, "1");
    setDismissed(true);
  };

  return (
    <div className="move-reminder-banner">
      <MdEventAvailable className="reminder-icon" />
      <p>
        {
          t("reminder.movingIn", {
            count: reminder.daysUntil,
            address: reminder.newAddress
          })
        }
      </p>
      <button className="reminder-checklist-btn" onClick={() => navigate("/checklist")}>
        {t("nav.checklist")}
      </button>
      <button className="reminder-close" onClick={dismiss} aria-label="Dismiss">
        <MdClose />
      </button>
    </div>
  );
}

export default MoveReminderBanner;
