import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdWorkspacePremium, MdCheck } from "react-icons/md";
import "./Premium.css";

function Premium() {

  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {

    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: { Authorization: token }
        });

        setUser(await res.json());

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, []);

  const upgrade = async () => {

    setUpgrading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/cardcom/upgrade-premium`, {
        method: "POST",
        headers: { Authorization: token }
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || t("premium.gatewayError"));
        setUpgrading(false);
        return;
      }

      window.location.href = data.url;

    } catch (error) {
      console.log(error);
      toast.error(t("auth.serverError"));
      setUpgrading(false);
    }
  };

  const isPremium = user?.plan === "premium" && user?.premiumUntil && new Date(user.premiumUntil) > new Date();

  const perks = [
    t("premium.perkBadge"),
    t("premium.perkSupport")
  ];

  return (
    <div className="premium-page">

      <div className="premium-hero">
        <MdWorkspacePremium className="premium-hero-icon" />
        <h1>{t("premium.title")}</h1>
        <p>{t("premium.subtitle")}</p>
      </div>

      {
        loading ? (
          <p className="premium-loading">{t("common.loading")}</p>
        ) : isPremium ? (
          <div className="premium-status active">
            <MdWorkspacePremium />
            <div>
              <strong>{t("premium.activeTitle")}</strong>
              <p>{t("premium.activeUntil", { date: new Date(user.premiumUntil).toLocaleDateString() })}</p>
            </div>
          </div>
        ) : (
          <div className="premium-card">

            <div className="premium-price">
              <span className="amount">₪19.90</span>
              <span className="period">/ {t("premium.perMonth")}</span>
            </div>

            <ul className="premium-perks">
              {perks.map((perk, i) => (
                <li key={i}><MdCheck /> {perk}</li>
              ))}
            </ul>

            <button className="premium-upgrade-btn" onClick={upgrade} disabled={upgrading}>
              {upgrading ? t("common.loading") : t("premium.upgradeButton")}
            </button>

            <p className="premium-honest-note">{t("premium.honestNote")}</p>

          </div>
        )
      }

    </div>
  );
}

export default Premium;
