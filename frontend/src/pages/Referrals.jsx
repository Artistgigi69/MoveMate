import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdCardGiftcard, MdContentCopy, MdPerson } from "react-icons/md";
import HeaderScene from "../illustrations/HeaderScene";
import "./Referrals.css";

function Referrals() {

  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/referrals`, {
          headers: { Authorization: token }
        });

        const json = await res.json();
        setData(json);

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, []);

  const link = data ? `${window.location.origin}/register?ref=${data.referralCode}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success(t("referral.copied"));
  };

  return (
    <div className="referrals-page">

      <div className="page-header-row">
        <div>
          <h1><MdCardGiftcard /> {t("referral.title")}</h1>
          <p className="subtitle">{t("referral.subtitle")}</p>
        </div>
        <HeaderScene className="header-illustration" />
      </div>

      {
        loading ? (
          <p className="referrals-empty">{t("common.loading")}</p>
        ) : (
          <>
            <div className="referral-link-card">
              <p className="referral-code">{data.referralCode}</p>
              <div className="referral-link-row">
                <input readOnly value={link} onFocus={(e) => e.target.select()} />
                <button onClick={copyLink}><MdContentCopy /> {t("referral.copyLink")}</button>
              </div>
            </div>

            <div className="referral-stats-card">
              <span className="referral-count">{data.referredCount}</span>
              <span className="referral-count-label">{t("referral.peopleReferred")}</span>
            </div>

            <div className="referral-list">
              <h2>{t("referral.yourReferrals")}</h2>

              {
                data.referred.length === 0 ? (
                  <p className="referrals-empty">{t("referral.noneYet")}</p>
                ) : (
                  data.referred.map(u => (
                    <div className="referral-row" key={u._id}>
                      <MdPerson />
                      <span>{u.username}</span>
                      <small>{new Date(u.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))
                )
              }
            </div>
          </>
        )
      }

    </div>
  );
}

export default Referrals;
