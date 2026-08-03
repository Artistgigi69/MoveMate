import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  MdBolt,
  MdLocalFireDepartment,
  MdWaterDrop,
  MdAccountBalance,
  MdCreditCard,
  MdCalculate
} from "react-icons/md";
import "./UtilityDetail.css";

const UTILITIES = {
  electricity: {
    icon: MdBolt,
    gradient: "peach"
  },
  gas: {
    icon: MdLocalFireDepartment,
    gradient: "pink"
  },
  water: {
    icon: MdWaterDrop,
    gradient: "teal"
  },
  arnona: {
    icon: MdAccountBalance,
    gradient: "violet"
  }
};

function UtilityDetail() {

  const { t } = useTranslation();
  const { type } = useParams();
  const config = UTILITIES[type];
  const label = config ? t(`nav.${type}`) : "";

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [cardId, setCardId] = useState("");

  const [showCalculator, setShowCalculator] = useState(false);
  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [ratePerUnit, setRatePerUnit] = useState("");
  const [fixedFee, setFixedFee] = useState("");

  const consumption = Math.max(0, Number(currentReading || 0) - Number(previousReading || 0));
  const estimatedTotal = (consumption * Number(ratePerUnit || 0)) + Number(fixedFee || 0);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/expenses`, {
        headers: { Authorization: token }
      });

      const data = await res.json();

      setPayments(
        (data || []).filter(item => item.category === type)
      );

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/cards`, {
        headers: { Authorization: token }
      });

      const data = await res.json();
      setCards(data || []);

      const defaultCard = (data || []).find(c => c.isDefault) || data[0];
      if (defaultCard) setCardId(defaultCard._id);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPayments();
    loadCards();
    setAmount("");
  }, [type]);

  const total = payments.reduce((sum, item) => sum + Number(item.amount), 0);

  const pay = async (e) => {
    e.preventDefault();

    if (!cardId) {
      toast.error(t("utility.addCardFirst"));
      return;
    }

    const selectedCard = cards.find(c => c._id === cardId);
    const token = localStorage.getItem("token");

    try {

      // Real charge through Cardcom, using the saved card's token — no card
      // data involved on our side at all.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/cardcom/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          utilityType: type,
          amount: Number(amount),
          cardId
        })
      });

      if (res.status === 503) {
        // Gateway not configured yet (no merchant keys) — log the payment
        // in the app so the rest of the flow keeps working during dev,
        // but make it clear no money actually moved.
        await fetch(`${import.meta.env.VITE_API_URL}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            title: `${label} payment`,
            amount: Number(amount),
            category: type,
            description: selectedCard
              ? `Logged only — payment gateway not configured (${selectedCard.brand} •••• ${selectedCard.last4})`
              : "Logged only — payment gateway not configured"
          })
        });

        toast.info(t("utility.loggedNoGateway"));
        setShowPayModal(false);
        setAmount("");
        loadPayments();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || t("utility.paymentFailed"));
        return;
      }

      toast.success(t("utility.billPaid", { service: label }));
      setShowPayModal(false);
      setAmount("");
      loadPayments();

    } catch (error) {
      console.log(error);
      toast.error(t("auth.serverError"));
    }
  };

  if (!config) {
    return (
      <div className="utility-page">
        <h1>{t("utility.unknownService")}</h1>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="utility-page">

      <div className="utility-header">
        <div className={`utility-icon-badge ${config.gradient}`}>
          <Icon />
        </div>
        <div>
          <h1>{label}</h1>
          <p>{t("utility.trackAndPay", { service: label.toLowerCase() })}</p>
        </div>
      </div>

      <div className={`utility-total ${config.gradient}`}>
        <p>{t("dashboard.totalSpent")}</p>
        <h2>${total}</h2>
        <div className="utility-total-actions">
          <button className="pay-btn" onClick={() => setShowPayModal(true)}>
            {t("utility.payBill", { service: label })}
          </button>

          <button className="pay-btn ghost" onClick={() => setShowCalculator(true)}>
            <MdCalculate /> {t("utility.estimateBill")}
          </button>
        </div>
      </div>

      <div className="utility-history">
        <h2>{t("utility.paymentHistory")}</h2>

        {
          loading ? (
            <p className="utility-empty">{t("common.loading")}</p>
          ) : payments.length === 0 ? (
            <p className="utility-empty">{t("utility.noPaymentsYet", { service: label.toLowerCase() })}</p>
          ) : (
            payments.map(item => (
              <div className="utility-row" key={item._id}>
                <div>
                  <h3>{item.title}</h3>
                  <span>{item.description || t("utility.noDetails")}</span>
                </div>
                <strong>${item.amount}</strong>
              </div>
            ))
          )
        }
      </div>

      {
        showPayModal && (
          <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>

              <h2>{t("utility.payBill", { service: label })}</h2>

              {
                cards.length === 0 ? (
                  <p className="utility-empty">
                    {t("utility.noSavedCards")} <Link to="/cards">{t("utility.addOne")}</Link> {t("utility.toPay")}
                  </p>
                ) : (
                  <form onSubmit={pay}>

                    <div className="form-group">
                      <label>{t("expenses.amountLabel")}</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="$ 0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t("utility.payWith")}</label>
                      <select value={cardId} onChange={(e) => setCardId(e.target.value)} required>
                        {
                          cards.map(card => (
                            <option key={card._id} value={card._id}>
                              {card.brand} •••• {card.last4}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="modal-cancel"
                        onClick={() => setShowPayModal(false)}
                      >
                        {t("common.cancel")}
                      </button>

                      <button type="submit" className="pay-btn">
                        <MdCreditCard /> {t("utility.confirmPayment")}
                      </button>
                    </div>

                  </form>
                )
              }

            </div>
          </div>
        )
      }

      {
        showCalculator && (
          <div className="modal-overlay" onClick={() => setShowCalculator(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>

              <h2>{t("utility.estimateBill")}</h2>

              <div className="form-group">
                <label>{t("utility.previousReading")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("utility.currentReading")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("utility.ratePerUnit")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t("utility.fixedFee")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={fixedFee}
                  onChange={(e) => setFixedFee(e.target.value)}
                />
              </div>

              <div className="calc-result">
                <span>{t("utility.consumption")}: <strong>{consumption}</strong></span>
                <span>{t("utility.estimatedTotal")}: <strong>${estimatedTotal.toFixed(2)}</strong></span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowCalculator(false)}
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="button"
                  className="pay-btn"
                  onClick={() => {
                    setAmount(estimatedTotal.toFixed(2));
                    setShowCalculator(false);
                    setShowPayModal(true);
                  }}
                >
                  {t("utility.useAmount")}
                </button>
              </div>

            </div>
          </div>
        )
      }

    </div>
  );
}

export default UtilityDetail;
