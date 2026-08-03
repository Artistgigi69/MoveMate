import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdCheckCircle, MdError } from "react-icons/md";
import "./CardcomCallback.css";

function CardcomCallback() {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("pending");
  const [purpose, setPurpose] = useState(null);

  useEffect(() => {

    const lowProfileId = searchParams.get("lowProfileId");
    const failed = searchParams.get("failed");

    if (!lowProfileId || failed) {
      setStatus("failed");
      return;
    }

    const finalize = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/payments/cardcom/result/${lowProfileId}`,
          { headers: { Authorization: token } }
        );

        const data = await res.json();

        if (!res.ok || data.status !== "completed") {
          setStatus("failed");
          return;
        }

        setStatus("success");
        setPurpose(data.purpose);

        if (data.purpose === "utility-payment") {
          toast.success(t("cards.paymentSuccess"));
        } else if (data.purpose === "upgrade-premium") {
          toast.success(t("premium.activeTitle"));
        } else {
          toast.success(t("cards.cardAdded"));
        }

      } catch (error) {
        console.log(error);
        setStatus("failed");
      }
    };

    finalize();

  }, [searchParams, t]);

  useEffect(() => {

    if (status === "success" || status === "failed") {
      const destination = purpose === "upgrade-premium" ? "/premium" : "/cards";
      const timeout = setTimeout(() => navigate(destination), 2200);
      return () => clearTimeout(timeout);
    }

  }, [status, purpose, navigate]);

  return (
    <div className="cardcom-callback-page">
      <div className="cardcom-callback-box">
        {
          status === "pending" ? (
            <p>{t("common.loading")}</p>
          ) : status === "success" ? (
            <>
              <MdCheckCircle className="callback-icon success" />
              <p>{t("cards.callbackSuccess")}</p>
            </>
          ) : (
            <>
              <MdError className="callback-icon failed" />
              <p>{t("cards.callbackFailed")}</p>
            </>
          )
        }
      </div>
    </div>
  );
}

export default CardcomCallback;
