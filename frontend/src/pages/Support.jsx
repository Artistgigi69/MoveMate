import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdHelpOutline, MdExpandMore, MdSend } from "react-icons/md";
import HeaderScene from "../illustrations/HeaderScene";
import "./Support.css";

const FAQ_KEYS = [
  "transferUtility",
  "arnona",
  "twoFactor",
  "addCard",
  "cardSafety",
  "referrals",
  "reminders",
  "newTenant"
];

function Support() {

  const { t } = useTranslation();

  const [openFaq, setOpenFaq] = useState(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const loadTickets = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/support`, {
        headers: { Authorization: token }
      });

      setTickets(await res.json());

    } catch (error) {
      console.log(error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const submit = async (e) => {

    e.preventDefault();
    setSending(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ subject, message })
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || t("auth.serverError"));
        return;
      }

      toast.success(t("support.sent"));
      setSubject("");
      setMessage("");
      loadTickets();

    } catch (error) {
      console.log(error);
      toast.error(t("auth.serverError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="support-page">

      <div className="page-header-row">
        <div>
          <h1><MdHelpOutline /> {t("support.title")}</h1>
          <p className="subtitle">{t("support.subtitle")}</p>
        </div>
        <HeaderScene className="header-illustration" />
      </div>

      <div className="faq-card">
        <h2>{t("support.faqTitle")}</h2>

        {
          FAQ_KEYS.map(key => (
            <div className={`faq-item ${openFaq === key ? "open" : ""}`} key={key}>
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === key ? null : key)}
              >
                {t(`support.faq.${key}.q`)}
                <MdExpandMore className="faq-chevron" />
              </button>

              {
                openFaq === key && (
                  <p className="faq-answer">{t(`support.faq.${key}.a`)}</p>
                )
              }
            </div>
          ))
        }
      </div>

      <div className="contact-card">
        <h2>{t("support.contactTitle")}</h2>
        <p className="contact-hint">{t("support.contactHint")}</p>

        <form onSubmit={submit}>

          <div className="form-group">
            <label>{t("support.subjectLabel")}</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("support.subjectPlaceholder")}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("support.messageLabel")}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("support.messagePlaceholder")}
              required
            />
          </div>

          <button type="submit" className="support-submit-btn" disabled={sending}>
            <MdSend /> {sending ? t("common.loading") : t("support.sendButton")}
          </button>

        </form>
      </div>

      {
        !loadingTickets && tickets.length > 0 && (
          <div className="tickets-card">
            <h2>{t("support.myMessages")}</h2>

            {
              tickets.map(ticket => (
                <div className="ticket-row" key={ticket._id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <p>{ticket.message}</p>
                  </div>
                  <span className={`ticket-status ${ticket.status}`}>
                    {t(`support.status.${ticket.status}`)}
                  </span>
                </div>
              ))
            }
          </div>
        )
      }

    </div>
  );
}

export default Support;
